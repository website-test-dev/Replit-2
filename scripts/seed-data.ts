import { db } from "../server/db";
import { 
  users, 
  categories, 
  products, 
} from "../shared/schema";

async function seedDatabase() {
  console.log("Seeding database with initial data...");
  
  try {
    // Check if data already exists
    const existingProducts = await db.select().from(products);
    if (existingProducts.length > 0) {
      console.log("Database already has products, skipping seeding.");
      return;
    }

    // Seed categories
    console.log("Adding categories...");
    const categoriesData = [
      { name: "Women", image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww", description: "Women's fashion collection including dresses, tops, and accessories" },
      { name: "Men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D", description: "Men's clothing including shirts, suits, and casual wear" },
      { name: "Kids", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww", description: "Children's clothing for all ages" },
      { name: "Accessories", image: "https://images.unsplash.com/photo-1584184874310-80a0e9a33649?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZhc2hpb24lMjBhY2Nlc3Nvcmllc3xlbnwwfHwwfHx8MA%3D%3D", description: "Fashion accessories including bags, jewelry, and more" },
      { name: "Footwear", image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vdHdlYXJ8ZW58MHx8MHx8fDA%3D", description: "Footwear for all occasions" },
      { name: "Ethnic", image: "https://images.unsplash.com/photo-1610713587134-45dc21cfa08f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Traditional and ethnic clothing" },
      { name: "Sports", image: "https://images.unsplash.com/photo-1519482816300-1490fdf2c2bd?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Sportswear and athletic clothing" },
      { name: "Winter", image: "https://images.unsplash.com/photo-1516431883659-655d4b6bcad4?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", description: "Winter clothing and accessories" },
    ];
    
    const insertedCategories = await Promise.all(
      categoriesData.map(category => db.insert(categories).values(category).returning())
    );
    
    const categoryMap = new Map();
    insertedCategories.forEach(cat => {
      categoryMap.set(cat[0].name, cat[0].id);
    });
    
    // Seed products
    console.log("Adding products...");
    const productsData = [
      // Women's category products
      {
        name: "Summer Floral Dress",
        description: "Beautiful floral print summer dress, perfect for casual outings.",
        price: 49.99,
        discountPrice: 39.99,
        brand: "StyleVista",
        stock: 50,
        image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGZsb3JhbCUyMGRyZXNzfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Women"),
        ratings: 4.5,
        numReviews: 28,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Elegant Evening Gown",
        description: "Stunning evening gown for special occasions, featuring delicate embroidery.",
        price: 129.99,
        discountPrice: 99.99,
        brand: "Glamour",
        stock: 25,
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZXZlbmluZyUyMGdvd258ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Women"),
        ratings: 4.8,
        numReviews: 17,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Classic Denim Jeans",
        description: "Comfortable high-waisted denim jeans with a classic fit.",
        price: 59.99,
        discountPrice: null,
        brand: "DenimLife",
        stock: 100,
        image: "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGplYW5zfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Women"),
        ratings: 4.3,
        numReviews: 42,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Casual Blouse",
        description: "Lightweight cotton blouse, perfect for everyday wear.",
        price: 34.99,
        discountPrice: 29.99,
        brand: "Casual Chic",
        stock: 75,
        image: "https://images.unsplash.com/photo-1624987594587-fc92ef9d8518?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmxvdXNlfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Women"),
        ratings: 4.2,
        numReviews: 31,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Bohemian Maxi Skirt",
        description: "Flowing maxi skirt with bohemian print, ideal for summer.",
        price: 44.99,
        discountPrice: null,
        brand: "BohoStyle",
        stock: 60,
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tpcnR8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Women"),
        ratings: 4.6,
        numReviews: 19,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Women's Business Suit",
        description: "Professional tailored suit for business settings.",
        price: 159.99,
        discountPrice: 129.99,
        brand: "Executive",
        stock: 40,
        image: "https://images.unsplash.com/photo-1580913428735-bd3c269d6a82?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBzdWl0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Women"),
        ratings: 4.7,
        numReviews: 12,
        isFeatured: false,
        createdAt: new Date()
      },

      // Men's category products
      {
        name: "Formal Business Suit",
        description: "Classic tailored suit for professional settings, made from high-quality wool blend.",
        price: 249.99,
        discountPrice: 199.99,
        brand: "Executive",
        stock: 35,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHN1aXR8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Men"),
        ratings: 4.8,
        numReviews: 32,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Casual Button-Down Shirt",
        description: "Comfortable cotton button-down shirt, perfect for casual or semi-formal occasions.",
        price: 39.99,
        discountPrice: 32.99,
        brand: "Casual Style",
        stock: 85,
        image: "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJ1dHRvbiUyMGRvd24lMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Men"),
        ratings: 4.5,
        numReviews: 47,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Slim Fit Jeans",
        description: "Modern slim fit jeans with stretch for comfort and mobility.",
        price: 54.99,
        discountPrice: null,
        brand: "DenimLife",
        stock: 120,
        image: "https://images.unsplash.com/photo-1604176424472-9d9656bdb13a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c2xpbSUyMGZpdCUyMGplYW5zfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Men"),
        ratings: 4.4,
        numReviews: 53,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Polo T-shirt",
        description: "Classic polo t-shirt made from premium cotton.",
        price: 34.99,
        discountPrice: 29.99,
        brand: "SportCasual",
        stock: 95,
        image: "https://images.unsplash.com/photo-1591019055946-c7d2f4dc4e3f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cG9sbyUyMHNoaXJ0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Men"),
        ratings: 4.3,
        numReviews: 41,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Leather Jacket",
        description: "Stylish leather jacket with quilted lining for extra warmth.",
        price: 179.99,
        discountPrice: 149.99,
        brand: "UrbanEdge",
        stock: 30,
        image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bGVhdGhlciUyMGphY2tldHxlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Men"),
        ratings: 4.7,
        numReviews: 29,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Formal Trousers",
        description: "Elegant formal trousers with a comfortable fit.",
        price: 69.99,
        discountPrice: null,
        brand: "Executive",
        stock: 60,
        image: "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dHJvdXNlcnN8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Men"),
        ratings: 4.5,
        numReviews: 31,
        isFeatured: false,
        createdAt: new Date()
      },
      
      // Kids category products
      {
        name: "Children's Summer Dress",
        description: "Colorful and comfortable summer dress for girls.",
        price: 29.99,
        discountPrice: 24.99,
        brand: "KidsFashion",
        stock: 45,
        image: "https://images.unsplash.com/photo-1594608661623-aa0bd3a69799?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2lkcyUyMGRyZXNzfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Kids"),
        ratings: 4.6,
        numReviews: 38,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Boys Casual T-shirt Set",
        description: "Comfortable t-shirt and shorts set for boys.",
        price: 24.99,
        discountPrice: null,
        brand: "KidsFashion",
        stock: 65,
        image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Kids"),
        ratings: 4.5,
        numReviews: 24,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Kids Winter Jacket",
        description: "Warm and water-resistant winter jacket for children.",
        price: 49.99,
        discountPrice: 39.99,
        brand: "KidsOutdoor",
        stock: 40,
        image: "https://images.unsplash.com/photo-1633378292844-aa8eeba44aac?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGtpZHMlMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Kids"),
        ratings: 4.7,
        numReviews: 19,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Children's School Uniform",
        description: "Durable and comfortable school uniform set.",
        price: 34.99,
        discountPrice: 29.99,
        brand: "SchoolStyle",
        stock: 80,
        image: "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2Nob29sJTIwdW5pZm9ybXxlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Kids"),
        ratings: 4.4,
        numReviews: 27,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Kids Denim Overalls",
        description: "Cute and durable denim overalls for active children.",
        price: 39.99,
        discountPrice: null,
        brand: "KidsFashion",
        stock: 55,
        image: "https://images.unsplash.com/photo-1543854704-783ebe5bd8b8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8a2lkcyUyMG92ZXJhbGxzfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Kids"),
        ratings: 4.5,
        numReviews: 22,
        isFeatured: true,
        createdAt: new Date()
      },
      
      // Accessories category products
      {
        name: "Designer Handbag",
        description: "Elegant designer handbag with multiple compartments.",
        price: 89.99,
        discountPrice: 69.99,
        brand: "LuxeStyle",
        stock: 25,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFuZGJhZ3xlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Accessories"),
        ratings: 4.8,
        numReviews: 34,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Statement Necklace",
        description: "Bold statement necklace to elevate any outfit.",
        price: 49.99,
        discountPrice: null,
        brand: "JewelGlam",
        stock: 30,
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmVja2xhY2V8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Accessories"),
        ratings: 4.6,
        numReviews: 21,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Designer Sunglasses",
        description: "UV-protected designer sunglasses with polarized lenses.",
        price: 129.99,
        discountPrice: 99.99,
        brand: "VisionStyle",
        stock: 20,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3VuZ2xhc3Nlc3xlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Accessories"),
        ratings: 4.7,
        numReviews: 18,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Leather Wallet",
        description: "Premium leather wallet with multiple card slots.",
        price: 59.99,
        discountPrice: 49.99,
        brand: "LeatherCraft",
        stock: 45,
        image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2FsbGV0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Accessories"),
        ratings: 4.5,
        numReviews: 27,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Fashion Watch",
        description: "Stylish analog watch with stainless steel band.",
        price: 79.99,
        discountPrice: null,
        brand: "TimeStyle",
        stock: 35,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2F0Y2h8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Accessories"),
        ratings: 4.6,
        numReviews: 23,
        isFeatured: true,
        createdAt: new Date()
      },
      
      // Footwear category products
      {
        name: "Women's Heels",
        description: "Elegant high heels for formal occasions.",
        price: 69.99,
        discountPrice: 59.99,
        brand: "GlamStep",
        stock: 40,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGlnaCUyMGhlZWxzfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Footwear"),
        ratings: 4.5,
        numReviews: 32,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Men's Formal Shoes",
        description: "Classic leather formal shoes for professional settings.",
        price: 89.99,
        discountPrice: null,
        brand: "ClassicStep",
        stock: 30,
        image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9ybWFsJTIwc2hvZXN8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Footwear"),
        ratings: 4.7,
        numReviews: 25,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Athletic Sneakers",
        description: "Lightweight and comfortable athletic sneakers for sports and casual wear.",
        price: 79.99,
        discountPrice: 69.99,
        brand: "SportFlex",
        stock: 50,
        image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Footwear"),
        ratings: 4.6,
        numReviews: 43,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Kids' School Shoes",
        description: "Durable and comfortable school shoes for children.",
        price: 49.99,
        discountPrice: 39.99,
        brand: "KidStep",
        stock: 60,
        image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGtpZHMlMjBzaG9lc3xlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Footwear"),
        ratings: 4.4,
        numReviews: 31,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Casual Sandals",
        description: "Comfortable casual sandals for everyday wear.",
        price: 39.99,
        discountPrice: null,
        brand: "ComfortStep",
        stock: 70,
        image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2FuZGFsc3xlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Footwear"),
        ratings: 4.3,
        numReviews: 37,
        isFeatured: true,
        createdAt: new Date()
      },
      
      // Ethnic category products
      {
        name: "Traditional Saree",
        description: "Elegant silk saree with intricate embroidery.",
        price: 129.99,
        discountPrice: 99.99,
        brand: "EthnicWear",
        stock: 25,
        image: "https://images.unsplash.com/photo-1610189020754-048cce4e2c17?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FyZWV8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Ethnic"),
        ratings: 4.8,
        numReviews: 22,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Men's Kurta Set",
        description: "Traditional kurta pajama set for festive occasions.",
        price: 79.99,
        discountPrice: null,
        brand: "EthnicWear",
        stock: 35,
        image: "https://images.unsplash.com/photo-1618886614638-80e979c5b5d1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a3VydGF8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Ethnic"),
        ratings: 4.6,
        numReviews: 19,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Designer Lehenga",
        description: "Stunning designer lehenga for weddings and special events.",
        price: 199.99,
        discountPrice: 159.99,
        brand: "WeddingGlam",
        stock: 20,
        image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGVoZW5nYXxlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Ethnic"),
        ratings: 4.9,
        numReviews: 15,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Ethnic Jacket",
        description: "Traditional embroidered jacket for festive occasions.",
        price: 89.99,
        discountPrice: 69.99,
        brand: "EthnicWear",
        stock: 30,
        image: "https://images.unsplash.com/photo-1604507513892-343739f54201?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZXRobmljJTIwamFja2V0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Ethnic"),
        ratings: 4.7,
        numReviews: 21,
        isFeatured: false,
        createdAt: new Date()
      },
      
      // Sports category products
      {
        name: "Performance Running Shirt",
        description: "Breathable and moisture-wicking running shirt for optimal performance.",
        price: 34.99,
        discountPrice: 29.99,
        brand: "AthleticPro",
        stock: 60,
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cnVubmluZyUyMHNoaXJ0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Sports"),
        ratings: 4.5,
        numReviews: 29,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Yoga Pants",
        description: "Comfortable and stretchy yoga pants for maximum flexibility.",
        price: 49.99,
        discountPrice: null,
        brand: "YogaFlex",
        stock: 50,
        image: "https://images.unsplash.com/photo-1582296869891-9af87b0fcd29?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHlvZ2ElMjBwYW50c3xlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Sports"),
        ratings: 4.6,
        numReviews: 32,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Sports Jacket",
        description: "Lightweight and water-resistant sports jacket for outdoor activities.",
        price: 69.99,
        discountPrice: 59.99,
        brand: "AthleticPro",
        stock: 40,
        image: "https://images.unsplash.com/photo-1542652735873-fb2825bac6e2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNwb3J0cyUyMGphY2tldHxlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Sports"),
        ratings: 4.7,
        numReviews: 18,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Training Shorts",
        description: "Comfortable training shorts with quick-dry technology.",
        price: 29.99,
        discountPrice: 24.99,
        brand: "SportFlex",
        stock: 70,
        image: "https://images.unsplash.com/photo-1562886877-f12251816e01?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3BvcnRzJTIwc2hvcnRzfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Sports"),
        ratings: 4.4,
        numReviews: 24,
        isFeatured: false,
        createdAt: new Date()
      },
      
      // Winter category products
      {
        name: "Insulated Winter Coat",
        description: "Warm insulated winter coat with water-resistant exterior.",
        price: 129.99,
        discountPrice: 99.99,
        brand: "WinterGuard",
        stock: 35,
        image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2ludGVyJTIwY29hdHxlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Winter"),
        ratings: 4.8,
        numReviews: 27,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Wool Sweater",
        description: "Cozy wool sweater for cold winter days.",
        price: 59.99,
        discountPrice: null,
        brand: "WarmStyle",
        stock: 45,
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8d29vbCUyMHN3ZWF0ZXJ8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Winter"),
        ratings: 4.6,
        numReviews: 22,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Thermal Gloves",
        description: "Insulated thermal gloves with touchscreen compatibility.",
        price: 24.99,
        discountPrice: 19.99,
        brand: "WinterGuard",
        stock: 60,
        image: "https://images.unsplash.com/photo-1603798125914-7b5d30823772?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z2xvdmVzfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Winter"),
        ratings: 4.5,
        numReviews: 25,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Winter Boots",
        description: "Waterproof and insulated winter boots for snow and ice.",
        price: 89.99,
        discountPrice: 79.99,
        brand: "SnowStep",
        stock: 40,
        image: "https://images.unsplash.com/photo-1542840843-3349799cded6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2ludGVyJTIwYm9vdHN8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Winter"),
        ratings: 4.7,
        numReviews: 19,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Knit Beanie",
        description: "Warm knit beanie with fleece lining for extra warmth.",
        price: 19.99,
        discountPrice: null,
        brand: "WarmStyle",
        stock: 80,
        image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVhbmllJTIwaGF0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Winter"),
        ratings: 4.4,
        numReviews: 28,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Thermal Socks",
        description: "Insulated thermal socks for cold weather.",
        price: 14.99,
        discountPrice: 12.99,
        brand: "WinterGuard",
        stock: 100,
        image: "https://images.unsplash.com/photo-1616531758364-731528c4197b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29ja3N8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Winter"),
        ratings: 4.3,
        numReviews: 31,
        isFeatured: false,
        createdAt: new Date()
      },
      
      // Additional products to reach 50
      {
        name: "Casual Backpack",
        description: "Stylish and functional backpack for everyday use.",
        price: 39.99,
        discountPrice: 34.99,
        brand: "UrbanPack",
        stock: 55,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFja3BhY2t8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Accessories"),
        ratings: 4.5,
        numReviews: 33,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Running Cap",
        description: "Lightweight cap with moisture-wicking technology for running and sports.",
        price: 19.99,
        discountPrice: null,
        brand: "SportFlex",
        stock: 70,
        image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FwfGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Sports"),
        ratings: 4.3,
        numReviews: 26,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Casual Loafers",
        description: "Comfortable slip-on loafers for casual settings.",
        price: 59.99,
        discountPrice: 49.99,
        brand: "ComfortStep",
        stock: 45,
        image: "https://images.unsplash.com/photo-1573100925118-870b8efc799d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bG9hZmVyc3xlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Footwear"),
        ratings: 4.5,
        numReviews: 29,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Designer Scarf",
        description: "Elegant designer scarf made from premium materials.",
        price: 29.99,
        discountPrice: 24.99,
        brand: "LuxeStyle",
        stock: 40,
        image: "https://images.unsplash.com/photo-1600717535275-0b18ede2f7fc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2NhcmZ8ZW58MHx8MHx8fDA%3D",
        categoryId: categoryMap.get("Accessories"),
        ratings: 4.4,
        numReviews: 22,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Bomber Jacket",
        description: "Stylish bomber jacket for casual and trendy outfits.",
        price: 79.99,
        discountPrice: 69.99,
        brand: "UrbanEdge",
        stock: 35,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9tYmVyJTIwamFja2V0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Men"),
        ratings: 4.6,
        numReviews: 27,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Cargo Pants",
        description: "Durable cargo pants with multiple pockets for practical use.",
        price: 49.99,
        discountPrice: null,
        brand: "OutdoorStyle",
        stock: 55,
        image: "https://images.unsplash.com/photo-1517445312882-bc9910d018b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyZ28lMjBwYW50c3xlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Men"),
        ratings: 4.3,
        numReviews: 24,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Summer Hat",
        description: "Wide-brimmed sun hat for beach days and summer outings.",
        price: 24.99,
        discountPrice: 19.99,
        brand: "SummerStyle",
        stock: 60,
        image: "https://images.unsplash.com/photo-1565339119519-c855b5a4c31c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3VuJTIwaGF0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Accessories"),
        ratings: 4.4,
        numReviews: 21,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Drawstring Hoodie",
        description: "Comfortable hoodie with drawstring adjustment for casual wear.",
        price: 44.99,
        discountPrice: 39.99,
        brand: "Casual Style",
        stock: 65,
        image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvb2RpZXxlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Men"),
        ratings: 4.5,
        numReviews: 36,
        isFeatured: false,
        createdAt: new Date()
      },
      {
        name: "Pleated Skirt",
        description: "Elegant pleated skirt for formal and casual settings.",
        price: 39.99,
        discountPrice: null,
        brand: "Casual Chic",
        stock: 50,
        image: "https://images.unsplash.com/photo-1582142306909-195724d0a735?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGxlYXRlZCUyMHNraXJ0fGVufDB8fDB8fHww",
        categoryId: categoryMap.get("Women"),
        ratings: 4.5,
        numReviews: 24,
        isFeatured: true,
        createdAt: new Date()
      },
      {
        name: "Puffer Vest",
        description: "Insulated puffer vest for added warmth without restricting movement.",
        price: 54.99,
        discountPrice: 49.99,
        brand: "WinterGuard",
        stock: 45,
        image: "https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHVmZmVyJTIwdmVzdHxlbnwwfHwwfHx8MA%3D%3D",
        categoryId: categoryMap.get("Winter"),
        ratings: 4.6,
        numReviews: 19,
        isFeatured: false,
        createdAt: new Date()
      }
    ];
    
    const insertedProducts = await Promise.all(
      productsData.map(product => db.insert(products).values(product).returning())
    );
    
    console.log(`Added ${insertedProducts.length} products`);
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();