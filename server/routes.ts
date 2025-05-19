import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCartItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  insertWishlistItemSchema,
  insertReviewSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStoreSession = MemoryStore(session);

  // Configure session & authentication
  app.use(
    session({
      secret: "fashion-express-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // In a real app, we would hash and compare passwords
        if (user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ 
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as any;
    res.json({ 
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    });
  });

  // User routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // Auto login after registration
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error during login after registration" });
        }
        return res.status(201).json({ 
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.get("/api/users/profile", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const userProfile = await storage.getUser(user.id);
    
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password in response
    const { password, ...profileData } = userProfile;
    res.json(profileData);
  });

  app.put("/api/users/profile", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userData = req.body;
      
      // Don't allow changing username or email to ones that already exist
      if (userData.username) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      if (userData.email) {
        const existingUser = await storage.getUserByEmail(userData.email);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      const updatedUser = await storage.updateUser(user.id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password in response
      const { password, ...profileData } = updatedUser;
      res.json(profileData);
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
      const search = req.query.search as string | undefined;
      const featured = req.query.featured === 'true';
      
      let products;
      
      if (categoryId && !isNaN(categoryId)) {
        products = await storage.getProductsByCategory(categoryId);
      } else if (search) {
        products = await storage.searchProducts(search);
      } else if (featured) {
        products = await storage.getFeaturedProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const cartItems = await storage.getCartItemsWithProducts(user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart items" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const cartItemData = { ...req.body, userId: user.id };
      
      const validatedData = insertCartItemSchema.parse(cartItemData);
      
      // Check if product exists
      const product = await storage.getProduct(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if product is in stock
      if (product.stock < validatedData.quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      
      const cartItem = await storage.addToCart(validatedData);
      
      const cartItemWithProduct = {
        ...cartItem,
        product
      };
      
      res.status(201).json(cartItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error adding to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      // Verify cart item belongs to user
      const cartItem = await storage.getCartItem(id);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (cartItem.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this cart item" });
      }
      
      // Check if product is in stock
      if (req.body.quantity) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        
        if (product.stock < req.body.quantity) {
          return res.status(400).json({ message: "Not enough stock available" });
        }
      }
      
      const updatedCartItem = await storage.updateCartItem(id, req.body);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const product = await storage.getProduct(updatedCartItem.productId);
      
      const cartItemWithProduct = {
        ...updatedCartItem,
        product
      };
      
      res.json(cartItemWithProduct);
    } catch (error) {
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      // Verify cart item belongs to user
      const cartItem = await storage.getCartItem(id);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (cartItem.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to delete this cart item" });
      }
      
      const deleted = await storage.removeFromCart(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Cart item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting cart item" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.clearCart(user.id);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Order routes
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { orderData, items } = req.body;
      
      // Validate order data
      const validatedOrderData = insertOrderSchema.parse({
        ...orderData,
        userId: user.id
      });
      
      // Validate order items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      const validatedItems: typeof items = [];
      let orderTotal = 0;
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Not enough stock for product "${product.name}"` });
        }
        
        const price = product.discountPrice || product.price;
        const itemTotal = price * item.quantity;
        orderTotal += itemTotal;
        
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price
        });
        
        // Update product stock
        await storage.updateProduct(product.id, {
          stock: product.stock - item.quantity
        });
      }
      
      // Create order
      const order = await storage.createOrder(
        { ...validatedOrderData, total: orderTotal },
        validatedItems
      );
      
      // Clear cart after order is placed
      await storage.clearCart(user.id);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const orders = await storage.getUserOrders(user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrderWithItems(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify order belongs to user
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  // Order tracking routes
  app.get("/api/orders/:id/tracking", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify order belongs to user
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to view this order tracking" });
      }
      
      const tracking = await storage.getOrderTracking(id);
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order tracking" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const wishlistItems = await storage.getWishlistItemsWithProducts(user.id);
      res.json(wishlistItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching wishlist items" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const wishlistItemData = { ...req.body, userId: user.id };
      
      const validatedData = insertWishlistItemSchema.parse(wishlistItemData);
      
      // Check if product exists
      const product = await storage.getProduct(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const wishlistItem = await storage.addToWishlist(validatedData);
      
      const wishlistItemWithProduct = {
        ...wishlistItem,
        product
      };
      
      res.status(201).json(wishlistItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error adding to wishlist" });
    }
  });

  app.delete("/api/wishlist/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid wishlist item ID" });
      }
      
      // Verify wishlist item belongs to user
      const wishlistItem = await storage.getWishlistItems(user.id);
      const item = wishlistItem.find(item => item.id === id);
      
      if (!item) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      
      const deleted = await storage.removeFromWishlist(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      
      res.json({ message: "Wishlist item removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error removing from wishlist" });
    }
  });

  // Reviews routes
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const reviews = await storage.getProductReviews(id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product reviews" });
    }
  });

  app.post("/api/products/:id/reviews", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const reviewData = {
        ...req.body,
        userId: user.id,
        productId
      };
      
      const validatedData = insertReviewSchema.parse(reviewData);
      
      const review = await storage.createReview(validatedData);
      
      // Get updated product with new rating
      const updatedProduct = await storage.getProduct(productId);
      
      res.status(201).json({
        review,
        product: updatedProduct
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Error creating review" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
