import { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface AvailableLocation {
  id: number;
  name: string;
  deliveryTime: string;
}

const popularLocations: AvailableLocation[] = [
  { id: 1, name: "Mumbai", deliveryTime: "Same day" },
  { id: 2, name: "Delhi", deliveryTime: "Next day" },
  { id: 3, name: "Bangalore", deliveryTime: "Same day" },
  { id: 4, name: "Hyderabad", deliveryTime: "1-2 days" },
  { id: 5, name: "Chennai", deliveryTime: "Next day" },
  { id: 6, name: "Kolkata", deliveryTime: "1-2 days" },
];

const LocationPicker = () => {
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredLocations, setFilteredLocations] = useState<AvailableLocation[]>(popularLocations);
  
  // When component mounts, try to get user's location
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      setCurrentLocation(savedLocation);
    } else {
      // Ask for user's location if not already saved
      getUserLocation();
    }
  }, []);

  // Filter locations based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLocations(popularLocations);
    } else {
      const filtered = popularLocations.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm]);

  const getUserLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Normally, you would reverse geocode the coordinates to get the city name
          // For this demo, we'll just set a default city
          const defaultCity = "Mumbai";
          setCurrentLocation(defaultCity);
          localStorage.setItem("userLocation", defaultCity);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setCurrentLocation("Select location");
          setIsLoading(false);
        },
        { timeout: 5000 }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      setCurrentLocation("Select location");
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (location: string) => {
    setCurrentLocation(location);
    localStorage.setItem("userLocation", location);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-sm font-medium"
        >
          <MapPin size={16} className="text-primary" />
          <span className="max-w-[100px] truncate">
            {isLoading ? "Detecting..." : currentLocation || "Select location"}
          </span>
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <h3 className="font-medium mb-2">Select Delivery Location</h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="location-search">Search</Label>
              <Input 
                id="location-search"
                placeholder="Enter your city"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs w-full"
                onClick={getUserLocation}
              >
                <MapPin size={14} className="mr-2 text-primary" />
                Use my current location
              </Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="p-2 max-h-[200px] overflow-y-auto">
          <p className="text-xs text-muted-foreground px-2 py-1">POPULAR CITIES</p>
          {filteredLocations.length > 0 ? (
            <div className="space-y-1">
              {filteredLocations.map((location) => (
                <Button
                  key={location.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left flex items-center"
                  onClick={() => handleSelectLocation(location.name)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Delivery: {location.deliveryTime}
                    </div>
                  </div>
                  {currentLocation === location.name && (
                    <div className="h-2 w-2 rounded-full bg-primary ml-2"></div>
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <div className="p-2 text-center text-sm text-muted-foreground">
              No locations found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LocationPicker;