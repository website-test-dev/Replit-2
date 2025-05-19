import { Button } from "@/components/ui/button";
import { Apple, PlayCircle } from "lucide-react";

const AppDownload = () => {
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">Get the FashionExpress App</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Download our app for a seamless shopping experience. Get exclusive app-only offers and faster checkout.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-black hover:bg-gray-900 text-white border border-gray-700 rounded-lg px-6 py-3 h-auto flex items-center gap-3">
                <Apple className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-xs">Download on the</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </Button>
              <Button className="bg-black hover:bg-gray-900 text-white border border-gray-700 rounded-lg px-6 py-3 h-auto flex items-center gap-3">
                <PlayCircle className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-xs">GET IT ON</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=700&q=80"
              alt="FashionExpress Mobile App"
              className="w-64 h-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;
