import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { 
  Star, 
  StarHalf, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RefreshCw, 
  Shield, 
  Minus, 
  Plus,
  Loader2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatPrice, calculateDiscount, generateStarRating } from "@/lib/utils";
import TrendingProducts from "@/components/home/TrendingProducts";

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

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

const ProductDetail = () => {
  const [match, params] = useRoute("/products/:id");
  const [, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  
  // If no match, redirect to products page
  if (!match) {
    navigate("/products");
    return null;
  }
  
  const productId = parseInt(params.id);
  
  // Fetch product
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
  });
  
  // Fetch reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    enabled: !!product,
  });
  
  // Fetch category
  const { data: category, isLoading: isLoadingCategory } = useQuery<Category>({
    queryKey: ["/api/categories", product?.categoryId],
    enabled: !!product,
    select: (categories: Category[]) => 
      categories.find(cat => cat.id === product?.categoryId),
  });

  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    onError: () => { /* Silently handle auth error */ },
  });

  // Add to cart mutation
  const { mutate: addToCart, isPending: isAddingToCart } = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/cart", {
        productId,
        quantity
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your cart`,
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
        productId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: `${product?.name} has been added to your wishlist`,
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

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    addToCart();
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your wishlist",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    addToWishlist();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <a href="/products">Browse Products</a>
        </Button>
      </div>
    );
  }

  const productPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const discountPercentage = hasDiscount ? calculateDiscount(product.price, product.discountPrice) : 0;
  const isOutOfStock = product.stock <= 0;
  const starRating = generateStarRating(product.ratings);

  return (
    <>
      <Helmet>
        <title>{`${product.name} - FashionExpress`}</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} - FashionExpress`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <a href="/" className="hover:text-primary">Home</a>
          <ChevronRight className="h-4 w-4 mx-1" />
          <a href="/products" className="hover:text-primary">Products</a>
          {category && (
            <>
              <ChevronRight className="h-4 w-4 mx-1" />
              <a href={`/products?category=${category.id}`} className="hover:text-primary">
                {category.name}
              </a>
            </>
          )}
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
        
        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto object-contain aspect-square"
            />
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="flex text-warning">
                    {Array(starRating.full).fill(0).map((_, i) => (
                      <Star key={`full-${i}`} className="fill-warning text-warning" />
                    ))}
                    {Array(starRating.half).fill(0).map((_, i) => (
                      <StarHalf key={`half-${i}`} className="fill-warning text-warning" />
                    ))}
                    {Array(starRating.empty).fill(0).map((_, i) => (
                      <Star key={`empty-${i}`} className="text-gray-300" />
                    ))}
                  </div>
                  <span className="text-muted-foreground ml-1">
                    ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <Badge variant="outline" className="font-normal">
                  {product.brand}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-end gap-4">
              <div>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(productPrice)}
                </p>
                {hasDiscount && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-muted-foreground text-sm line-through">
                      {formatPrice(product.price)}
                    </p>
                    <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}
              </div>
              <div className={`ml-auto px-3 py-1 rounded-full text-sm ${
                isOutOfStock 
                  ? 'bg-destructive/10 text-destructive' 
                  : 'bg-success/10 text-success'
              }`}>
                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {product.stock} units available
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="flex-1"
                disabled={isOutOfStock || isAddingToCart}
                onClick={handleAddToCart}
              >
                {isAddingToCart ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="mr-2 h-4 w-4" />
                )}
                Add to Cart
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                disabled={isAddingToWishlist}
                onClick={handleAddToWishlist}
              >
                {isAddingToWishlist ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="mr-2 h-4 w-4" />
                )}
                Wishlist
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <Truck className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground">Within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">15 day policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Secure Payments</p>
                  <p className="text-xs text-muted-foreground">100% secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Product Details</h3>
                <p className="text-muted-foreground">{product.description}</p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Brand: {product.brand}</li>
                  <li>Category: {category?.name || 'Fashion'}</li>
                  <li>SKU: FE-{product.id.toString().padStart(6, '0')}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Care Instructions</h3>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Machine wash cold</li>
                  <li>Do not bleach</li>
                  <li>Tumble dry low</li>
                  <li>Iron on low heat if needed</li>
                  <li>Do not dry clean</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="space-y-6">
            {isLoadingReviews ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{review.user.name}</h4>
                        <div className="flex text-warning">
                          {Array(review.rating).fill(0).map((_, i) => (
                            <Star key={i} size={14} className="fill-warning" />
                          ))}
                          {Array(5 - review.rating).fill(0).map((_, i) => (
                            <Star key={i} size={14} className="text-gray-200" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to review this product
                </p>
                {user ? (
                  <Button asChild>
                    <a href={`/account?tab=orders`}>Write a Review</a>
                  </Button>
                ) : (
                  <Button asChild>
                    <a href="/login">Login to Write a Review</a>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="shipping" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Same Day Delivery:</strong> Available for orders placed before 12 PM in select cities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Standard Delivery:</strong> 1-3 business days depending on your location.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Free Shipping:</strong> On all orders above ₹999.</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Returns Policy</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <RefreshCw className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Easy Returns:</strong> 15-day return policy on most items.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Conditions:</strong> Items must be unused, unworn, and in original packaging.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span><strong>Process:</strong> Initiate returns from your account or contact customer support.</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Related Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-poppins mb-6">You Might Also Like</h2>
          <TrendingProducts />
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
