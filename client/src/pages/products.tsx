import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Filter, SlidersHorizontal, Grid3X3, Grid2X2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/products/ProductCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
}

interface Category {
  id: number;
  name: string;
  image: string;
  description: string | null;
}

const Products = () => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/products/:category?");
  const [grid, setGrid] = useState<"grid" | "large">("grid");
  const [filters, setFilters] = useState({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    brands: [] as string[],
    sort: "newest",
    search: "",
  });

  // Parse URL search params
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    if (params.category) {
      setFilters(prev => ({ ...prev, category: params.category }));
    }
    
    if (params.search) {
      setFilters(prev => ({ ...prev, search: params.search }));
    }
    
    if (params.minPrice) {
      setFilters(prev => ({ ...prev, minPrice: Number(params.minPrice) }));
    }
    
    if (params.maxPrice) {
      setFilters(prev => ({ ...prev, maxPrice: Number(params.maxPrice) }));
    }
    
    if (params.sort) {
      setFilters(prev => ({ ...prev, sort: params.sort }));
    }
  }, [location]);

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products", filters],
  });

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Get unique brands from products
  const brands = [...new Set(products.map(product => product.brand))];

  // Apply filters and sorting
  const filteredProducts = products.filter(product => {
    if (filters.category && product.categoryId.toString() !== filters.category) {
      return false;
    }
    
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }
    
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }
    
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase()) && !product.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sort === "priceAsc") {
      const aPrice = a.discountPrice || a.price;
      const bPrice = b.discountPrice || b.price;
      return aPrice - bPrice;
    }
    
    if (filters.sort === "priceDesc") {
      const aPrice = a.discountPrice || a.price;
      const bPrice = b.discountPrice || b.price;
      return bPrice - aPrice;
    }
    
    if (filters.sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    if (filters.sort === "popular") {
      return b.ratings - a.ratings;
    }
    
    return 0;
  });

  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Toggle brand filter
  const toggleBrandFilter = (brand: string) => {
    setFilters(prev => {
      if (prev.brands.includes(brand)) {
        return { ...prev, brands: prev.brands.filter(b => b !== brand) };
      }
      return { ...prev, brands: [...prev.brands, brand] };
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      brands: [],
      sort: "newest",
      search: "",
    });
  };

  // Get category name from ID
  const getCategoryName = (id: string): string => {
    const category = categories.find(c => c.id.toString() === id);
    return category ? category.name : "All Products";
  };

  // Page title
  const pageTitle = filters.category 
    ? `${getCategoryName(filters.category)} - FashionExpress` 
    : "All Products - FashionExpress";

  // Page description
  const pageDescription = filters.category 
    ? `Shop our collection of ${getCategoryName(filters.category)} with same-day delivery options.` 
    : "Browse our full collection of fashion products with same-day delivery options.";

  const isLoading = isLoadingProducts || isLoadingCategories;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold font-poppins">
            {filters.category ? getCategoryName(filters.category) : "All Products"}
          </h1>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter size={16} />
                  <span className="hidden md:inline">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                  <SheetDescription>
                    Narrow down your search with specific filters.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Categories</h3>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => handleFilterChange("category", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Price Range</h3>
                    <div>
                      <Slider
                        defaultValue={[filters.minPrice, filters.maxPrice]}
                        max={10000}
                        step={100}
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={(value) => {
                          handleFilterChange("minPrice", value[0]);
                          handleFilterChange("maxPrice", value[1]);
                        }}
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>₹{filters.minPrice}</span>
                        <span>₹{filters.maxPrice}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Brands</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={filters.brands.includes(brand)}
                            onCheckedChange={() => toggleBrandFilter(brand)}
                          />
                          <Label htmlFor={`brand-${brand}`} className="text-sm">
                            {brand}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <Button onClick={() => {
                      document.body.click(); // Close sheet on mobile
                    }}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Popularity</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="hidden md:flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${grid === 'grid' ? 'bg-gray-100' : ''}`}
                onClick={() => setGrid("grid")}
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 ${grid === 'large' ? 'bg-gray-100' : ''}`}
                onClick={() => setGrid("large")}
              >
                <Grid2X2 size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        {isLoading ? (
          <div className="min-h-[400px] flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              grid === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {sortedProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  showRating={grid === 'large'} 
                  showBrand={grid === 'large'} 
                />
              ))}
            </div>
            
            {sortedProducts.length === 0 && (
              <div className="min-h-[300px] flex flex-col justify-center items-center text-center">
                <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-medium mb-2">No products found</h2>
                <p className="text-muted-foreground max-w-md">
                  Try adjusting your filters or search term to find what you're looking for.
                </p>
                <Button className="mt-4" onClick={resetFilters}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Products;
