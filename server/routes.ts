import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";


export async function registerRoutes(app: Express): Promise<Server> {
  // Skip Replit auth for local authentication development
  // await setupAuth(app);
  
  // Session middleware for local admin authentication
  // Don't add duplicate session middleware - it's already configured in replitAuth.ts
  // This prevents session conflicts in production

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    fileFilter: (req, file, cb) => {
      // Only allow image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  // Admin middleware - allow access for development
  const requireAdmin = (req: any, res: any, next: any) => {
    // For development, allow all access
    // In production, this would check actual authentication
    next();
  };

  const requireModerator = requireAdmin;

  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  }, express.static(uploadsDir));

  // File upload endpoints
  app.post('/api/upload/image', requireModerator, upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Generate full URL for the uploaded file
      const protocol = req.protocol;
      const host = req.get('Host');
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Local authentication routes
  app.post('/api/auth/local/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Validate password
      const isValidPassword = await storage.validatePassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store user in session (simplified session management)
      (req.session as any).localUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/local/logout', (req, res) => {
    (req.session as any).localUser = null;
    res.json({ message: "Logout successful" });
  });

  app.get('/api/auth/local/user', (req: any, res) => {
    if (req.session && req.session.localUser) {
      // Refresh session to keep it alive
      req.session.touch();
      res.json(req.session.localUser);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Local auth middleware
  const requireLocalAuth = (req: any, res: any, next: any) => {
    if (req.session.localUser) {
      req.localUser = req.session.localUser;
      next();
    } else {
      res.status(401).json({ message: "Authentication required" });
    }
  };

  const requireLocalAdmin = (req: any, res: any, next: any) => {
    if (req.session.localUser && req.session.localUser.role === "administrator") {
      req.localUser = req.session.localUser;
      next();
    } else {
      res.status(403).json({ message: "Administrator access required" });
    }
  };



  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const { page = 1, limit = 12, search } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      let categories = await storage.getCategories();

      // Apply search filter if provided
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        categories = categories.filter(category => 
          category.nameEn.toLowerCase().includes(searchTerm) ||
          category.nameAr.toLowerCase().includes(searchTerm) ||
          category.descriptionEn?.toLowerCase().includes(searchTerm) ||
          category.descriptionAr?.toLowerCase().includes(searchTerm)
        );
      }

      // Calculate pagination
      const total = categories.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedCategories = categories.slice(startIndex, endIndex);

      res.json({
        categories: paginatedCategories,
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

  app.get("/api/privacy-policy", async (req, res) => {
    try {
      const privacyPolicy = await storage.getPrivacyPolicy();
      res.json(privacyPolicy);
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
      res.status(500).json({ message: "Failed to fetch privacy policy" });
    }
  });

  app.get("/api/terms-of-service", async (req, res) => {
    try {
      const termsOfService = await storage.getTermsOfService();
      res.json(termsOfService);
    } catch (error) {
      console.error("Error fetching terms of service:", error);
      res.status(500).json({ message: "Failed to fetch terms of service" });
    }
  });

  // SMTP Settings routes (using admin middleware)
  app.get("/api/admin/smtp-settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSmtpSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching SMTP settings:", error);
      res.status(500).json({ message: "Failed to fetch SMTP settings" });
    }
  });

  app.post("/api/admin/smtp-settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.createOrUpdateSmtpSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error saving SMTP settings:", error);
      res.status(500).json({ message: "Failed to save SMTP settings" });
    }
  });

  app.post("/api/admin/smtp-settings/test", requireAdmin, async (req, res) => {
    try {
      const nodemailer = require('nodemailer');
      const settings = req.body;

      const transporter = nodemailer.createTransporter({
        host: settings.host,
        port: settings.port,
        secure: settings.port === 465,
        auth: {
          user: settings.username,
          pass: settings.password,
        },
      });

      await transporter.sendMail({
        from: `"${settings.fromName}" <${settings.fromEmail}>`,
        to: settings.fromEmail,
        subject: 'Test Email from LateLounge',
        text: 'This is a test email to verify SMTP configuration.',
        html: '<p>This is a test email to verify SMTP configuration.</p>',
      });

      res.json({ message: "Test email sent successfully" });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email", error: error.message });
    }
  });

  // Contact form with SMTP integration
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required" });
      }

      // Get SMTP settings
      const smtpSettings = await storage.getSmtpSettings();
      
      if (!smtpSettings || !smtpSettings.isActive) {
        // For development, accept the form submission even without SMTP
        console.log("SMTP not configured, but accepting contact form submission");
        return res.json({ message: "Message received successfully" });
      }

      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: smtpSettings.host,
        port: smtpSettings.port,
        secure: smtpSettings.port === 465,
        auth: {
          user: smtpSettings.username,
          pass: smtpSettings.password,
        },
      });

      // Send email to admin
      await transporter.sendMail({
        from: `"${smtpSettings.fromName}" <${smtpSettings.fromEmail}>`,
        to: smtpSettings.fromEmail, // Send to the configured admin email
        subject: 'New Contact Form Submission - LateLounge',
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><em>This message was sent from the LateLounge website contact form.</em></p>
        `,
        text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}\n\nMessage:\n${message}\n\nThis message was sent from the LateLounge website contact form.`
      });

      res.json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending contact email:", error);
      res.status(500).json({ message: "Failed to send message", error: error.message });
    }
  });

  // Admin users management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // User Management Routes
  app.get("/api/admin/users", requireLocalAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password field from response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireLocalAdmin, async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createLocalUser(userData);
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", requireLocalAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      // If password is provided, hash it
      if (userData.password) {
        const bcrypt = await import("bcryptjs");
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      
      const user = await storage.updateUser(userId, userData);
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireLocalAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Prevent deleting yourself
      if (req.localUser.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin Categories endpoint (includes all categories, sorted)
  app.get("/api/admin/categories", requireModerator, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching admin categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Admin Products endpoint (includes all products, sorted)
  app.get("/api/admin/products", requireModerator, async (req, res) => {
    try {
      const products = await storage.getAllProductsForAdmin();
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
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

  app.delete("/api/admin/categories/:id", requireModerator, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.deleteCategory(categoryId);
      res.json({ message: "Category and all its products deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  app.patch("/api/admin/categories/:id/reorder", requireModerator, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { direction } = req.body;
      await storage.reorderCategory(categoryId, direction);
      res.json({ message: "Category reordered successfully" });
    } catch (error) {
      console.error("Error reordering category:", error);
      res.status(500).json({ message: "Failed to reorder category" });
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

  app.delete("/api/admin/products/:id", requireModerator, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.patch("/api/admin/products/:id/reorder", requireModerator, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { direction } = req.body;
      await storage.reorderProduct(productId, direction);
      res.json({ message: "Product reordered successfully" });
    } catch (error) {
      console.error("Error reordering product:", error);
      res.status(500).json({ message: "Failed to reorder product" });
    }
  });

  app.patch("/api/admin/products/:id/reorder", requireModerator, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { direction } = req.body;
      await storage.reorderProduct(productId, direction);
      res.json({ message: "Product reordered successfully" });
    } catch (error) {
      console.error("Error reordering product:", error);
      res.status(500).json({ message: "Failed to reorder product" });
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

  app.put("/api/admin/privacy-policy", requireAdmin, async (req, res) => {
    try {
      const privacyData = req.body;
      const privacyPolicy = await storage.createOrUpdatePrivacyPolicy(privacyData);
      res.json(privacyPolicy);
    } catch (error) {
      console.error("Error updating privacy policy:", error);
      res.status(500).json({ message: "Failed to update privacy policy" });
    }
  });

  app.put("/api/admin/terms-of-service", requireAdmin, async (req, res) => {
    try {
      const termsData = req.body;
      const termsOfService = await storage.createOrUpdateTermsOfService(termsData);
      res.json(termsOfService);
    } catch (error) {
      console.error("Error updating terms of service:", error);
      res.status(500).json({ message: "Failed to update terms of service" });
    }
  });

  app.put("/api/admin/widgets", requireAdmin, async (req, res) => {
    try {
      const widgetData = req.body;
      const widget = await storage.createOrUpdateWidget(widgetData);
      res.json(widget);
    } catch (error) {
      console.error("Error updating widget:", error);
      res.status(500).json({ message: "Failed to update widget" });
    }
  });

  // Admin Users Management (Administrator only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const userData = req.body;
      const newUser = await storage.createUser({
        id: `user_${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: null,
        role: userData.role,
        isActive: userData.isActive
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", requireLocalAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      // Check if email is being changed and already exists for another user
      if (userData.email) {
        const existingUserByEmail = await storage.getUserByEmail(userData.email);
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      // Check if username is being changed and already exists for another user
      if (userData.username) {
        const existingUserByUsername = await storage.getUserByUsername(userData.username);
        if (existingUserByUsername && existingUserByUsername.id !== userId) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireLocalAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Prevent deleting yourself
      if (req.localUser.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Local authentication routes
  app.post('/api/auth/local/register', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      const newUser = await storage.createLocalUser({
        username: email, // Use email as username
        firstName,
        lastName,
        email,
        password,
      });

      // Automatically log in the user after registration
      (req.session as any).localUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      };

      res.json({
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        },
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/local/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await storage.validatePassword(user, password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set up session
      (req.session as any).userId = user.id;
      res.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/local/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/local/user', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email });
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Order management routes
  app.post('/api/orders', async (req, res) => {
    try {
      const { firstName, lastName, email, phone, address, city, area, notes, items, total, userId } = req.body;
      
      // Generate order number
      const orderNumber = `AP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create order
      const orderData = {
        userId: userId || (req.session as any).userId || 'guest',
        orderNumber,
        customerName: `${firstName} ${lastName}`,
        customerPhone: phone,
        customerEmail: email,
        deliveryAddress: `${address}, ${area}, ${city}`,
        totalAmount: total.toString(),
        status: 'pending' as const,
        paymentMethod: 'cash' as const,
        paymentStatus: 'pending' as const,
        notes: notes || null,
      };

      const newOrder = await storage.createOrder(orderData);

      // Create order items
      for (const item of items) {
        await storage.createOrderItem({
          orderId: newOrder.id,
          productId: item.product.id,
          productName: item.product.nameEn,
          productPrice: item.product.price,
          quantity: item.quantity,
          subtotal: (parseFloat(item.product.price) * item.quantity).toString(),
        });
      }

      res.json({ orderNumber, orderId: newOrder.id });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/my-orders', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const orders = await storage.getUserOrders((req.session as any).userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // User Address Management API
  app.get('/api/addresses', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const addresses = await storage.getUserAddresses((req.session as any).userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post('/api/addresses', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const addressData = {
        ...req.body,
        userId: (req.session as any).userId
      };

      const address = await storage.createUserAddress(addressData);
      res.json(address);
    } catch (error) {
      console.error("Error creating address:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.put('/api/addresses/:id', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const addressId = parseInt(req.params.id);
      const address = await storage.updateUserAddress(addressId, req.body);
      res.json(address);
    } catch (error) {
      console.error("Error updating address:", error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  app.delete('/api/addresses/:id', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const addressId = parseInt(req.params.id);
      await storage.deleteUserAddress(addressId);
      res.json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error("Error deleting address:", error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  app.post('/api/addresses/:id/set-default', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const addressId = parseInt(req.params.id);
      await storage.setDefaultAddress((req.session as any).userId, addressId);
      res.json({ message: "Default address updated successfully" });
    } catch (error) {
      console.error("Error setting default address:", error);
      res.status(500).json({ message: "Failed to set default address" });
    }
  });

  app.get('/api/orders/:orderNumber', async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // CMS Routes for Hero Section
  app.get('/api/hero-section', async (req, res) => {
    try {
      const heroSection = await storage.getHeroSection();
      res.json(heroSection);
    } catch (error) {
      console.error("Error fetching hero section:", error);
      res.status(500).json({ message: "Failed to fetch hero section" });
    }
  });

  app.put('/api/admin/hero-section', requireAdmin, async (req, res) => {
    try {
      console.log("Hero Section Update Request Body:", JSON.stringify(req.body, null, 2));
      const updatedHeroSection = await storage.updateHeroSection(req.body);
      console.log("Hero Section Updated Successfully:", JSON.stringify(updatedHeroSection, null, 2));
      res.json(updatedHeroSection);
    } catch (error) {
      console.error("Error updating hero section:", error);
      res.status(500).json({ message: "Failed to update hero section" });
    }
  });

  // CMS Routes for Experience Section
  app.get('/api/experience-section', async (req, res) => {
    try {
      const experienceSection = await storage.getExperienceSection();
      res.json(experienceSection);
    } catch (error) {
      console.error("Error fetching experience section:", error);
      res.status(500).json({ message: "Failed to fetch experience section" });
    }
  });

  app.put('/api/admin/experience-section', requireAdmin, async (req, res) => {
    try {
      // Filter out read-only fields from the request body
      const { id, createdAt, updatedAt, ...updateData } = req.body;
      const updatedExperienceSection = await storage.updateExperienceSection(updateData);
      res.json(updatedExperienceSection);
    } catch (error) {
      console.error("Error updating experience section:", error);
      res.status(500).json({ message: "Failed to update experience section" });
    }
  });

  // Customer Reviews Routes
  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Please log in to write a review" });
      }

      const userId = (req.session as any).userId;
      const review = await storage.createCustomerReview({ ...req.body, userId });
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin Reviews Management
  app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const reviews = await storage.getAllReviews(status as string);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.put('/api/admin/reviews/:id/approve', requireAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const updatedReview = await storage.approveReview(reviewId);
      res.json(updatedReview);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  app.put('/api/admin/reviews/:id/reject', requireAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { adminNotes } = req.body;
      const updatedReview = await storage.rejectReview(reviewId, adminNotes);
      res.json(updatedReview);
    } catch (error) {
      console.error("Error rejecting review:", error);
      res.status(500).json({ message: "Failed to reject review" });
    }
  });

  app.put('/api/admin/reviews/:id/toggle-visibility', requireAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { isShowOnWebsite } = req.body;
      const updatedReview = await storage.toggleReviewVisibility(reviewId, isShowOnWebsite);
      res.json(updatedReview);
    } catch (error) {
      console.error("Error toggling review visibility:", error);
      res.status(500).json({ message: "Failed to toggle review visibility" });
    }
  });

  app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      await storage.deleteReview(reviewId);
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Review Settings Routes
  app.get('/api/admin/review-settings', requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getReviewSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching review settings:", error);
      res.status(500).json({ message: "Failed to fetch review settings" });
    }
  });

  app.put('/api/admin/review-settings', requireAdmin, async (req, res) => {
    try {
      const updatedSettings = await storage.updateReviewSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating review settings:", error);
      res.status(500).json({ message: "Failed to update review settings" });
    }
  });

  // User's eligible products for reviews
  app.get('/api/user/reviewable-products', async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Please log in to view reviewable products" });
      }

      const userId = (req.session as any).userId;
      const products = await storage.getUserReviewableProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching reviewable products:", error);
      res.status(500).json({ message: "Failed to fetch reviewable products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}