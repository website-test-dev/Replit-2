import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Account from "@/pages/account";
import OrderTracking from "@/pages/order-tracking";
import Login from "@/pages/login";
import Register from "@/pages/register";
import SellerDashboard from "@/pages/seller/dashboard";
import ToastContainer from "@/components/ui/toast-container";
import { useLocation } from "@/hooks/useLocation";
import { StoreLocator } from "@/components/maps/StoreLocator";

function StoreLocatorPage() {
  const { location } = useLocation();
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Find Our Stores</h1>
      <p className="text-muted-foreground mb-6">
        Find the Fashion Express store nearest to you. Get directions, store hours, and contact information.
      </p>
      <div className="mb-8">
        {location ? (
          <div className="p-4 bg-green-50 text-green-700 rounded-md mb-4">
            <p className="font-medium">
              Using your current location: {location.city || 'Unknown location'}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md mb-4">
            <p className="font-medium">
              We can show stores closest to you if you allow location access.
            </p>
          </div>
        )}
      </div>
      <div className="mb-8">
        {/* Use the StoreLocator component with the user's location */}
        <StoreLocator userLocation={location} />
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/account" component={Account} />
          <Route path="/order-tracking" component={OrderTracking} />
          <Route path="/order-tracking/:orderId" component={OrderTracking} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/seller/dashboard" component={SellerDashboard} />
          <Route path="/store-locator" component={StoreLocatorPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ToastContainer />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
