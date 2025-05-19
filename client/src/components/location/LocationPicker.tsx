import React, { useState, useEffect } from 'react';
import { useLocation, LocationData } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Loader2,
  Home
} from 'lucide-react';

// Save location to localStorage
const saveLocation = (location: LocationData) => {
  localStorage.setItem('userLocation', JSON.stringify(location));
};

// Get location from localStorage
const getSavedLocation = (): LocationData | null => {
  try {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error parsing saved location:', error);
    localStorage.removeItem('userLocation'); // Clear the invalid data
    return null;
  }
};

export interface LocationPickerProps {
  onLocationSelect?: (location: LocationData) => void;
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { location, error, loading, getAddressFromCoords } = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(getSavedLocation());

  // Initialize with saved location if available
  useEffect(() => {
    const saved = getSavedLocation();
    if (saved) {
      setSelectedLocation(saved);
    }
  }, []);

  // When location is fetched, get the address if needed
  useEffect(() => {
    if (location && !location.address && location.latitude && location.longitude) {
      getAddressFromCoords(location.latitude, location.longitude);
    }
  }, [location]);

  // Search for locations by query
  const searchLocations = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching locations:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection
  const handleSelectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
    saveLocation(loc);
    if (onLocationSelect) {
      onLocationSelect(loc);
    }
    setIsOpen(false);
  };

  // Handle current location selection
  const handleUseCurrentLocation = async () => {
    if (location) {
      handleSelectLocation(location);
    }
  };

  // Handle search result selection
  const handleSelectSearchResult = (result: any) => {
    const newLocation: LocationData = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      state: result.address?.state,
      country: result.address?.country
    };
    handleSelectLocation(newLocation);
  };

  return (
    <>
      <div 
        className="flex items-center space-x-1 cursor-pointer" 
        onClick={() => setIsOpen(true)}
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="text-sm truncate max-w-[150px]">
          {selectedLocation ? 
            (selectedLocation.city || 'Selected Location') :
            'Select Location'
          }
        </span>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your Location</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Current location */}
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Navigation className="h-4 w-4 mr-2 text-primary" />
                Use current location
              </h3>
              
              {loading ? (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Detecting your location...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-destructive">{error}</div>
              ) : location ? (
                <div>
                  <p className="text-sm mb-2">
                    {location.address || 'Location detected'}
                  </p>
                  <Button 
                    size="sm" 
                    onClick={handleUseCurrentLocation}
                  >
                    Use This Location
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We couldn't detect your location automatically.
                </p>
              )}
            </div>
            
            {/* Search for location */}
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Search className="h-4 w-4 mr-2 text-primary" />
                Search for a location
              </h3>
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter city, area or neighborhood"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => searchLocations(searchQuery)}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-[200px] overflow-y-auto">
                  <ul className="space-y-2">
                    {searchResults.map((result) => (
                      <li 
                        key={result.place_id} 
                        className="p-2 hover:bg-accent rounded cursor-pointer text-sm"
                        onClick={() => handleSelectSearchResult(result)}
                      >
                        <div className="font-medium">{result.address?.road || result.name}</div>
                        <div className="text-muted-foreground truncate">{result.display_name}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Saved location */}
            {selectedLocation && (
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <Home className="h-4 w-4 mr-2 text-primary" />
                  Saved location
                </h3>
                <p className="text-sm">{selectedLocation.address}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}