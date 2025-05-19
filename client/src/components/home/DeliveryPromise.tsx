import { Truck, RotateCcw, Shield, Headphones } from "lucide-react";

const DeliveryPromise = () => {
  const features = [
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Same Day Delivery",
      description: "Order before 12PM",
    },
    {
      icon: <RotateCcw className="h-10 w-10 text-primary" />,
      title: "Easy Returns",
      description: "15 day return policy",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Secure Payment",
      description: "Multiple payment options",
    },
    {
      icon: <Headphones className="h-10 w-10 text-primary" />,
      title: "24/7 Support",
      description: "Always here to help",
    },
  ];

  return (
    <section className="bg-white py-6 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {feature.icon}
              <h3 className="font-medium text-lg mt-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeliveryPromise;
