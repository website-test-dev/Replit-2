import React, { useState, useEffect } from 'react';
import { LocationData } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Navigation,
  Store,
  Phone,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Static data for store locations - in a real app, this would come from an API
const storeLocations = [
  {
    id: 1,
    name: 'Fashion Express - Flagship Store',
    address: '123 Fashion Street, Mumbai, 400001',
    phone: '+91 98765 43210',
    hours: '10:00 AM - 9:00 PM',
    location: { latitude: 19.0760, longitude: 72.8777 } // Mumbai coordinates
  },
  {
    id: 2,
    name: 'Fashion Express - City Center',
    address: '456 Mall Road, Delhi, 110001',
    phone: '+91 98765 43211',
    hours: '11:00 AM - 8:00 PM',
    location: { latitude: 28.7041, longitude: 77.1025 } // Delhi coordinates
  },
  {
    id: 3,
    name: 'Fashion Express - South Point',
    address: '789 Main Street, Bangalore, 560001',
    phone: '+91 98765 43212',
    hours: '10:00 AM - 9:00 PM',
    location: { latitude: 12.9716, longitude: 77.5946 } // Bangalore coordinates
  },
  {
    id: 4,
    name: 'Fashion Express - Beach Road',
    address: '21 Beach Road, Chennai, 600001',
    phone: '+91 98765 43213',
    hours: '10:30 AM - 8:30 PM',
    location: { latitude: 13.0827, longitude: 80.2707 } // Chennai coordinates
  },
  {
    id: 5,
    name: 'Fashion Express - Premium Outlet',
    address: '35 Express Way, Hyderabad, 500001',
    phone: '+91 98765 43214',
    hours: '11:00 AM - 10:00 PM',
    location: { latitude: 17.3850, longitude: 78.4867 } // Hyderabad coordinates
  }
];

export interface StoreLocatorProps {
  userLocation?: LocationData;
}

export function StoreLocator({ userLocation }: StoreLocatorProps) {
  const [selectedStore, setSelectedStore] = useState<typeof storeLocations[0] | null>(null);
  const [nearestStores, setNearestStores] = useState(storeLocations);

  // Calculate distance between two coordinates in kilometers using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  // Sort stores by distance from user's location
  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const storesWithDistance = storeLocations.map(store => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.location.latitude,
          store.location.longitude
        );
        return { ...store, distance };
      });
      
      // Sort by distance
      storesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setNearestStores(storesWithDistance);
    }
  }, [userLocation]);

  // Get directions to a store
  const getDirections = (store: typeof storeLocations[0]) => {
    const baseUrl = 'https://www.google.com/maps/dir/?api=1';
    const destination = `${store.location.latitude},${store.location.longitude}`;
    
    let url = `${baseUrl}&destination=${destination}`;
    
    // Add origin if user location is available
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      url += `&origin=${origin}`;
    }
    
    window.open(url, '_blank');
  };

  return (
    <div className="store-locator">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Our Stores</h2>
          <div className="space-y-4">
            {nearestStores.map(store => (
              <Card 
                key={store.id} 
                className={`cursor-pointer transition-shadow hover:shadow-md ${selectedStore?.id === store.id ? 'border-primary' : ''}`}
                onClick={() => setSelectedStore(store)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Store className="h-4 w-4 mr-2 text-primary" />
                    {store.name}
                  </CardTitle>
                  {('distance' in store) && (
                    <CardDescription>
                      {(store.distance as number).toFixed(1)} km away
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm space-y-1">
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {store.address}
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {store.phone}
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {store.hours}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      getDirections(store);
                    }}
                    className="w-full"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="rounded-lg overflow-hidden shadow-md bg-gray-100 h-[500px] flex items-center justify-center">
            <div className="text-center p-8">
              <h3 className="text-lg font-medium mb-2">Map View</h3>
              <p className="text-muted-foreground mb-4">
                In a complete implementation, this area would display an interactive Google Maps component showing store locations and allowing for navigation.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" disabled>
                  <MapPin className="h-4 w-4 mr-2" />
                  Google Maps Integration
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                To implement this feature, you would need to:
                <br />1. Obtain a Google Maps API key
                <br />2. Install the @react-google-maps/api package
                <br />3. Configure the maps component with markers for each store
              </p>
            </div>
          </div>
          
          {selectedStore && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedStore.name}</CardTitle>
                  <CardDescription>Store Details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Address:</strong> {selectedStore.address}</p>
                    <p><strong>Phone:</strong> {selectedStore.phone}</p>
                    <p><strong>Hours:</strong> {selectedStore.hours}</p>
                    {('distance' in selectedStore) && (
                      <p><strong>Distance:</strong> {(selectedStore.distance as number).toFixed(1)} km</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => getDirections(selectedStore)}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}