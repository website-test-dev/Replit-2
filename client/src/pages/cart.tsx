import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import {
  Loader2,
  Trash2,
  ShoppingBag,
  MinusCircle,
  PlusCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    discountPrice: number | null;
    stock: number;
    image: string;
    brand: string;
  };
}

const Cart = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    onError: (error) => {
      if (error instanceof Error && error.message.includes("401")) {
        navigate("/login");
      }
    },
  });

  // Update cart item mutation
  const { mutate: updateCartItem, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cart",
        variant: "destructive",
      });
    },
  });

  // Remove cart item mutation
  const { mutate: removeCartItem, isPending: isRemoving } = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/cart/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const { mutate: clearCart, isPending: isClearing } = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", "/api/cart", undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (id: number, quantity: number, stock: number) => {
    if (quantity < 1) return;
    if (quantity > stock) {
      toast({
        title: "Max stock reached",
        description: `Only ${stock} items available in stock`,
        variant: "warning",
      });
      return;
    }
    updateCartItem({ id, quantity });
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product.discountPrice || item.product.price) * item.quantity,
    0
  );
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <>
      <Helmet>
        <title>Your Cart - FashionExpress</title>
        <meta
          name="description"
          content="Review and checkout items in your shopping cart at FashionExpress."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-6">Your Shopping Cart</h1>

        {isLoading ? (
          <div className="min-h-[400px] flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 h-32 bg-gray-100">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div>
                            <Link href={`/products/${item.product.id}`}>
                              <h3 className="font-medium hover:text-primary transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-2">
                              Brand: {item.product.brand}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-primary">
                                {formatPrice(
                                  item.product.discountPrice || item.product.price
                                )}
                              </p>
                              {item.product.discountPrice && (
                                <p className="text-sm text-muted-foreground line-through">
                                  {formatPrice(item.product.price)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1,
                                    item.product.stock
                                  )
                                }
                                disabled={isUpdating}
                              >
                                <MinusCircle size={16} />
                              </Button>
                              <span className="w-10 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1,
                                    item.product.stock
                                  )
                                }
                                disabled={isUpdating || item.quantity >= item.product.stock}
                              >
                                <PlusCircle size={16} />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeCartItem(item.id)}
                              disabled={isRemoving}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Button
                  variant="outline"
                  className="text-muted-foreground"
                  onClick={() => clearCart()}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Clear Cart
                </Button>
                <Button asChild>
                  <Link href="/products">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-success">Free</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Free shipping on orders over ₹999
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Accepted Payment Methods</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white p-2 rounded border">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="32px"
                      height="32px"
                    >
                      <path
                        fill="#ff5f00"
                        d="M32,25.1v-2.2c0-0.8-0.5-1.5-1.3-1.7c-0.8-0.2-1.6,0.1-2,0.8c-0.4-0.7-1.2-1-2-0.8	c-0.6,0.2-1.1,0.7-1.3,1.3v-1.1h-1.3v5.7H26v-3.1c0-0.7,0.5-1.2,1.2-1.2c0.7,0,1.2,0.5,1.2,1.2v3.1h1.3v-3.1c0-0.7,0.5-1.2,1.2-1.2	c0.7,0,1.2,0.5,1.2,1.2v3.1H33v-2.9C33,25.3,32.5,25.1,32,25.1z"
                      />
                      <path
                        fill="#ff5f00"
                        d="M38,22h-1.4l-1.4,3.4L33.8,22h-1.5l2.1,5.7h1.5L38,22z"
                      />
                      <path
                        fill="#ff5f00"
                        d="M38.5,27.7h1.3V22h-1.3V27.7z"
                      />
                      <path
                        fill="#ff5f00"
                        d="M44.7,23.3v-1.2h-1.3v-1.5h-1.3v1.5h-0.8v1.2h0.8v2.6c0,1.2,0.5,1.9,1.8,1.9c0.5,0,0.9-0.1,1.3-0.3	L44.9,26c-0.3,0.1-0.7,0.2-0.9,0.2c-0.5,0-0.7-0.3-0.7-0.8v-2.1H44.7z"
                      />
                      <path
                        fill="#ff5f00"
                        d="M14.1,22.9c-0.5-0.4-1.1-0.5-1.8-0.5c-1.1,0-1.8,0.5-1.8,1.4c0,0.7,0.5,1.1,1.4,1.3l0.4,0.1	c0.5,0.1,0.7,0.2,0.7,0.4c0,0.3-0.3,0.4-0.9,0.4c-0.6,0-1-0.2-1.3-0.5L10,26.4c0.5,0.4,1.1,0.6,1.9,0.6c1.3,0,2.2-0.6,2.2-1.5	c0-0.7-0.5-1.1-1.4-1.3l-0.4-0.1c-0.4-0.1-0.7-0.1-0.7-0.4c0-0.2,0.3-0.4,0.7-0.4c0.5,0,0.9,0.2,1.2,0.4L14.1,22.9z"
                      />
                      <path
                        fill="#eb001b"
                        d="M17,22c-1.6,0-2.7,1.2-2.7,2.9c0,1.8,1.2,2.9,2.8,2.9c0.8,0,1.5-0.2,2.1-0.8l-0.7-0.9	c-0.4,0.3-0.8,0.5-1.3,0.5c-0.6,0-1.2-0.3-1.3-1h3.7c0-0.2,0-0.3,0-0.5C19.6,23.1,18.5,22,17,22z M15.8,24.6	c0.1-0.6,0.5-1.1,1.2-1.1c0.6,0,1,0.4,1.1,1.1H15.8z"
                      />
                      <path
                        fill="#f79e1b"
                        d="M26.7,22.9c-0.5-0.4-1.1-0.5-1.8-0.5c-1.1,0-1.8,0.5-1.8,1.4c0,0.7,0.5,1.1,1.4,1.3l0.4,0.1	c0.5,0.1,0.7,0.2,0.7,0.4c0,0.3-0.3,0.4-0.9,0.4c-0.6,0-1-0.2-1.3-0.5l-0.8,0.9c0.5,0.4,1.1,0.6,1.9,0.6c1.3,0,2.2-0.6,2.2-1.5	c0-0.7-0.5-1.1-1.4-1.3l-0.4-0.1c-0.4-0.1-0.7-0.1-0.7-0.4c0-0.2,0.3-0.4,0.7-0.4c0.5,0,0.9,0.2,1.2,0.4L26.7,22.9z"
                      />
                      <path
                        fill="#0099df"
                        d="M10.3,22h-2c-0.4,0-0.8,0.1-1,0.6L5,27.7h1.4l0.5-1.3h2.9l0.5,1.3h1.4L10.3,22z M7.4,25.1l0.9-2.2	l0.9,2.2H7.4z"
                      />
                    </svg>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="32px"
                      height="32px"
                    >
                      <path
                        fill="#1565C0"
                        d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"
                      />
                      <path
                        fill="#FFF"
                        d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.179 1.991.179l.466-2.169c0 0-1.358-.295-2.691-.295-3.019 0-4.576 1.444-4.576 3.476 0 2.195 3.394 2.22 3.394 3.365 0 .145-.031.677-.994.677-.96 0-2.055-.282-2.055-.282l-.505 2.169c0 0 1.323.366 2.504.366 1.182 0 4.604-.229 4.604-3.579C30.433 22.944 26.369 23.251 26.369 22.206z"
                      />
                    </svg>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="32px"
                      height="32px"
                    >
                      <path
                        fill="#E1E7EA"
                        d="M45,35c0,2.2-1.8,4-4,4H7c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h34c2.2,0,4,1.8,4,4V35z"
                      />
                      <path
                        fill="#5D9CEC"
                        d="M32.5,29c0,2.5-2,4.5-4.5,4.5h-8c-2.5,0-4.5-2-4.5-4.5V19c0-2.5,2-4.5,4.5-4.5h8c2.5,0,4.5,2,4.5,4.5V29z"
                      />
                      <path
                        fill="#FFF"
                        d="M24,26c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S25.1,26,24,26z"
                      />
                    </svg>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="32px"
                      height="32px"
                    >
                      <path
                        fill="#263238"
                        d="M5,7C3.343,7,2,8.343,2,10v28c0,1.657,1.343,3,3,3h38c1.657,0,3-1.343,3-3V10c0-1.657-1.343-3-3-3H5z"
                      />
                      <path
                        fill="#F5F5F5"
                        d="M39,24.5c0,5.43-6.978,9.484-15,9.484c-8.022,0-15-4.054-15-9.484C9,19.071,15.978,15,24,15C32.022,15,39,19.071,39,24.5z"
                      />
                      <path
                        fill="#F44336"
                        d="M22 19A3 3 0 1 0 22 25 3 3 0 1 0 22 19zM26 19A3 3 0 1 0 26 25 3 3 0 1 0 26 19z"
                      />
                      <path
                        fill="#FFEB3B"
                        d="M25,22a1,1,0,1,0,1,1A1,1,0,0,0,25,22Z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it
              up with amazing fashion products!
            </p>
            <Button size="lg" asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
