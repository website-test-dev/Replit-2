import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative">
      <div
        className="w-full h-[60vh] md:h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg text-white">
              <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-4">
                Fashion Delivered to Your Doorstep
              </h1>
              <p className="text-lg mb-8">
                Get the latest trends delivered within 24 hours. Shop now with FashionExpress.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg h-auto"
                asChild
              >
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
