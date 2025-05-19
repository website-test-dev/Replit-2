import {
  User, InsertUser, users,
  Product, InsertProduct, products,
  Category, InsertCategory, categories,
  CartItem, InsertCartItem, cartItems,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems,
  OrderTracking, InsertOrderTracking, orderTracking,
  WishlistItem, InsertWishlistItem, wishlistItems,
  Review, InsertReview, reviews
} from "@shared/schema";

// Define interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItemsWithProducts(userId: number): Promise<(CartItem & { product: Product })[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, cartItem: Partial<CartItem>): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  getOrderWithItems(orderId: number): Promise<Order & { items: (OrderItem & { product: Product })[] } | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order tracking operations
  getOrderTracking(orderId: number): Promise<OrderTracking[]>;
  addOrderTracking(tracking: InsertOrderTracking): Promise<OrderTracking>;
  
  // Wishlist operations
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  getWishlistItemsWithProducts(userId: number): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: number): Promise<boolean>;
  
  // Review operations
  getProductReviews(productId: number): Promise<(Review & { user: { name: string } })[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateProductRating(productId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private orderTracking: Map<number, OrderTracking>;
  private wishlistItems: Map<number, WishlistItem>;
  private reviews: Map<number, Review>;
  
  private lastIds: {
    users: number;
    categories: number;
    products: number;
    cartItems: number;
    orders: number;
    orderItems: number;
    orderTracking: number;
    wishlistItems: number;
    reviews: number;
  };

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.orderTracking = new Map();
    this.wishlistItems = new Map();
    this.reviews = new Map();
    
    this.lastIds = {
      users: 0,
      categories: 0,
      products: 0,
      cartItems: 0,
      orders: 0,
      orderItems: 0,
      orderTracking: 0,
      wishlistItems: 0,
      reviews: 0
    };
    
    // Initialize with sample data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = ++this.lastIds.users;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = ++this.lastIds.categories;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.brand.toLowerCase().includes(searchQuery)
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = ++this.lastIds.products;
    const newProduct: Product = { 
      ...product, 
      id, 
      ratings: 0, 
      numReviews: 0, 
      createdAt: new Date() 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getCartItemsWithProducts(userId: number): Promise<(CartItem & { product: Product })[]> {
    const cartItems = await this.getCartItems(userId);
    
    return cartItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      return {
        ...item,
        product
      };
    });
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item is already in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === cartItem.userId && item.productId === cartItem.productId
    );
    
    if (existingItem) {
      // Update quantity
      const updatedItem = { 
        ...existingItem, 
        quantity: existingItem.quantity + cartItem.quantity 
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    // Add new item
    const id = ++this.lastIds.cartItems;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItem(id: number, cartItemData: Partial<CartItem>): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, ...cartItemData };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    userCartItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }

  // Order operations
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = ++this.lastIds.orders;
    
    // Set delivery expected date to 24 hours from now
    const deliveryExpectedBy = new Date();
    deliveryExpectedBy.setHours(deliveryExpectedBy.getHours() + 24);
    
    const newOrder: Order = { 
      ...orderData, 
      id, 
      status: 'pending', 
      paymentStatus: 'pending', 
      createdAt: new Date(),
      deliveryExpectedBy
    };
    this.orders.set(id, newOrder);
    
    // Add order items
    items.forEach(item => {
      const orderItemId = ++this.lastIds.orderItems;
      const orderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId: id
      };
      this.orderItems.set(orderItemId, orderItem);
    });
    
    // Add initial tracking entry
    this.addOrderTracking({
      orderId: id,
      status: 'Order Placed',
      description: 'Your order has been placed successfully.'
    });
    
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    ).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async getOrderWithItems(orderId: number): Promise<Order & { items: (OrderItem & { product: Product })[] } | undefined> {
    const order = this.orders.get(orderId);
    if (!order) return undefined;
    
    const items = await this.getOrderItems(orderId);
    const itemsWithProducts = items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      return {
        ...item,
        product
      };
    });
    
    return {
      ...order,
      items: itemsWithProducts
    };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    
    // Add tracking entry
    const description = `Your order status has been updated to ${status}.`;
    await this.addOrderTracking({
      orderId: id,
      status,
      description
    });
    
    return updatedOrder;
  }

  // Order tracking operations
  async getOrderTracking(orderId: number): Promise<OrderTracking[]> {
    return Array.from(this.orderTracking.values())
      .filter(tracking => tracking.orderId === orderId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async addOrderTracking(tracking: InsertOrderTracking): Promise<OrderTracking> {
    const id = ++this.lastIds.orderTracking;
    const newTracking: OrderTracking = { 
      ...tracking, 
      id, 
      timestamp: new Date() 
    };
    this.orderTracking.set(id, newTracking);
    return newTracking;
  }

  // Wishlist operations
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getWishlistItemsWithProducts(userId: number): Promise<(WishlistItem & { product: Product })[]> {
    const wishlistItems = await this.getWishlistItems(userId);
    
    return wishlistItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      return {
        ...item,
        product
      };
    });
  }

  async addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    // Check if already in wishlist
    const existingItem = Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === wishlistItem.userId && item.productId === wishlistItem.productId
    );
    
    if (existingItem) {
      return existingItem;
    }
    
    const id = ++this.lastIds.wishlistItems;
    const newWishlistItem: WishlistItem = { ...wishlistItem, id };
    this.wishlistItems.set(id, newWishlistItem);
    return newWishlistItem;
  }

  async removeFromWishlist(id: number): Promise<boolean> {
    return this.wishlistItems.delete(id);
  }

  // Review operations
  async getProductReviews(productId: number): Promise<(Review & { user: { name: string } })[]> {
    const productReviews = Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
    
    return productReviews.map(review => {
      const user = this.users.get(review.userId);
      if (!user) throw new Error(`User ${review.userId} not found`);
      
      return {
        ...review,
        user: {
          name: user.name
        }
      };
    }).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = ++this.lastIds.reviews;
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: new Date() 
    };
    this.reviews.set(id, newReview);
    
    // Update product rating
    await this.updateProductRating(review.productId);
    
    return newReview;
  }

  async updateProductRating(productId: number): Promise<void> {
    const product = this.products.get(productId);
    if (!product) return;
    
    const productReviews = Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
    
    const numReviews = productReviews.length;
    
    if (numReviews === 0) {
      const updatedProduct = { 
        ...product, 
        ratings: 0,
        numReviews: 0
      };
      this.products.set(productId, updatedProduct);
      return;
    }
    
    const totalRating = productReviews.reduce(
      (sum, review) => sum + review.rating, 
      0
    );
    
    const avgRating = totalRating / numReviews;
    
    const updatedProduct = { 
      ...product, 
      ratings: Number(avgRating.toFixed(1)),
      numReviews
    };
    this.products.set(productId, updatedProduct);
  }

  // Initialize with sample data
  private initializeData(): void {
    // Categories
    const categories: InsertCategory[] = [
      {
        name: "Women",
        image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
        description: "Women's fashion collection"
      },
      {
        name: "Men",
        image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
        description: "Men's fashion collection"
      },
      {
        name: "Kids",
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
        description: "Kids' fashion collection"
      },
      {
        name: "Footwear",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
        description: "Footwear collection"
      },
      {
        name: "Accessories",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
        description: "Fashion accessories"
      },
      {
        name: "Beauty",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
        description: "Beauty products"
      }
    ];

    categories.forEach(category => {
      const id = ++this.lastIds.categories;
      this.categories.set(id, { ...category, id });
    });

    // Products
    const products: (InsertProduct & { isFeatured: boolean })[] = [
      {
        name: "Summer Floral Dress",
        description: "Beautiful floral summer dress perfect for any occasion.",
        price: 2499,
        discountPrice: 1299,
        stock: 50,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 1,
        brand: "FashionPlus",
        isFeatured: true
      },
      {
        name: "Men's Casual Shirt",
        description: "Comfortable and stylish casual shirt for everyday wear.",
        price: 1699,
        discountPrice: 899,
        stock: 75,
        image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 2,
        brand: "CasualMen",
        isFeatured: true
      },
      {
        name: "Trendy Sneakers",
        description: "Trendy and comfortable sneakers for everyday use.",
        price: 3999,
        discountPrice: 2499,
        stock: 30,
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 4,
        brand: "StepUP",
        isFeatured: true
      },
      {
        name: "Designer Handbag",
        description: "Elegant designer handbag to complement your outfit.",
        price: 3499,
        discountPrice: 1899,
        stock: 20,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 5,
        brand: "LuxuryBags",
        isFeatured: true
      },
      {
        name: "Stylish Sunglasses",
        description: "Protect your eyes with these stylish sunglasses.",
        price: 1499,
        discountPrice: 799,
        stock: 45,
        image: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 5,
        brand: "VisionPlus",
        isFeatured: true
      },
      {
        name: "Women's Denim Jacket",
        description: "Classic denim jacket that goes with everything.",
        price: 1599,
        discountPrice: null,
        stock: 40,
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 1,
        brand: "DenimWorld",
        isFeatured: false
      },
      {
        name: "Kid's Colorful T-Shirt",
        description: "Soft and comfortable t-shirt for your little ones.",
        price: 899,
        discountPrice: 499,
        stock: 80,
        image: "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 3,
        brand: "KiddieComfort",
        isFeatured: true
      },
      {
        name: "Men's Formal Suit",
        description: "Sharp and professional formal suit for special occasions.",
        price: 4999,
        discountPrice: 3999,
        stock: 25,
        image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 2,
        brand: "EliteStyles",
        isFeatured: false
      },
      {
        name: "Women's Workout Leggings",
        description: "High-performance leggings for your workout sessions.",
        price: 1299,
        discountPrice: 799,
        stock: 60,
        image: "https://images.unsplash.com/photo-1602779300361-1ffb58f3e0a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 1,
        brand: "FitLife",
        isFeatured: true
      },
      {
        name: "Kid's Winter Jacket",
        description: "Warm and cozy winter jacket for kids.",
        price: 1999,
        discountPrice: 1499,
        stock: 35,
        image: "https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 3,
        brand: "WarmKids",
        isFeatured: false
      },
      {
        name: "Men's Canvas Shoes",
        description: "Casual canvas shoes for everyday comfort.",
        price: 2499,
        discountPrice: 1799,
        stock: 45,
        image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 4,
        brand: "ComfortStep",
        isFeatured: false
      },
      {
        name: "Silver Necklace",
        description: "Elegant silver necklace to elevate any outfit.",
        price: 1899,
        discountPrice: 1299,
        stock: 30,
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 5,
        brand: "SilverGlow",
        isFeatured: true
      },
      {
        name: "Women's Summer Hat",
        description: "Stylish summer hat for sun protection.",
        price: 1199,
        discountPrice: 799,
        stock: 50,
        image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 5,
        brand: "SunStyle",
        isFeatured: false
      },
      {
        name: "Kid's Cartoon Backpack",
        description: "Fun and colorful backpack for school or travel.",
        price: 1499,
        discountPrice: 999,
        stock: 40,
        image: "https://images.unsplash.com/photo-1541099648461-5a559e748372?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500&q=80",
        categoryId: 3,
        brand: "FunPack",
        isFeatured: true
      }
    ];

    products.forEach(product => {
      const id = ++this.lastIds.products;
      this.products.set(id, { 
        ...product, 
        id, 
        ratings: 0, 
        numReviews: 0, 
        createdAt: new Date() 
      });
    });

    // Demo user
    this.createUser({
      username: "demouser",
      password: "demopassword",
      email: "demo@example.com",
      name: "Demo User",
      phone: "9876543210",
      address: "123 Demo Street",
      city: "Demo City",
      state: "Demo State",
      pincode: "123456"
    });
  }
}

export const storage = new MemStorage();
