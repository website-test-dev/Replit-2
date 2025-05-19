import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/HeroSection";
import DeliveryPromise from "@/components/home/DeliveryPromise";
import Categories from "@/components/home/Categories";
import TrendingProducts from "@/components/home/TrendingProducts";
import NewArrivals from "@/components/home/NewArrivals";
import OrderTracking from "@/components/home/OrderTracking";
import Promotions from "@/components/home/Promotions";
import AppDownload from "@/components/home/AppDownload";
import CustomerReviews from "@/components/home/CustomerReviews";
import AnnouncementBanner from "@/components/home/AnnouncementBanner";
import PromotionalBanner from "@/components/home/PromotionalBanner";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>FashionExpress - Fashion Delivered to Your Doorstep</title>
        <meta name="description" content="Shop the latest fashion trends with same-day delivery. FashionExpress brings the best of online shopping and fast delivery to your doorstep." />
      </Helmet>
      
      <AnnouncementBanner />
      <HeroSection />
      <DeliveryPromise />
      <Categories />
      <div className="my-12">
        <PromotionalBanner />
      </div>
      <TrendingProducts />
      <NewArrivals />
      <OrderTracking />
      <Promotions />
      <AppDownload />
      <CustomerReviews />
    </>
  );
};

export default Home;
