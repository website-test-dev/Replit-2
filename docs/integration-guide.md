# Integration Guide for Fashion Express Platform

This guide provides detailed information on implementing Supabase integration, location API, and maps integration for the Fashion Express platform.

## Supabase Integration

Supabase is an open-source alternative to Firebase that provides a PostgreSQL database, authentication, real-time subscriptions, and storage.

### Setting Up Supabase

1. **Create a Supabase Project**
   - Sign up at [Supabase](https://supabase.com)
   - Create a new project
   - Note your project URL and public anon key

2. **Connecting to Supabase Database**
   - Go to the Project Settings > Database
   - Get your database connection string
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Environment Configuration**
   ```
   DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
   SUPABASE_URL=https://[project-ref].supabase.co
   SUPABASE_KEY=[your-anon-key]
   ```

### Real-time Data with Supabase

Implement real-time data updates with Supabase subscriptions:

```javascript
// client/src/hooks/useRealtimeData.ts
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export function useRealtimeProducts(categoryId?: number) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetchProducts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:products')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'products',
          ...(categoryId ? { filter: `categoryId=eq.${categoryId}` } : {})
        }, 
        (payload) => {
          fetchProducts(); // Refetch on any change
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [categoryId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from('products').select('*');
      
      if (categoryId) {
        query = query.eq('categoryId', categoryId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setProducts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error };
}
```

### Authentication with Supabase

Implement user authentication:

```javascript
// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication hooks
export const signUp = async (email, password, userData) => {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { user, error };
};

export const signIn = async (email, password) => {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { user, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};
```

## Location API Integration

Integrate location detection and services to enhance user experience.

### Browser Geolocation API

Implement browser-based location detection:

```javascript
// client/src/hooks/useLocation.ts
import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return { location, error, loading };
}
```

### Reverse Geocoding with OpenCage Data API

Convert coordinates to human-readable addresses:

```javascript
// client/src/services/geocoding.ts
export async function reverseGeocode(latitude, longitude) {
  const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=en`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        formatted: result.formatted,
        city: result.components.city || result.components.town,
        state: result.components.state,
        country: result.components.country,
        postcode: result.components.postcode
      };
    }
    throw new Error('No results found');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}
```

## Google Maps Integration

Integrate Google Maps for location visualization and store locator functionality.

### Setting Up Google Maps

1. **Get Google Maps API Key**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Maps JavaScript API, Geocoding API, and Places API
   - Create API key with appropriate restrictions

2. **Install Required Packages**
   ```bash
   npm install @react-google-maps/api
   ```

3. **Implementing Google Maps Component**

```javascript
// client/src/components/maps/StoreLocator.tsx
import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};
const center = {
  lat: 28.7041, // Default center (adjust as needed)
  lng: 77.1025,
};

interface Store {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  phone: string;
}

const stores: Store[] = [
  {
    id: 1,
    name: 'Fashion Express - Main Store',
    location: { lat: 28.7041, lng: 77.1025 },
    address: '123 Fashion Street, New Delhi',
    phone: '+91 98765 43210',
  },
  {
    id: 2,
    name: 'Fashion Express - City Center',
    location: { lat: 28.6942, lng: 77.1534 },
    address: '456 Mall Road, New Delhi',
    phone: '+91 98765 43211',
  },
  // Add more store locations
];

export default function StoreLocator() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries as any,
  });

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  };

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    // Automatically try to get user location when map loads
    getUserLocation();
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="store-locator">
      <h2>Find Our Stores</h2>
      <div className="map-controls">
        <button onClick={getUserLocation} className="locate-me-btn">
          Locate Me
        </button>
      </div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={userLocation || center}
        onLoad={onMapLoad}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            title="Your Location"
          />
        )}

        {/* Store markers */}
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={store.location}
            onClick={() => setSelectedStore(store)}
          />
        ))}

        {/* Info window for selected store */}
        {selectedStore && (
          <InfoWindow
            position={selectedStore.location}
            onCloseClick={() => setSelectedStore(null)}
          >
            <div className="store-info">
              <h3>{selectedStore.name}</h3>
              <p>{selectedStore.address}</p>
              <p>Phone: {selectedStore.phone}</p>
              <button
                onClick={() => {
                  // Generate directions URL
                  const directionsUrl = userLocation
                    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedStore.location.lat},${selectedStore.location.lng}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${selectedStore.location.lat},${selectedStore.location.lng}`;
                  window.open(directionsUrl, '_blank');
                }}
              >
                Get Directions
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Store list */}
      <div className="store-list">
        <h3>Our Locations</h3>
        <ul>
          {stores.map((store) => (
            <li key={store.id} onClick={() => setSelectedStore(store)}>
              <h4>{store.name}</h4>
              <p>{store.address}</p>
              <p>{store.phone}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### Delivery Tracking with Maps

Implement a delivery tracking component:

```javascript
// client/src/components/maps/DeliveryTracking.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

interface DeliveryStatus {
  orderId: string;
  status: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedDelivery: string;
}

export default function DeliveryTracking({ orderId }: { orderId: string }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries as any,
  });

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryStatus | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
  // In a real app, this would fetch from an API that updates in real-time
  useEffect(() => {
    // Simulating an API call to get delivery status
    const mockDeliveryInfo: DeliveryStatus = {
      orderId: orderId,
      status: 'In Transit',
      currentLocation: { lat: 28.6942, lng: 77.1534 },
      destination: { 
        lat: 28.7041, 
        lng: 77.1025,
        address: '123 Fashion Street, New Delhi'
      },
      estimatedDelivery: '2023-05-19T15:30:00Z',
    };
    
    setDeliveryInfo(mockDeliveryInfo);
    
    // In a real implementation, you might set up a websocket or polling
    const interval = setInterval(() => {
      // Simulate delivery vehicle movement
      if (deliveryInfo) {
        setDeliveryInfo(prev => {
          if (!prev) return prev;
          
          // Move slightly towards destination
          const newLat = prev.currentLocation.lat + 
            (prev.destination.lat - prev.currentLocation.lat) * 0.1;
          const newLng = prev.currentLocation.lng + 
            (prev.destination.lng - prev.currentLocation.lng) * 0.1;
            
          return {
            ...prev,
            currentLocation: { lat: newLat, lng: newLng }
          };
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;
  if (!deliveryInfo) return <div>Loading delivery information...</div>;

  const center = {
    lat: (deliveryInfo.currentLocation.lat + deliveryInfo.destination.lat) / 2,
    lng: (deliveryInfo.currentLocation.lng + deliveryInfo.destination.lng) / 2,
  };

  // Calculate the path between current location and destination
  const path = [
    deliveryInfo.currentLocation,
    deliveryInfo.destination
  ];

  return (
    <div className="delivery-tracking">
      <h2>Order Tracking</h2>
      <div className="tracking-details">
        <p><strong>Order ID:</strong> {deliveryInfo.orderId}</p>
        <p><strong>Status:</strong> {deliveryInfo.status}</p>
        <p><strong>Estimated Delivery:</strong> {new Date(deliveryInfo.estimatedDelivery).toLocaleString()}</p>
      </div>
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
        onLoad={onMapLoad}
      >
        {/* Delivery vehicle marker */}
        <Marker
          position={deliveryInfo.currentLocation}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/delivery.png',
            scaledSize: new window.google.maps.Size(40, 40),
          }}
          onClick={() => setSelectedMarker('delivery')}
        />
        
        {/* Destination marker */}
        <Marker
          position={deliveryInfo.destination}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(40, 40),
          }}
          onClick={() => setSelectedMarker('destination')}
        />
        
        {/* Route line */}
        <Polyline
          path={path}
          options={{
            strokeColor: '#0088FF',
            strokeOpacity: 0.8,
            strokeWeight: 3,
          }}
        />
        
        {/* Info windows */}
        {selectedMarker === 'delivery' && (
          <InfoWindow
            position={deliveryInfo.currentLocation}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h3>Delivery Vehicle</h3>
              <p>Your order is on the way!</p>
              <p>Status: {deliveryInfo.status}</p>
            </div>
          </InfoWindow>
        )}
        
        {selectedMarker === 'destination' && (
          <InfoWindow
            position={deliveryInfo.destination}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h3>Delivery Destination</h3>
              <p>{deliveryInfo.destination.address}</p>
              <p>Estimated arrival: {new Date(deliveryInfo.estimatedDelivery).toLocaleTimeString()}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
```

## Implementing Seller Products Management API

Create a backend API for sellers to manage their products:

```javascript
// server/routes.ts (add to existing routes)

// Seller product management routes
app.post("/api/seller/products", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Check if user is a seller
    if (!user.isSeller) {
      return res.status(403).json({ message: "Access denied. User is not a seller." });
    }
    
    const productData = {
      ...req.body,
      sellerId: user.id
    };
    
    // Validate product data
    const validatedData = insertProductSchema.parse(productData);
    
    // Create the product
    const newProduct = await storage.createProduct(validatedData);
    
    res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Error creating product" });
  }
});

app.get("/api/seller/products", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Check if user is a seller
    if (!user.isSeller) {
      return res.status(403).json({ message: "Access denied. User is not a seller." });
    }
    
    // Query to get all products by this seller
    // This would need to be implemented in the storage interface
    const sellerProducts = await storage.getProductsBySeller(user.id);
    
    res.json(sellerProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.put("/api/seller/products/:id", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    // Check if user is a seller
    if (!user.isSeller) {
      return res.status(403).json({ message: "Access denied. User is not a seller." });
    }
    
    // Check if product belongs to the seller
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.sellerId !== user.id) {
      return res.status(403).json({ message: "Access denied. Product belongs to another seller." });
    }
    
    // Update the product
    const updatedProduct = await storage.updateProduct(productId, req.body);
    
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Error updating product" });
  }
});

app.delete("/api/seller/products/:id", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const productId = parseInt(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    // Check if user is a seller
    if (!user.isSeller) {
      return res.status(403).json({ message: "Access denied. User is not a seller." });
    }
    
    // Check if product belongs to the seller
    const product = await storage.getProduct(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.sellerId !== user.id) {
      return res.status(403).json({ message: "Access denied. Product belongs to another seller." });
    }
    
    // Delete the product
    // This would need to be implemented in the storage interface
    const deleted = await storage.deleteProduct(productId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Bulk product upload API
app.post("/api/seller/products/bulk", isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Check if user is a seller
    if (!user.isSeller) {
      return res.status(403).json({ message: "Access denied. User is not a seller." });
    }
    
    // Validate and process bulk data
    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid product data. Expected an array of products." });
    }
    
    // Process each product
    const results = await Promise.all(
      products.map(async (product) => {
        try {
          const productData = {
            ...product,
            sellerId: user.id
          };
          
          // Validate product data
          const validatedData = insertProductSchema.parse(productData);
          
          // Create the product
          const newProduct = await storage.createProduct(validatedData);
          
          return { success: true, product: newProduct };
        } catch (error) {
          return { 
            success: false, 
            product: product,
            error: error instanceof z.ZodError ? error.errors[0].message : "Unknown error" 
          };
        }
      })
    );
    
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;
    
    res.status(201).json({
      message: `Processed ${results.length} products. Success: ${successCount}, Failed: ${failedCount}`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: "Error processing bulk upload" });
  }
});
```

## Required API Keys and Environment Variables

To implement these integrations, you'll need the following API keys and environment variables:

1. **Supabase Configuration**
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_KEY` - Your Supabase public anon key
   - `DATABASE_URL` - PostgreSQL connection string for your Supabase database

2. **Google Maps API**
   - `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key with Maps JavaScript API, Geocoding API, and Places API enabled

3. **OpenCage Geocoding API**
   - `VITE_OPENCAGE_API_KEY` - API key for reverse geocoding

Remember to keep all API keys secure and don't commit them to your repository. Use environment variables and a `.env` file to store them.