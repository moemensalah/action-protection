import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const { page = 1, limit = 12, category, search } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      let products;
      if (category && category !== "all") {
        products = await storage.getProductsByCategorySlug(category as string);
      } else {
        products = await storage.getProducts();
      }

      // Apply search filter if provided
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        products = products.filter(product => 
          product.nameEn.toLowerCase().includes(searchTerm) ||
          product.nameAr.toLowerCase().includes(searchTerm) ||
          product.descriptionEn?.toLowerCase().includes(searchTerm) ||
          product.descriptionAr?.toLowerCase().includes(searchTerm)
        );
      }

      // Calculate pagination
      const total = products.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedProducts = products.slice(startIndex, endIndex);

      res.json({
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Content Management APIs
  app.get("/api/about", async (req, res) => {
    try {
      const aboutUs = await storage.getAboutUs();
      res.json(aboutUs);
    } catch (error) {
      console.error("Error fetching about us:", error);
      res.status(500).json({ message: "Failed to fetch about us content" });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const contactUs = await storage.getContactUs();
      res.json(contactUs);
    } catch (error) {
      console.error("Error fetching contact us:", error);
      res.status(500).json({ message: "Failed to fetch contact us content" });
    }
  });

  app.get("/api/footer", async (req, res) => {
    try {
      const footerContent = await storage.getFooterContent();
      res.json(footerContent);
    } catch (error) {
      console.error("Error fetching footer content:", error);
      res.status(500).json({ message: "Failed to fetch footer content" });
    }
  });

  app.get("/api/widgets", async (req, res) => {
    try {
      const widgets = await storage.getWidgetSettings();
      res.json(widgets);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      res.status(500).json({ message: "Failed to fetch widget settings" });
    }
  });

  app.get("/api/widgets/:name", async (req, res) => {
    try {
      const widget = await storage.getWidgetByName(req.params.name);
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      res.json(widget);
    } catch (error) {
      console.error("Error fetching widget:", error);
      res.status(500).json({ message: "Failed to fetch widget" });
    }
  });

  // Simple admin authentication middleware (mock for development)
  const requireAdmin = (req: any, res: any, next: any) => {
    // For now, allow all admin requests - in production, check JWT/session
    req.user = { role: 'administrator', id: 'admin1' };
    next();
  };

  const requireModerator = (req: any, res: any, next: any) => {
    // For now, allow all moderator requests - in production, check JWT/session
    req.user = { role: 'moderator', id: 'mod1' };
    next();
  };

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    
    // Mock authentication - in production, verify against database
    if (email === "admin@latelounge.sa" && password === "admin123") {
      res.json({
        success: true,
        user: {
          id: "admin1",
          email: "admin@latelounge.sa",
          firstName: "System",
          lastName: "Administrator",
          role: "administrator"
        },
        token: "mock-admin-token"
      });
    } else if (email === "moderator@latelounge.sa" && password === "mod123") {
      res.json({
        success: true,
        user: {
          id: "mod1", 
          email: "moderator@latelounge.sa",
          firstName: "Content",
          lastName: "Moderator",
          role: "moderator"
        },
        token: "mock-moderator-token"
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Admin Categories CRUD
  app.post("/api/admin/categories", requireModerator, async (req, res) => {
    try {
      const categoryData = req.body;
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", requireModerator, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const categoryData = req.body;
      const category = await storage.updateCategory(categoryId, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Admin Products CRUD
  app.post("/api/admin/products", requireModerator, async (req, res) => {
    try {
      const productData = req.body;
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", requireModerator, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = req.body;
      const product = await storage.updateProduct(productId, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Admin Content Management (Administrator only)
  app.put("/api/admin/about", requireAdmin, async (req, res) => {
    try {
      const aboutData = req.body;
      const aboutUs = await storage.createOrUpdateAboutUs(aboutData);
      res.json(aboutUs);
    } catch (error) {
      console.error("Error updating about us:", error);
      res.status(500).json({ message: "Failed to update about us content" });
    }
  });

  app.put("/api/admin/contact", requireAdmin, async (req, res) => {
    try {
      const contactData = req.body;
      const contactUs = await storage.createOrUpdateContactUs(contactData);
      res.json(contactUs);
    } catch (error) {
      console.error("Error updating contact us:", error);
      res.status(500).json({ message: "Failed to update contact us content" });
    }
  });

  app.put("/api/admin/footer", requireAdmin, async (req, res) => {
    try {
      const footerData = req.body;
      const footerContent = await storage.createOrUpdateFooterContent(footerData);
      res.json(footerContent);
    } catch (error) {
      console.error("Error updating footer content:", error);
      res.status(500).json({ message: "Failed to update footer content" });
    }
  });

  // Admin Users Management (Administrator only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      // Mock users data - in production, fetch from database
      const users = [
        {
          id: "admin1",
          email: "admin@latelounge.sa",
          firstName: "System",
          lastName: "Administrator",
          role: "administrator",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "mod1",
          email: "moderator@latelounge.sa", 
          firstName: "Content",
          lastName: "Moderator",
          role: "moderator",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      // Mock user creation - in production, save to database
      const newUser = {
        id: `user_${Date.now()}`,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      // Mock user update - in production, update in database
      const updatedUser = {
        id: userId,
        ...userData,
        updatedAt: new Date().toISOString()
      };
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}