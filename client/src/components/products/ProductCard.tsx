import { Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart, ShoppingBag, Star, StarHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatPrice, calculateDiscount, generateStarRating } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  image: string;
  categoryId: number;
  brand: string;
  ratings: number;
  numReviews: number;
}

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  showBrand?: boolean;
}

const ProductCard = ({ product, showRating = false, showBrand = false }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    onError: () => { /* Silently handle auth error */ },
  });

  // Add to cart mutation
  const { mutate: addToCart, isPending: isAddingToCart } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive"
      });
    }
  });

  // Add to wishlist mutation
  const { mutate: addToWishlist, isPending: isAddingToWishlist } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/wishlist", {
        productId: product.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist`,
        variant: "success"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to wishlist",
        variant: "destructive"
      });
    }
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive"
      });
      return;
    }
    
    addToCart();
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }
    
    addToWishlist();
  };

  const starRating = generateStarRating(product.ratings);
  
  return (
    <Link href={`/products/${product.id}`}>
      <div 
        className="product-card bg-white rounded-lg shadow-sm overflow-hidden h-full cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-72 object-cover"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Button 
                variant="secondary" 
                size="sm"
                className="font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/products/${product.id}`;
                }}
              >
                View Details
              </Button>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{product.name}</h3>
              {showBrand && (
                <p className="text-muted-foreground text-sm">{product.brand}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
            >
              <Heart size={18} />
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div>
              {product.discountPrice ? (
                <>
                  <p className="text-primary font-bold">
                    {formatPrice(product.discountPrice)}
                  </p>
                  <p className="text-muted-foreground text-sm line-through">
                    {formatPrice(product.price)}
                  </p>
                </>
              ) : (
                <p className="text-primary font-bold">
                  {formatPrice(product.price)}
                </p>
              )}
              
              {showRating && product.numReviews > 0 && (
                <div className="flex items-center mt-1">
                  <div className="flex text-warning">
                    {Array(starRating.full).fill(0).map((_, i) => (
                      <Star key={`full-${i}`} size={14} className="fill-warning" />
                    ))}
                    {Array(starRating.half).fill(0).map((_, i) => (
                      <StarHalf key={`half-${i}`} size={14} className="fill-warning" />
                    ))}
                    {Array(starRating.empty).fill(0).map((_, i) => (
                      <Star key={`empty-${i}`} size={14} className="text-gray-200" />
                    ))}
                  </div>
                  <span className="text-muted-foreground text-xs ml-1">
                    ({product.numReviews})
                  </span>
                </div>
              )}
            </div>
            
            {product.discountPrice && (
              <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded">
                {calculateDiscount(product.price, product.discountPrice)}% OFF
              </span>
            )}
            
            {showRating && (
              <Button 
                variant="primary" 
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock <= 0}
              >
                <ShoppingBag size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
