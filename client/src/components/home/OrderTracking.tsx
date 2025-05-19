import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Check, Truck, Home } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

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
  const [orderId, setOrderId] = useState("");
  const [showTracking, setShowTracking] = useState(false);

  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId && showTracking,
  });

  const { data: tracking, isLoading: trackingLoading } = useQuery<OrderTracking[]>({
    queryKey: [`/api/orders/${orderId}/tracking`],
    enabled: !!orderId && showTracking,
  });

  const isLoading = orderLoading || trackingLoading;

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setShowTracking(true);
    }
  };

  const getStatusWidth = (status: string) => {
    switch (status.toLowerCase()) {
      case "order placed":
        return "20%";
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
  const currentStepIndex = order
    ? statusSteps.findIndex(step => 
        step.toLowerCase() === order.status.toLowerCase()
      )
    : 0;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-bold text-3xl mb-10 text-center">Track Your Order</h2>
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
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Track
                </Button>
              </form>

              {showTracking && order && tracking && (
                <Card className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-lg">Order #{order.id}</h3>
                    <span className="bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full">
                      {order.status}
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

              {showTracking && !order && !isLoading && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No order found with the provided ID. Please check and try again.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default OrderTracking;
