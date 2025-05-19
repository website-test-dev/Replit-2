import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const Promotions = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-primary/5 rounded-xl overflow-hidden relative">
            <div className="p-8 md:p-10">
              <h3 className="font-poppins font-bold text-2xl md:text-3xl mb-2">Summer Sale</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Up to 50% off on summer collections. Limited time offer.
              </p>
              <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                <Link href="/products?sale=true">Shop Now</Link>
              </Button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80"
              alt="Summer Sale"
              className="absolute right-0 bottom-0 w-48 h-48 md:w-64 md:h-64 object-cover"
            />
          </div>
          
          <div className="bg-secondary/5 rounded-xl overflow-hidden relative">
            <div className="p-8 md:p-10">
              <h3 className="font-poppins font-bold text-2xl md:text-3xl mb-2">New Arrivals</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Discover the latest trends in fashion. Refresh your wardrobe.
              </p>
              <Button className="bg-secondary hover:bg-secondary/90 text-white" asChild>
                <Link href="/products">Explore</Link>
              </Button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80"
              alt="New Arrivals"
              className="absolute right-0 bottom-0 w-48 h-48 md:w-64 md:h-64 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Promotions;
