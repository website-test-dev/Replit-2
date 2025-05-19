import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import {
  Loader2,
  CreditCard,
  Truck,
  Package,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

const checkoutFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pincode: z.string().min(6, "Please enter a valid pincode"),
  paymentMethod: z.enum(["cod", "card", "upi"]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const Checkout = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Fetch cart items
  const { data: cartItems = [], isLoading: isLoadingCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    onError: (error) => {
      if (error instanceof Error && error.message.includes("401")) {
        navigate("/login");
      }
    },
  });

  // Fetch user profile
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ["/api/users/profile"],
    onError: (error) => {
      if (error instanceof Error && error.message.includes("401")) {
        navigate("/login");
      }
    },
  });

  // Create order mutation
  const { mutate: placeOrder, isPending: isPlacingOrder } = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.discountPrice || item.product.price
      }));

      return await apiRequest("POST", "/api/orders", {
        orderData: {
          total: calculateTotal().total,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          phone: data.phone,
          paymentMethod: data.paymentMethod,
        },
        items: orderItems
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setOrderPlaced(true);
      setOrderId(response.id);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    },
  });

  // Initialize form with user profile data if available
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      phone: userProfile?.phone || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      state: userProfile?.state || "",
      pincode: userProfile?.pincode || "",
      paymentMethod: "cod",
      notes: "",
    },
  });

  // Update form values when user profile data is loaded
  if (userProfile && !form.formState.isDirty) {
    form.reset({
      name: userProfile.name || "",
      email: userProfile.email || "",
      phone: userProfile.phone || "",
      address: userProfile.address || "",
      city: userProfile.city || "",
      state: userProfile.state || "",
      pincode: userProfile.pincode || "",
      paymentMethod: "cod",
      notes: "",
    });
  }

  const onSubmit = (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    placeOrder(data);
  };

  // Calculate totals
  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + (item.product.discountPrice || item.product.price) * item.quantity,
      0
    );
    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
  };

  const { subtotal, shipping, total } = calculateTotal();

  const isLoading = isLoadingCart || isLoadingProfile;

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <>
        <Helmet>
          <title>Order Confirmation - FashionExpress</title>
          <meta name="description" content="Your order has been successfully placed. Thank you for shopping with FashionExpress!" />
        </Helmet>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. We've received your request and will process it shortly.
              Your order number is <span className="font-semibold">#{orderId}</span>
            </p>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  A confirmation email has been sent to your email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <a href="/products">Continue Shopping</a>
              </Button>
              <Button asChild>
                <a href={`/order-tracking/${orderId}`}>Track Order</a>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - FashionExpress</title>
        <meta
          name="description"
          content="Complete your purchase securely at FashionExpress. Checkout with various payment options."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-6">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Add some items to your cart before proceeding to checkout.
            </p>
            <Button size="lg" asChild>
              <a href="/products">Start Shopping</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Information</CardTitle>
                      <CardDescription>
                        Enter your shipping details for delivery
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="123 Main St, Apartment 4B" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Mumbai" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                                    <SelectItem value="Delhi">Delhi</SelectItem>
                                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                                    <SelectItem value="Kerala">Kerala</SelectItem>
                                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                    <SelectItem value="Punjab">Punjab</SelectItem>
                                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                    <SelectItem value="Telangana">Telangana</SelectItem>
                                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode</FormLabel>
                              <FormControl>
                                <Input placeholder="400001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method</CardTitle>
                      <CardDescription>
                        Select your preferred payment method
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-4"
                              >
                                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                                  <RadioGroupItem value="cod" id="cod" />
                                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                        <span>Cash on Delivery</span>
                                      </div>
                                      <span className="text-muted-foreground text-sm">Pay when you receive</span>
                                    </div>
                                  </Label>
                                </div>
                                
                                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                                  <RadioGroupItem value="card" id="card" />
                                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <span>Credit/Debit Card</span>
                                      </div>
                                      <span className="text-muted-foreground text-sm">All major cards accepted</span>
                                    </div>
                                  </Label>
                                </div>
                                
                                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                                  <RadioGroupItem value="upi" id="upi" />
                                  <Label htmlFor="upi" className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          width="20"
                                          height="20"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="text-muted-foreground"
                                        >
                                          <path d="M7 15h3a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1z" />
                                          <path d="M3 5v15a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5" />
                                          <path d="M15 13v-3a1 1 0 0 1 1-1h1.5" />
                                          <path d="M20 9h-3.5" />
                                        </svg>
                                        <span>UPI Payment</span>
                                      </div>
                                      <span className="text-muted-foreground text-sm">Google Pay, PhonePe, etc.</span>
                                    </div>
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Order Notes</CardTitle>
                      <CardDescription>
                        Add any special instructions for delivery (optional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Special instructions for delivery" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm">
                          {formatPrice(
                            (item.product.discountPrice || item.product.price) * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
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

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      onClick={form.handleSubmit(onSubmit)}
                      className="w-full" 
                      size="lg"
                      disabled={isPlacingOrder}
                    >
                      {isPlacingOrder ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Place Order
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      By placing your order, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex gap-2 items-center justify-center">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Same day delivery in select areas
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Checkout;
