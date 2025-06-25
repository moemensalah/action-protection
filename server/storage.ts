import {
  users,
  categories,
  products,
  aboutUs,
  contactUs,
  footerContent,
  widgetSettings,
  privacyPolicy,
  termsOfService,
  smtpSettings,
  type User,
  type UpsertUser,
  type Category,
  type Product,
  type AboutUs,
  type ContactUs,
  type FooterContent,
  type WidgetSettings,
  type PrivacyPolicy,
  type TermsOfService,
  type SmtpSettings,
  type InsertCategory,
  type InsertProduct,
  type InsertAboutUs,
  type InsertContactUs,
  type InsertFooterContent,
  type InsertWidgetSettings,
  type InsertPrivacyPolicy,
  type InsertTermsOfService,
  type InsertSmtpSettings,
  type InsertUser,
  type CreateUser,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, lt, gt, desc, asc, and, isNotNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Local authentication methods
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createLocalUser(userData: CreateUser): Promise<User>;
  validatePassword(user: User, password: string): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  reorderCategory(id: number, direction: 'up' | 'down'): Promise<void>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getAllProductsForAdmin(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByCategorySlug(slug: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  reorderProduct(id: number, direction: 'up' | 'down'): Promise<void>;
  
  // About Us
  getAboutUs(): Promise<AboutUs | undefined>;
  createOrUpdateAboutUs(aboutUsData: InsertAboutUs): Promise<AboutUs>;
  
  // Contact Us
  getContactUs(): Promise<ContactUs | undefined>;
  createOrUpdateContactUs(contactData: InsertContactUs): Promise<ContactUs>;
  
  // Footer Content
  getFooterContent(): Promise<FooterContent | undefined>;
  createOrUpdateFooterContent(footerData: InsertFooterContent): Promise<FooterContent>;
  
  // Widget Settings
  getWidgetSettings(): Promise<WidgetSettings[]>;
  getWidgetByName(name: string): Promise<WidgetSettings | undefined>;
  createOrUpdateWidget(widgetData: InsertWidgetSettings): Promise<WidgetSettings>;
  
  // Privacy Policy
  getPrivacyPolicy(): Promise<PrivacyPolicy | undefined>;
  createOrUpdatePrivacyPolicy(privacyData: InsertPrivacyPolicy): Promise<PrivacyPolicy>;
  
  // Terms of Service
  getTermsOfService(): Promise<TermsOfService | undefined>;
  createOrUpdateTermsOfService(termsData: InsertTermsOfService): Promise<TermsOfService>;
  
  // SMTP Settings
  getSmtpSettings(): Promise<SmtpSettings | undefined>;
  createOrUpdateSmtpSettings(settingsData: InsertSmtpSettings): Promise<SmtpSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Local authentication methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createLocalUser(userData: CreateUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role || "moderator",
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return await bcrypt.compare(password, user.password);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
  }

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.sortOrder));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    // First delete all products in this category
    await db.delete(products).where(eq(products.categoryId, id));
    // Then delete the category
    await db.delete(categories).where(eq(categories.id, id));
  }

  async reorderCategory(id: number, direction: 'up' | 'down'): Promise<void> {
    // Get all categories ordered by sortOrder
    const allCategories = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    const currentIndex = allCategories.findIndex(cat => cat.id === id);
    
    if (currentIndex === -1) return;
    
    let targetIndex = -1;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < allCategories.length - 1) {
      targetIndex = currentIndex + 1;
    }
    
    if (targetIndex >= 0) {
      const currentCategory = allCategories[currentIndex];
      const targetCategory = allCategories[targetIndex];
      
      // Swap the sort orders
      await db.update(categories)
        .set({ sortOrder: targetCategory.sortOrder })
        .where(eq(categories.id, currentCategory.id));
      
      await db.update(categories)
        .set({ sortOrder: currentCategory.sortOrder })
        .where(eq(categories.id, targetCategory.id));
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    // Only return products with valid names and categories for public website
    return await db
      .select()
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          isNotNull(products.nameEn),
          isNotNull(products.nameAr),
          isNotNull(products.categoryId)
        )
      )
      .then(results => results.map(result => result.products));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    // Only return valid products for public website
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.categoryId, categoryId),
          eq(products.isActive, true),
          isNotNull(products.nameEn),
          isNotNull(products.nameAr)
        )
      );
  }

  // Admin-only method to get ALL products including ghost/invalid ones
  async getAllProductsForAdmin(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return [];
    return await this.getProductsByCategory(category.id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    // Get the maximum sortOrder for new products
    const [maxOrder] = await db
      .select({ maxSort: products.sortOrder })
      .from(products)
      .orderBy(desc(products.sortOrder))
      .limit(1);
    
    const nextSortOrder = (maxOrder?.maxSort ?? 0) + 1;
    
    const [product] = await db
      .insert(products)
      .values({ ...productData, sortOrder: nextSortOrder })
      .returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async reorderProduct(id: number, direction: 'up' | 'down'): Promise<void> {
    const product = await this.getProductById(id);
    if (!product) throw new Error('Product not found');

    // Get all products in the same category, ordered by sortOrder
    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, product.categoryId))
      .orderBy(asc(products.sortOrder));

    console.log(`Reordering product ${id} (${product.nameEn}) ${direction} in category ${product.categoryId}`);
    console.log('Category products:', categoryProducts.map(p => ({ id: p.id, name: p.nameEn, order: p.sortOrder })));

    // Find current product index
    const currentIndex = categoryProducts.findIndex(p => p.id === id);
    if (currentIndex === -1) {
      console.log('Product not found in category products');
      return;
    }

    let targetIndex: number;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < categoryProducts.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      console.log(`Cannot move ${direction}: already at edge (index ${currentIndex} of ${categoryProducts.length})`);
      return; // Already at the edge, can't move further
    }

    // Swap the products
    const currentProduct = categoryProducts[currentIndex];
    const targetProduct = categoryProducts[targetIndex];

    console.log(`Swapping: ${currentProduct.nameEn} (order ${currentProduct.sortOrder}) <-> ${targetProduct.nameEn} (order ${targetProduct.sortOrder})`);

    // Update both products with swapped sort orders
    await db.update(products)
      .set({ sortOrder: targetProduct.sortOrder, updatedAt: new Date() })
      .where(eq(products.id, currentProduct.id));

    await db.update(products)
      .set({ sortOrder: currentProduct.sortOrder, updatedAt: new Date() })
      .where(eq(products.id, targetProduct.id));

    console.log('Reorder completed successfully');
  }

  // About Us
  async getAboutUs(): Promise<AboutUs | undefined> {
    const [aboutUsData] = await db.select().from(aboutUs).where(eq(aboutUs.isActive, true));
    return aboutUsData;
  }

  async createOrUpdateAboutUs(aboutUsData: InsertAboutUs): Promise<AboutUs> {
    const existing = await this.getAboutUs();
    
    if (existing) {
      const [updated] = await db
        .update(aboutUs)
        .set(aboutUsData)
        .where(eq(aboutUs.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(aboutUs)
        .values(aboutUsData)
        .returning();
      return created;
    }
  }

  // Contact Us
  async getContactUs(): Promise<ContactUs | undefined> {
    const [contactData] = await db.select().from(contactUs).where(eq(contactUs.isActive, true));
    return contactData;
  }

  async createOrUpdateContactUs(contactData: InsertContactUs): Promise<ContactUs> {
    const existing = await this.getContactUs();
    
    if (existing) {
      const [updated] = await db
        .update(contactUs)
        .set(contactData)
        .where(eq(contactUs.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(contactUs)
        .values(contactData)
        .returning();
      return created;
    }
  }

  // Footer Content
  async getFooterContent(): Promise<FooterContent | undefined> {
    const [footerData] = await db.select().from(footerContent).where(eq(footerContent.isActive, true));
    return footerData;
  }

  async createOrUpdateFooterContent(footerData: InsertFooterContent): Promise<FooterContent> {
    const existing = await this.getFooterContent();
    
    if (existing) {
      const [updated] = await db
        .update(footerContent)
        .set(footerData)
        .where(eq(footerContent.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(footerContent)
        .values(footerData)
        .returning();
      return created;
    }
  }

  // Widget Settings
  async getWidgetSettings(): Promise<WidgetSettings[]> {
    return await db.select().from(widgetSettings).where(eq(widgetSettings.isActive, true));
  }

  async getWidgetByName(name: string): Promise<WidgetSettings | undefined> {
    const [widget] = await db
      .select()
      .from(widgetSettings)
      .where(eq(widgetSettings.name, name));
    return widget;
  }

  async createOrUpdateWidget(widgetData: InsertWidgetSettings): Promise<WidgetSettings> {
    const existing = await this.getWidgetByName(widgetData.name);
    
    if (existing) {
      const [updated] = await db
        .update(widgetSettings)
        .set({ ...widgetData, updatedAt: new Date() })
        .where(eq(widgetSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(widgetSettings)
        .values(widgetData)
        .returning();
      return created;
    }
  }

  // Privacy Policy
  async getPrivacyPolicy(): Promise<PrivacyPolicy | undefined> {
    const [privacyPolicyData] = await db.select().from(privacyPolicy).where(eq(privacyPolicy.isActive, true));
    return privacyPolicyData;
  }

  async createOrUpdatePrivacyPolicy(privacyData: InsertPrivacyPolicy): Promise<PrivacyPolicy> {
    const existing = await this.getPrivacyPolicy();
    
    if (existing) {
      const [updated] = await db
        .update(privacyPolicy)
        .set(privacyData)
        .where(eq(privacyPolicy.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(privacyPolicy)
        .values(privacyData)
        .returning();
      return created;
    }
  }

  // Terms of Service
  async getTermsOfService(): Promise<TermsOfService | undefined> {
    const [termsData] = await db.select().from(termsOfService).where(eq(termsOfService.isActive, true));
    return termsData;
  }

  async createOrUpdateTermsOfService(termsData: InsertTermsOfService): Promise<TermsOfService> {
    const existing = await this.getTermsOfService();
    
    if (existing) {
      const [updated] = await db
        .update(termsOfService)
        .set(termsData)
        .where(eq(termsOfService.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(termsOfService)
        .values(termsData)
        .returning();
      return created;
    }
  }

  async getSmtpSettings(): Promise<SmtpSettings | undefined> {
    try {
      const [settings] = await db.select().from(smtpSettings).where(eq(smtpSettings.isActive, true));
      return settings;
    } catch (error) {
      console.log("SMTP settings table not yet created");
      return undefined;
    }
  }

  async createOrUpdateSmtpSettings(settingsData: InsertSmtpSettings): Promise<SmtpSettings> {
    const existing = await this.getSmtpSettings();
    
    if (existing) {
      const [updated] = await db
        .update(smtpSettings)
        .set(settingsData)
        .where(eq(smtpSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(smtpSettings)
        .values(settingsData)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();