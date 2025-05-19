import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ProductCard from "@/components/products/ProductCard";
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
  <div className="flex-shrink-0 w-64">
    <Skeleton className="w-full h-72 rounded-t-lg" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  </div>
);

const TrendingProducts = () => {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
  });

  if (isLoading) {
    return (
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-poppins font-bold text-3xl mb-8">Trending Now</h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4 pb-4">
              {Array(5).fill(0).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-bold text-3xl mb-8">Trending Now</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {products?.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-64">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default TrendingProducts;
