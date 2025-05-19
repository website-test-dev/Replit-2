import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: number;
  name: string;
  image: string;
  description: string | null;
}

const CategorySkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="w-full h-48" />
    <CardContent className="p-4">
      <Skeleton className="h-6 w-20 mx-auto" />
    </CardContent>
  </Card>
);

const Categories = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-poppins font-bold text-3xl mb-8 text-center">Shop By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-poppins font-bold text-3xl mb-8 text-center">Shop By Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories?.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="bg-white rounded-lg shadow-sm overflow-hidden text-center transition-transform hover:scale-105 cursor-pointer">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="font-medium">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
