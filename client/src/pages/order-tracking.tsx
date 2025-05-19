import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Helmet } from "react-helmet";
import {
  Loader2,
  Package,
  Check,
  Truck,
  Home,
  SearchIcon,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface OrderTracking {
  id: number;
  orderId: number;
  status: string;
  description: string;
  timestamp: string;
}

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  deliveryExpectedBy: string;
  items: {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      image: string;
    };
  }[];
}

const OrderTracking = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/order-tracking/:orderId?");
  const [orderId, setOrderId] = useState(params?.orderId || "");
  const [showTracking, setShowTracking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (params?.orderId) {
      setOrderId(params.orderId);
      setShowTracking(true);
    }
  }, [params]);

  // Fetch order details
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId && showTracking,
  });

  // Fetch tracking information
  const {
    data: tracking,
    isLoading: trackingLoading,
    error: trackingError,
  } = useQuery<OrderTracking[]>({
    queryKey: [`/api/orders/${orderId}/tracking`],
    enabled: !!orderId && showTracking,
  });

  const isLoading = orderLoading || trackingLoading;
  const error = orderError || trackingError;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setShowTracking(true);
      if (!match) {
        navigate(`/order-tracking/${orderId}`);
      }
    } else {
      toast({
        title: "Please enter an order ID",
        description: "Enter a valid order ID to track your order",
        variant: "destructive",
      });
    }
  };

  const getStatusWidth = (status: string) => {
    switch (status.toLowerCase()) {
      case "order placed":
      case "pending":
        return "20%";
      case "processing":
      case "packed":
        return "40%";
      case "shipped":
        return "60%";
      case "out for delivery":
        return "80%";
      case "delivered":
        return "100%";
      default:
        return "20%";
    }
  };

  const getStatusIcon = (index: number, isCompleted: boolean) => {
    if (index === 0) return <Check size={14} className="text-white" />;
    if (index === 1) return <Package size={14} className={isCompleted ? "text-white" : "text-gray-500"} />;
    if (index === 2) return <Truck size={14} className={isCompleted ? "text-white" : "text-gray-500"} />;
    if (index === 3) return <Truck size={14} className={isCompleted ? "text-white" : "text-gray-500"} />;
    return <Home size={14} className={isCompleted ? "text-white" : "text-gray-500"} />;
  };

  const statusSteps = ["Ordered", "Packed", "Shipped", "Out for delivery", "Delivered"];
  
  const getCurrentStepIndex = (status: string) => {
    if (!status) return 0;
    
    const statusLower = status.toLowerCase();
    if (statusLower === "pending" || statusLower === "order placed") return 0;
    if (statusLower === "processing" || statusLower === "packed") return 1;
    if (statusLower === "shipped") return 2;
    if (statusLower === "out for delivery") return 3;
    if (statusLower === "delivered") return 4;
    return 0;
  };

  const currentStepIndex = order ? getCurrentStepIndex(order.status) : 0;

  return (
    <>
      <Helmet>
        <title>Track Your Order - FashionExpress</title>
        <meta name="description" content="Track your order status and delivery timeline at FashionExpress. Get real-time updates on your fashion purchases." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-bold font-poppins text-center mb-10">Track Your Order</h1>
        
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                  type="text"
                  placeholder="Enter your order ID"
                  className="flex-1"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
                <Button type="submit" className="shrink-0" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SearchIcon className="mr-2 h-4 w-4" />
                  )}
                  Track
                </Button>
              </form>

              {showTracking && isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {showTracking && error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 text-center text-red-800">
                    <p>We couldn't find any order with this ID. Please check the ID and try again.</p>
                  </CardContent>
                </Card>
              )}

              {showTracking && order && tracking && (
                <Card className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg">Order #{order.id}</h3>
                    <span className="bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mb-4">
                    <div className="flex-shrink-0">
                      <img
                        src={order.items[0]?.product.image}
                        alt="Order Item"
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">
                        {order.items.length > 1
                          ? `${order.items[0]?.product.name} and ${order.items.length - 1} more item(s)`
                          : order.items[0]?.product.name}
                      </h4>
                      <p className="text-muted-foreground text-sm mb-3">
                        Estimated Delivery: {new Date(order.deliveryExpectedBy).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      <div className="relative">
                        <div className="flex justify-between mb-2 text-xs text-muted-foreground">
                          {statusSteps.map((step, i) => (
                            <span key={i} className="text-center w-1/5">{step}</span>
                          ))}
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full mb-2">
                          <div
                            className="h-2 bg-secondary rounded-full"
                            style={{ width: getStatusWidth(order.status) }}
                          ></div>
                        </div>
                        <div className="flex justify-between relative">
                          {statusSteps.map((step, i) => (
                            <div 
                              key={i}
                              className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                                i <= currentStepIndex ? "bg-secondary" : "bg-gray-200"
                              }`}
                            >
                              {getStatusIcon(i, i <= currentStepIndex)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium mb-3">Tracking Updates</h4>
                    <div className="space-y-3">
                      {tracking.map((track) => (
                        <div key={track.id} className="flex gap-3">
                          <div className="text-primary">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{track.status}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(track.timestamp)}
                            </p>
                            <p className="text-sm mt-1">{track.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Need help section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Our customer support team is available to assist you with your order
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-50">
                    <CardContent className="p-4 flex gap-2 items-center">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">24/7 Support</h3>
                        <p className="text-sm text-muted-foreground">Always here to help</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4 flex gap-2 items-center">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Fast Delivery</h3>
                        <p className="text-sm text-muted-foreground">Within 24 hours in select areas</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href="/account?tab=orders">
                    View All Orders
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTracking;
