import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X 
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { LocationPicker } from "../location/LocationPicker";

interface CurrentUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

const Header = () => {
  const [location, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const isMobile = useMobile();

  // Fetch current user
  const { data: currentUser } = useQuery<CurrentUser>({
    queryKey: ["/api/auth/user"],
    onError: () => { /* Silently handle auth error */ },
  });

  // Logout mutation
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
  });

  // Get cart count
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!currentUser,
    onError: () => { /* Silently handle error */ },
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="sticky top-0 bg-white shadow-md z-40">
      <div className="bg-gray-100 py-1">
        <div className="container mx-auto px-4 flex justify-end text-xs font-medium">
          <div className="flex items-center space-x-4">
            <Link href="/order-tracking" className="text-foreground hover:text-primary transition-colors duration-200">
              Track Order
            </Link>
            <span className="text-gray-400">|</span>
            <Link href="/contact" className="text-foreground hover:text-primary transition-colors duration-200">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-poppins font-bold text-2xl">
              <span className="text-primary">Fashion</span>
              <span className="text-secondary">Express</span>
            </span>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
              Home
            </Link>
            <Link href="/products" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
              Women
            </Link>
            <Link href="/products" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
              Men
            </Link>
            <Link href="/products" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
              Kids
            </Link>
            <Link href="/products" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
              Accessories
            </Link>
            <Link href="/products?sale=true" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
              Sale
            </Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative flex-1 max-w-md mx-6">
            <Input
              type="text"
              placeholder="Search for products, brands and more"
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full"
            >
              <Search size={18} className="text-muted-foreground" />
            </Button>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            {/* Location Picker */}
            <div className="hidden md:block">
              <LocationPicker />
            </div>
            
            {currentUser ? (
              <Link href="/account" className="text-foreground hover:text-primary transition-transform duration-200 hover:scale-110">
                <User size={24} />
              </Link>
            ) : (
              <Link href="/login" className="text-foreground hover:text-primary transition-transform duration-200 hover:scale-110">
                <User size={24} />
              </Link>
            )}
            
            <Link href="/account?tab=wishlist" className="text-foreground hover:text-primary transition-transform duration-200 hover:scale-110">
              <Heart size={24} />
            </Link>
            
            <Link href="/cart" className="text-foreground hover:text-primary relative transition-transform duration-200 hover:scale-110">
              <ShoppingBag size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation (hidden by default) */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 animate-slideInDown">
          <div className="container mx-auto px-4 py-2">
            <form onSubmit={handleSearch} className="flex items-center relative mb-4">
              <Input
                type="text" 
                placeholder="Search for products, brands and more" 
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
              >
                <Search size={18} className="text-muted-foreground" />
              </Button>
            </form>
            
            <div className="mb-4">
              <LocationPicker />
            </div>
            
            <nav className="flex flex-col space-y-3 pb-4">
              <Link href="/" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                Home
              </Link>
              <Link href="/products" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                Women
              </Link>
              <Link href="/products" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                Men
              </Link>
              <Link href="/products" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                Kids
              </Link>
              <Link href="/products" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                Accessories
              </Link>
              <Link href="/products?sale=true" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                Sale
              </Link>
              
              {currentUser ? (
                <>
                  <Link href="/account" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                    My Account
                  </Link>
                  <Link href="/order-tracking" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                    Track Order
                  </Link>
                  <Button 
                    variant="link" 
                    className="justify-start p-0 h-auto font-medium text-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                    Login
                  </Link>
                  <Link href="/register" className="text-foreground hover:text-primary font-medium transition-colors duration-200">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
