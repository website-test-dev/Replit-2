import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Upload, 
  Trash2,
  Loader2
} from 'lucide-react';

// Form schema for product data
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  discountPrice: z.coerce.number().positive('Discount price must be positive').nullable().optional(),
  brand: z.string().min(1, 'Brand is required'),
  stock: z.coerce.number().int().nonnegative('Stock must be 0 or higher'),
  categoryId: z.coerce.number().int().positive('Category is required'),
  isFeatured: z.boolean().default(false),
  image: z.string().url('Image must be a valid URL'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: number; // If provided, we're editing an existing product
  onSuccess?: () => void;
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fetch product data if editing
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  // Create the form
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      discountPrice: null,
      brand: '',
      stock: 0,
      categoryId: 0,
      isFeatured: false,
      image: '',
    },
  });

  // Set form values when product data is loaded
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        brand: product.brand,
        stock: product.stock,
        categoryId: product.categoryId,
        isFeatured: product.isFeatured || false,
        image: product.image,
      });
      setImagePreview(product.image);
    }
  }, [product, form]);

  // Create/Edit product mutation
  const { mutate: saveProduct, isPending } = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (productId) {
        // Edit existing product
        return apiRequest('PATCH', `/api/seller/products/${productId}`, data);
      } else {
        // Create new product
        return apiRequest('POST', '/api/seller/products', data);
      }
    },
    onSuccess: () => {
      // Invalidate products cache and show success message
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: productId ? 'Product updated' : 'Product created',
        description: productId
          ? 'The product has been updated successfully.'
          : 'The product has been created successfully.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImagePreview(url || null);
    form.setValue('image', url);
  };

  // Handle image upload placeholder
  const handleImageUpload = () => {
    // In a real implementation, this would upload to a cloud storage
    // and return a URL to store in the database
    setIsUploading(true);
    
    // Simulate an upload delay
    setTimeout(() => {
      setIsUploading(false);
      const placeholderUrl = 'https://images.unsplash.com/photo-1575539665082-c93c71c41eb1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZGVmYXVsdCUyMHByb2R1Y3R8ZW58MHx8MHx8fDA%3D';
      form.setValue('image', placeholderUrl);
      setImagePreview(placeholderUrl);
      
      toast({
        title: 'Image uploaded',
        description: 'This is a placeholder. In a real app, your image would be uploaded to cloud storage.',
      });
    }, 1500);
  };

  // Submit form
  const onSubmit = (data: ProductFormData) => {
    saveProduct(data);
  };

  // Clear form
  const resetForm = () => {
    form.reset();
    setImagePreview(null);
  };

  if (productId && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{productId ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <CardDescription>
          {productId
            ? 'Update your product information'
            : 'Create a new product listing'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Product name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your product"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price and Discount Price */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Brand and Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Featured Product */}
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Product</FormLabel>
                        <FormDescription>
                          Featured products appear on the homepage
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                {/* Product Image */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image URL</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <Input
                            placeholder="Image URL"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageChange(e);
                            }}
                          />
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleImageUpload}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </>
                              )}
                            </Button>
                            {imagePreview && (
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                  setImagePreview(null);
                                  form.setValue('image', '');
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Preview */}
                <div className="mt-4">
                  <p className="text-sm mb-2">Image Preview</p>
                  <div className="border rounded-md overflow-hidden h-[250px] flex items-center justify-center bg-gray-50">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        No image selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isPending}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {productId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{productId ? 'Update Product' : 'Create Product'}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}