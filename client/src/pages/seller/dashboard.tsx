import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { LocationData } from '@/hooks/useLocation';

import { ProductForm } from '@/components/seller/ProductForm';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Loader2,
  BarChart3,
  ShoppingBag,
  DollarSign,
  Truck,
  AlertCircle
} from 'lucide-react';

// Define types for products and sales data
interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  image: string;
  brand: string;
  categoryId: number;
  category?: {
    name: string;
  };
}

interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
}

// Mock sales data - in a real app this would come from an API
const mockSalesSummary: SalesSummary = {
  totalSales: 152,
  totalOrders: 47,
  pendingOrders: 12,
  revenue: 125750
};

export default function SellerDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch products for seller (in a real app these would be filtered by sellerId)
  const { 
    data: products = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['/api/products'],
  });

  // Delete product mutation
  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/seller/products/${id}`);
    },
    onSuccess: () => {
      refetch();
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting the product.',
        variant: 'destructive',
      });
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Handle product form submission success
  const handleProductFormSuccess = () => {
    setIsAddingProduct(false);
    setEditingProductId(null);
    refetch();
  };

  // Handle delete product confirmation
  const confirmDelete = (id: number) => {
    setDeleteProductId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Seller Dashboard - Fashion Express</title>
        <meta name="description" content="Manage your products, orders, and sales as a seller on Fashion Express." />
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your products, track sales, and fulfill orders</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsAddingProduct(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{mockSalesSummary.totalSales}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(mockSalesSummary.revenue)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{mockSalesSummary.totalOrders}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Truck className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{mockSalesSummary.pendingOrders}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>
                  Manage your product listings, inventory, and details
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't added any products yet. Start by adding your first product.
                  </p>
                  <Button onClick={() => setIsAddingProduct(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableCaption>A list of your products</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: Product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {product.discountPrice ? (
                            <div>
                              <span className="line-through text-muted-foreground mr-2">
                                {formatCurrency(product.price)}
                              </span>
                              <span className="text-primary font-medium">
                                {formatCurrency(product.discountPrice)}
                              </span>
                            </div>
                          ) : (
                            formatCurrency(product.price)
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={product.stock === 0 ? 'text-destructive' : ''}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setEditingProductId(product.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => confirmDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => window.open(`/products/${product.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>
                View, process, and track customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex flex-col items-center justify-center text-center max-w-md">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Truck className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Order Management Feature</h3>
                  <p className="text-muted-foreground mt-2">
                    The complete order management system would display orders, allow status updates, and track shipments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>
                Track your sales performance and customer insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex flex-col items-center justify-center text-center max-w-md">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <BarChart3 className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
                  <p className="text-muted-foreground mt-2">
                    The full analytics implementation would include sales charts, customer demographics, and product performance metrics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Seller Settings</CardTitle>
              <CardDescription>
                Update your store information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex flex-col items-center justify-center text-center max-w-md">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <AlertCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Settings Interface</h3>
                  <p className="text-muted-foreground mt-2">
                    The complete settings interface would allow you to update your store details, payment methods, shipping options, and notification preferences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      {isAddingProduct && (
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSuccess={handleProductFormSuccess} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {editingProductId && (
        <Dialog open={!!editingProductId} onOpenChange={() => setEditingProductId(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <ProductForm productId={editingProductId} onSuccess={handleProductFormSuccess} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteProductId && deleteProduct(deleteProductId)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}