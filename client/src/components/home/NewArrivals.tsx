import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  image: string;
  categoryId: number;
  brand: string;
  ratings: number;
  numReviews: number;
  isFeatured: boolean;
  createdAt: string;
}

const ProductSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="w-full h-80 rounded-t-lg" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  </div>
);

const NewArrivals = () => {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    select: (data) => {
      // Sort by date to get newest products
      return [...data]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);
    },
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-poppins font-bold text-3xl mb-8">New Arrivals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" className="px-8 py-3 h-auto">
              Load More
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-bold text-3xl mb-8">New Arrivals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} showRating showBrand />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="px-8 py-3 h-auto" asChild>
            <Link href="/products">Load More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
