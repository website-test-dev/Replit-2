import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { 
  Loader2, 
  User, 
  Package, 
  Heart, 
  LogOut, 
  Edit, 
  Save, 
  ShoppingBag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface Order {
  id: number;
  userId: number;
  status: string;
  total: number;
  createdAt: string;
  deliveryExpectedBy: string;
}

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
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

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Account = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Get current tab from URL query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (tabParam && ["profile", "orders", "wishlist"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch user profile
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ["/api/users/profile"],
    onError: (error) => {
      if (error instanceof Error && error.message.includes("401")) {
        navigate("/login");
      }
    },
  });

  // Fetch orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: activeTab === "orders",
    onError: () => {
      // Handle error silently
    },
  });

  // Fetch wishlist
  const { data: wishlistItems = [], isLoading: isLoadingWishlist } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: activeTab === "wishlist",
    onError: () => {
      // Handle error silently
    },
  });

  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await apiRequest("PUT", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
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

  // Remove from wishlist mutation
  const { mutate: removeFromWishlist, isPending: isRemovingFromWishlist } = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/wishlist/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove from wishlist",
        variant: "destructive",
      });
    },
  });

  // Add to cart mutation
  const { mutate: addToCart, isPending: isAddingToCart } = useMutation({
    mutationFn: async ({ productId }: { productId: number }) => {
      return await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
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

  // Initialize form with user profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userProfile?.name || "",
      email: userProfile?.email || "",
      username: userProfile?.username || "",
      phone: userProfile?.phone || "",
      address: userProfile?.address || "",
      city: userProfile?.city || "",
      state: userProfile?.state || "",
      pincode: userProfile?.pincode || "",
    },
  });

  // Update form values when user profile data is loaded
  if (userProfile && !form.formState.isDirty) {
    form.reset({
      name: userProfile.name || "",
      email: userProfile.email || "",
      username: userProfile.username || "",
      phone: userProfile.phone || "",
      address: userProfile.address || "",
      city: userProfile.city || "",
      state: userProfile.state || "",
      pincode: userProfile.pincode || "",
    });
  }

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data);
  };

  const isLoading = isLoadingProfile || (activeTab === "orders" && isLoadingOrders) || (activeTab === "wishlist" && isLoadingWishlist);

  if (isLoading && !userProfile) {
    return (
      <div className="min-h-[500px] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Account - FashionExpress</title>
        <meta
          name="description"
          content="Manage your FashionExpress account, view orders, and update your profile."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold font-poppins">My Account</h1>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => logout()}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package size={16} />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart size={16} />
              Wishlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>View and update your account details</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="johndoe" {...field} />
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
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Address Details</h3>
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St, Apartment 4B" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                  <Input placeholder="Maharashtra" {...field} />
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
                      </div>
                      
                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="flex items-center gap-2"
                        >
                          {isUpdatingProfile ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-muted-foreground">Full Name</Label>
                        <p className="font-medium">{userProfile?.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Username</Label>
                        <p className="font-medium">{userProfile?.username}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{userProfile?.email}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Phone Number</Label>
                        <p className="font-medium">{userProfile?.phone || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Address Details</h3>
                      
                      {userProfile?.address ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-muted-foreground">Address</Label>
                            <p className="font-medium">{userProfile.address}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">City, State, Pincode</Label>
                            <p className="font-medium">
                              {[
                                userProfile.city,
                                userProfile.state,
                                userProfile.pincode
                              ].filter(Boolean).join(", ") || "Not provided"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Card className="bg-gray-50">
                          <CardContent className="p-4">
                            <p className="text-muted-foreground text-center">
                              No address details provided. Click "Edit Profile" to add your address.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your recent orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="min-h-[200px] flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`${
                                order.status === 'delivered' 
                                  ? 'bg-success/10 text-success border-success/20' 
                                  : order.status === 'pending' 
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    : 'bg-blue-100 text-blue-800 border-blue-200'
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatPrice(order.total)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={`/order-tracking/${order.id}`}>Track Order</a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't placed any orders yet. Start shopping to place your first order!
                    </p>
                    <Button asChild>
                      <a href="/products">Shop Now</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingWishlist ? (
                  <div className="min-h-[200px] flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                            <h3 className="text-white font-medium line-clamp-1">
                              {item.product.name}
                            </h3>
                            <p className="text-white/80 text-sm">
                              {item.product.brand}
                            </p>
                          </div>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <div>
                            <p className="font-bold text-primary">
                              {formatPrice(item.product.discountPrice || item.product.price)}
                            </p>
                            {item.product.discountPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.product.price)}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => removeFromWishlist(item.id)}
                              disabled={isRemovingFromWishlist}
                            >
                              <Heart className="h-4 w-4 text-destructive fill-destructive" />
                            </Button>
                            <Button
                              variant="default"
                              size="icon"
                              onClick={() => addToCart({ productId: item.product.id })}
                              disabled={isAddingToCart}
                            >
                              <ShoppingBag className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Your Wishlist is Empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Save items you love to your wishlist and find them here for easy access.
                    </p>
                    <Button asChild>
                      <a href="/products">Explore Products</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Account;
