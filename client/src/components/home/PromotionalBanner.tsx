import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  bgColor: string;
  titleColor: string;
}

const banners: BannerItem[] = [
  {
    id: 1,
    title: "Summer Collection 2025",
    subtitle: "New Arrivals",
    description: "Discover the latest trends for summer with styles that keep you cool and fashionable.",
    ctaText: "Shop Now",
    ctaLink: "/products?collection=summer",
    image: "https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    bgColor: "bg-gradient-to-r from-amber-100 to-amber-200",
    titleColor: "text-amber-800"
  },
  {
    id: 2,
    title: "Limited Time Offer",
    subtitle: "Up to 50% Off",
    description: "Exclusive sale on selected premium brands. Hurry before stock runs out!",
    ctaText: "View Offers",
    ctaLink: "/products?sale=true",
    image: "https://images.unsplash.com/photo-1561052967-61fc91e48d79?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    bgColor: "bg-gradient-to-r from-pink-100 to-rose-200",
    titleColor: "text-rose-700"
  },
  {
    id: 3,
    title: "Sustainable Fashion",
    subtitle: "Eco-Friendly Collection",
    description: "Look good while doing good with our eco-conscious clothing line.",
    ctaText: "Discover",
    ctaLink: "/products?tag=sustainable",
    image: "https://images.unsplash.com/photo-1531928351158-2f736078e0a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
    bgColor: "bg-gradient-to-r from-green-100 to-emerald-200",
    titleColor: "text-emerald-700"
  }
];

const PromotionalBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100); // Start animation shortly after component mounts

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      
      setTimeout(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
        setIsAnimating(true);
      }, 300); // Wait for fade out before changing
    }, 6000); // Change banner every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const banner = banners[currentBanner];

  return (
    <div className={`w-full overflow-hidden relative ${banner.bgColor}`}>
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="flex flex-col md:flex-row items-center">
          <div className={`md:w-1/2 space-y-4 mb-8 md:mb-0 z-10 banner-text ${isAnimating ? 'animated' : ''}`}>
            <p className={`text-sm md:text-base font-medium uppercase tracking-wide ${banner.titleColor}`}>
              {banner.subtitle}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-gray-900">
              {banner.title}
            </h1>
            <p className="text-gray-700 text-base md:text-lg max-w-md">
              {banner.description}
            </p>
            <Button asChild className="group mt-2 px-6">
              <Link href={banner.ctaLink}>
                {banner.ctaText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          
          <div className={`md:w-1/2 relative banner-image ${isAnimating ? 'animated' : ''}`}>
            <img 
              src={banner.image} 
              alt={banner.title}
              className="w-full rounded-lg shadow-lg object-cover max-h-[400px]"
            />
            
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -left-4 h-16 w-16 bg-white/20 rounded-full backdrop-blur-md hidden md:block"></div>
            <div className="absolute -top-4 -right-4 h-12 w-12 bg-white/20 rounded-full backdrop-blur-md hidden md:block"></div>
          </div>
        </div>
        
        {/* Banner pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentBanner ? "w-8 bg-primary" : "w-2 bg-gray-300"
              }`}
              onClick={() => {
                setIsAnimating(false);
                setTimeout(() => {
                  setCurrentBanner(index);
                  setIsAnimating(true);
                }, 300);
              }}
              aria-label={`View banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;