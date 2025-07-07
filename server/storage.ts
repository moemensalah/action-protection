import {
  users,
  websiteUsers,
  categories,
  products,
  aboutUs,
  contactUs,
  footerContent,
  widgetSettings,
  privacyPolicy,
  termsOfService,
  smtpSettings,
  userAddresses,
  orders,
  orderItems,
  heroSection,
  experienceSection,
  customerReviews,
  reviewSettings,
  userPermissions,
  aiSettings,
  type User,
  type UpsertUser,
  type WebsiteUser,
  type InsertWebsiteUser,
  type Category,
  type Product,
  type AboutUs,
  type ContactUs,
  type FooterContent,
  type WidgetSettings,
  type PrivacyPolicy,
  type TermsOfService,
  type SmtpSettings,
  type UserAddress,
  type InsertUserAddress,
  type Order,
  type OrderItem,
  type HeroSection,
  type ExperienceSection,
  type CustomerReview,
  type ReviewSettings,
  type InsertCategory,
  type InsertProduct,
  type InsertAboutUs,
  type InsertContactUs,
  type InsertFooterContent,
  type InsertWidgetSettings,
  type InsertPrivacyPolicy,
  type InsertTermsOfService,
  type InsertSmtpSettings,
  type InsertOrder,
  type InsertOrderItem,
  type InsertUser,
  type CreateUser,
  type InsertHeroSection,
  type InsertExperienceSection,
  type InsertCustomerReview,
  type InsertReviewSettings,
  type UserPermission,
  type InsertUserPermission,
  type AiSettings,
  type InsertAiSettings,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, lt, gt, desc, asc, and, isNotNull, sql, gte } from "drizzle-orm";

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
  
  // User Address Management
  getUserAddresses(userId: string): Promise<UserAddress[]>;
  getUserAddressById(id: number): Promise<UserAddress | undefined>;
  createUserAddress(addressData: InsertUserAddress): Promise<UserAddress>;
  updateUserAddress(id: number, addressData: Partial<InsertUserAddress>): Promise<UserAddress>;
  deleteUserAddress(id: number): Promise<void>;
  setDefaultAddress(userId: string, addressId: number): Promise<void>;
  
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
  
  // Hero Section CMS
  getHeroSection(): Promise<HeroSection | undefined>;
  updateHeroSection(heroData: Partial<InsertHeroSection>): Promise<HeroSection>;

  // Experience Section CMS
  getExperienceSection(): Promise<ExperienceSection | undefined>;
  updateExperienceSection(experienceData: Partial<InsertExperienceSection>): Promise<ExperienceSection>;

  // Customer Reviews Management
  getApprovedReviews(): Promise<CustomerReview[]>;
  getAllReviews(status?: string): Promise<CustomerReview[]>;
  createCustomerReview(reviewData: InsertCustomerReview): Promise<CustomerReview>;
  approveReview(reviewId: number): Promise<CustomerReview>;
  rejectReview(reviewId: number, adminNotes?: string): Promise<CustomerReview>;
  toggleReviewVisibility(reviewId: number, isShowOnWebsite: boolean): Promise<CustomerReview>;
  deleteReview(reviewId: number): Promise<void>;

  // Review Settings
  getReviewSettings(): Promise<ReviewSettings | undefined>;
  updateReviewSettings(settingsData: Partial<InsertReviewSettings>): Promise<ReviewSettings>;

  // User Review Management
  getUserReviewableProducts(userId: string): Promise<Product[]>;
  
  // Order Management
  createOrder(orderData: InsertOrder): Promise<Order>;
  createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem>;
  getUserOrders(userId: string): Promise<Order[]>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;

  // Website Users Management
  getWebsiteUserByEmail(email: string): Promise<WebsiteUser | undefined>;
  createWebsiteUser(userData: Omit<WebsiteUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebsiteUser>;
  getAllWebsiteUsersWithStats(): Promise<any[]>;
  getWebsiteUsersStats(): Promise<any>;
  getWebsiteUserOrders(userId: number): Promise<Order[]>;
  updateWebsiteUser(userId: number, updates: Partial<WebsiteUser>): Promise<WebsiteUser>;
  deleteWebsiteUser(userId: number): Promise<void>;

  // Order Management (Admin)
  getAllOrdersWithDetails(): Promise<any[]>;
  getOrdersStats(): Promise<any>;
  getOrderDetails(orderId: number): Promise<any>;
  getPendingOrdersCount(): Promise<number>;
  updateOrder(orderId: number, updates: Partial<Order>): Promise<Order>;
  deleteOrder(orderId: number): Promise<void>;
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

  // User Address Management
  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    return await db.select().from(userAddresses)
      .where(eq(userAddresses.userId, userId))
      .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));
  }

  async getUserAddressById(id: number): Promise<UserAddress | undefined> {
    const [address] = await db.select().from(userAddresses).where(eq(userAddresses.id, id));
    return address;
  }

  async createUserAddress(addressData: InsertUserAddress): Promise<UserAddress> {
    // If this is set as default, remove default from other addresses
    if (addressData.isDefault) {
      await db.update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, addressData.userId));
    }
    
    const [address] = await db
      .insert(userAddresses)
      .values(addressData)
      .returning();
    return address;
  }

  async updateUserAddress(id: number, addressData: Partial<InsertUserAddress>): Promise<UserAddress> {
    // If this is being set as default, remove default from other addresses
    if (addressData.isDefault && addressData.userId) {
      await db.update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, addressData.userId));
    }
    
    const [address] = await db
      .update(userAddresses)
      .set({ ...addressData, updatedAt: new Date() })
      .where(eq(userAddresses.id, id))
      .returning();
    return address;
  }

  async deleteUserAddress(id: number): Promise<void> {
    await db.delete(userAddresses).where(eq(userAddresses.id, id));
  }

  async setDefaultAddress(userId: string, addressId: number): Promise<void> {
    // Remove default from all addresses for this user
    await db.update(userAddresses)
      .set({ isDefault: false })
      .where(eq(userAddresses.userId, userId));
    
    // Set the specified address as default
    await db.update(userAddresses)
      .set({ isDefault: true })
      .where(and(eq(userAddresses.id, addressId), eq(userAddresses.userId, userId)));
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
    } else {
      return; // Already at the edge, can't move further
    }
    
    if (targetIndex >= 0) {
      const currentCategory = allCategories[currentIndex];
      const targetCategory = allCategories[targetIndex];
      
      // Swap the sort orders
      await db.update(categories)
        .set({ sortOrder: targetCategory.sortOrder, updatedAt: new Date() })
        .where(eq(categories.id, currentCategory.id));
      
      await db.update(categories)
        .set({ sortOrder: currentCategory.sortOrder, updatedAt: new Date() })
        .where(eq(categories.id, targetCategory.id));
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    // Only return products with valid names and categories for public website
    const results = await db
      .select({
        id: products.id,
        nameEn: products.nameEn,
        nameAr: products.nameAr,
        descriptionEn: products.descriptionEn,
        descriptionAr: products.descriptionAr,
        price: products.price,
        image: products.image,
        categoryId: products.categoryId,
        sortOrder: products.sortOrder,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isAvailable: products.isAvailable,
        stock: products.stock,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryName: categories.nameEn,
        categorySlug: categories.slug
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          eq(categories.isActive, true),
          isNotNull(products.nameEn),
          isNotNull(products.nameAr),
          isNotNull(products.categoryId)
        )
      )
      .orderBy(asc(categories.sortOrder), asc(products.sortOrder));
    
    return results;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    // Only return valid products for public website
    return await db
      .select({
        id: products.id,
        nameEn: products.nameEn,
        nameAr: products.nameAr,
        descriptionEn: products.descriptionEn,
        descriptionAr: products.descriptionAr,
        price: products.price,
        image: products.image,
        categoryId: products.categoryId,
        sortOrder: products.sortOrder,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isAvailable: products.isAvailable,
        stock: products.stock,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt
      })
      .from(products)
      .where(
        and(
          eq(products.categoryId, categoryId),
          eq(products.isActive, true),
          isNotNull(products.nameEn),
          isNotNull(products.nameAr)
        )
      )
      .orderBy(asc(products.sortOrder));
  }

  // Admin-only method to get ALL products including ghost/invalid ones
  async getAllProductsForAdmin(): Promise<Product[]> {
    return await db.select().from(products).orderBy(asc(products.categoryId), asc(products.sortOrder));
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

    // Find current product index
    const currentIndex = categoryProducts.findIndex(p => p.id === id);
    if (currentIndex === -1) return;

    let targetIndex: number;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < categoryProducts.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      return; // Already at the edge, can't move further
    }

    // Swap the products
    const currentProduct = categoryProducts[currentIndex];
    const targetProduct = categoryProducts[targetIndex];

    // Update both products with swapped sort orders
    await db.update(products)
      .set({ sortOrder: targetProduct.sortOrder, updatedAt: new Date() })
      .where(eq(products.id, currentProduct.id));

    await db.update(products)
      .set({ sortOrder: currentProduct.sortOrder, updatedAt: new Date() })
      .where(eq(products.id, targetProduct.id));
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

  // Order Management
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(orderItemData)
      .returning();
    return orderItem;
  }

  async getUserOrders(userId: string): Promise<any[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.websiteUserId, parseInt(userId)))
      .orderBy(desc(orders.createdAt));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return ordersWithItems;
  }

  async getOrderByNumber(orderNumber: string): Promise<any | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber));

    if (!order) return undefined;

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    return { ...order, items };
  }

  // Hero Section CMS Methods
  async getHeroSection(): Promise<HeroSection | undefined> {
    const [heroSectionData] = await db.select().from(heroSection).limit(1);
    return heroSectionData;
  }

  async updateHeroSection(heroData: Partial<InsertHeroSection>): Promise<HeroSection> {
    const existingHero = await this.getHeroSection();
    
    if (existingHero) {
      // Clean the data and remove timestamp fields from the input
      const cleanData = { ...heroData };
      delete cleanData.createdAt;
      delete cleanData.updatedAt;
      
      const [updatedHero] = await db
        .update(heroSection)
        .set({ ...cleanData, updatedAt: new Date() })
        .where(eq(heroSection.id, existingHero.id))
        .returning();
      return updatedHero;
    } else {
      // For new records, also clean the timestamp fields
      const cleanData = { ...heroData };
      delete cleanData.createdAt;
      delete cleanData.updatedAt;
      
      const [newHero] = await db
        .insert(heroSection)
        .values(cleanData)
        .returning();
      return newHero;
    }
  }

  // Experience Section CMS Methods
  async getExperienceSection(): Promise<ExperienceSection | undefined> {
    const [experienceSectionData] = await db.select().from(experienceSection).limit(1);
    return experienceSectionData;
  }

  async updateExperienceSection(experienceData: Partial<InsertExperienceSection>): Promise<ExperienceSection> {
    const existingExperience = await this.getExperienceSection();
    
    if (existingExperience) {
      // Convert date strings to Date objects if needed
      const cleanData = { ...experienceData };
      if (cleanData.createdAt && typeof cleanData.createdAt === 'string') {
        cleanData.createdAt = new Date(cleanData.createdAt);
      }
      if (cleanData.updatedAt && typeof cleanData.updatedAt === 'string') {
        cleanData.updatedAt = new Date(cleanData.updatedAt);
      }
      
      const [updatedExperience] = await db
        .update(experienceSection)
        .set({ ...cleanData, updatedAt: new Date() })
        .where(eq(experienceSection.id, existingExperience.id))
        .returning();
      return updatedExperience;
    } else {
      const [newExperience] = await db
        .insert(experienceSection)
        .values(experienceData)
        .returning();
      return newExperience;
    }
  }

  // Customer Reviews Methods
  async getApprovedReviews(): Promise<CustomerReview[]> {
    return await db
      .select()
      .from(customerReviews)
      .where(and(
        eq(customerReviews.status, 'approved'),
        eq(customerReviews.isShowOnWebsite, true)
      ))
      .orderBy(desc(customerReviews.createdAt));
  }

  async getAllReviews(status?: string): Promise<CustomerReview[]> {
    const query = db.select().from(customerReviews);
    
    if (status) {
      return await query.where(eq(customerReviews.status, status)).orderBy(desc(customerReviews.createdAt));
    }
    
    return await query.orderBy(desc(customerReviews.createdAt));
  }

  async createCustomerReview(reviewData: InsertCustomerReview): Promise<CustomerReview> {
    const [review] = await db
      .insert(customerReviews)
      .values(reviewData)
      .returning();
    return review;
  }

  async approveReview(reviewId: number): Promise<CustomerReview> {
    const [review] = await db
      .update(customerReviews)
      .set({ 
        status: 'approved', 
        isShowOnWebsite: true, 
        updatedAt: new Date() 
      })
      .where(eq(customerReviews.id, reviewId))
      .returning();
    return review;
  }

  async rejectReview(reviewId: number, adminNotes?: string): Promise<CustomerReview> {
    const [review] = await db
      .update(customerReviews)
      .set({ 
        status: 'rejected', 
        isShowOnWebsite: false,
        adminNotes,
        updatedAt: new Date() 
      })
      .where(eq(customerReviews.id, reviewId))
      .returning();
    return review;
  }

  async toggleReviewVisibility(reviewId: number, isShowOnWebsite: boolean): Promise<CustomerReview> {
    const [review] = await db
      .update(customerReviews)
      .set({ isShowOnWebsite, updatedAt: new Date() })
      .where(eq(customerReviews.id, reviewId))
      .returning();
    return review;
  }

  async deleteReview(reviewId: number): Promise<void> {
    await db.delete(customerReviews).where(eq(customerReviews.id, reviewId));
  }

  // Review Settings Methods
  async getReviewSettings(): Promise<ReviewSettings | undefined> {
    const [settings] = await db.select().from(reviewSettings).limit(1);
    return settings;
  }

  async updateReviewSettings(settingsData: Partial<InsertReviewSettings>): Promise<ReviewSettings> {
    const existingSettings = await this.getReviewSettings();
    
    if (existingSettings) {
      const [updatedSettings] = await db
        .update(reviewSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(reviewSettings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    } else {
      const [newSettings] = await db
        .insert(reviewSettings)
        .values(settingsData)
        .returning();
      return newSettings;
    }
  }

  // User Review Management
  async getUserReviewableProducts(userId: string): Promise<Product[]> {
    // Get products from user's completed orders that haven't been reviewed yet
    const userOrderItems = await db
      .select({
        productId: orderItems.productId,
        orderId: orderItems.orderId
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(
        eq(orders.userId, userId),
        eq(orders.status, 'delivered')
      ));

    if (userOrderItems.length === 0) {
      return [];
    }

    // Get unique product IDs
    const productIds = [...new Set(userOrderItems.map(item => item.productId))];
    
    // Get products that haven't been reviewed by this user yet
    const reviewedProductIds = await db
      .select({ productId: customerReviews.productId })
      .from(customerReviews)
      .where(eq(customerReviews.userId, userId));
    
    const reviewedIds = reviewedProductIds
      .filter(item => item.productId !== null)
      .map(item => item.productId);

    const reviewableProductIds = productIds.filter(id => !reviewedIds.includes(id));

    if (reviewableProductIds.length === 0) {
      return [];
    }

    // Get the actual products
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.isActive, true),
        // Use OR conditions for each product ID
        ...reviewableProductIds.map(id => eq(products.id, id))
      ));
  }

  // Website Users Management
  async getWebsiteUserByEmail(email: string): Promise<WebsiteUser | undefined> {
    const [user] = await db.select().from(websiteUsers).where(eq(websiteUsers.email, email));
    return user;
  }

  async createWebsiteUser(userData: Omit<WebsiteUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<WebsiteUser> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db
      .insert(websiteUsers)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  }

  async getAllWebsiteUsersWithStats(): Promise<any[]> {
    const result = await db
      .select({
        id: websiteUsers.id,
        firstName: websiteUsers.firstName,
        lastName: websiteUsers.lastName,
        email: websiteUsers.email,
        phone: websiteUsers.phone,
        isActive: websiteUsers.isActive,
        createdAt: websiteUsers.createdAt,
        updatedAt: websiteUsers.updatedAt,
        totalOrders: sql<number>`COUNT(${orders.id})`.as('totalOrders'),
        totalSpent: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`.as('totalSpent'),
      })
      .from(websiteUsers)
      .leftJoin(orders, eq(websiteUsers.id, orders.websiteUserId))
      .groupBy(websiteUsers.id)
      .orderBy(websiteUsers.createdAt);

    return result;
  }

  async getWebsiteUsersStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(websiteUsers);
    const activeUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(websiteUsers).where(eq(websiteUsers.isActive, true));
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersThisMonth = await db.select({ count: sql<number>`COUNT(*)` }).from(websiteUsers).where(gte(websiteUsers.createdAt, thirtyDaysAgo));
    
    const totalRevenue = await db.select({ 
      total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` 
    }).from(orders);

    return {
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      newUsersThisMonth: newUsersThisMonth[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || '0',
    };
  }

  async getWebsiteUserOrders(userId: number): Promise<Order[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.websiteUserId, userId))
      .orderBy(desc(orders.createdAt));

    return userOrders;
  }

  async updateWebsiteUser(userId: number, updates: Partial<WebsiteUser>): Promise<WebsiteUser> {
    const [updatedUser] = await db
      .update(websiteUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(websiteUsers.id, userId))
      .returning();

    return updatedUser;
  }

  async deleteWebsiteUser(userId: number): Promise<void> {
    await db.delete(websiteUsers).where(eq(websiteUsers.id, userId));
  }

  // Order Management (Admin)
  async getAllOrdersWithDetails(): Promise<any[]> {
    const result = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        status: orders.status,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        customerEmail: orders.customerEmail,
        deliveryAddress: orders.deliveryAddress,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        total: orders.totalAmount,
        notes: orders.notes,
        websiteUserId: orders.websiteUserId,
        websiteUser: {
          id: websiteUsers.id,
          firstName: websiteUsers.firstName,
          lastName: websiteUsers.lastName,
          email: websiteUsers.email,
          phone: websiteUsers.phone,
        },
      })
      .from(orders)
      .leftJoin(websiteUsers, eq(orders.websiteUserId, websiteUsers.id))
      .orderBy(desc(orders.createdAt));

    // Add order items for each order
    const ordersWithItems = await Promise.all(
      result.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            productId: orderItems.productId,
            productName: orderItems.productName,
            productPrice: orderItems.productPrice,
            quantity: orderItems.quantity,
            subtotal: orderItems.subtotal,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrdersStats(): Promise<any> {
    const totalOrders = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
    const pendingOrders = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.status, 'pending'));
    const completedOrders = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.status, 'delivered'));
    const totalRevenue = await db.select({ 
      total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)` 
    }).from(orders);

    return {
      totalOrders: totalOrders[0]?.count || 0,
      pendingOrders: pendingOrders[0]?.count || 0,
      completedOrders: completedOrders[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || '0',
    };
  }

  async getPendingOrdersCount(): Promise<number> {
    const pendingOrders = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(eq(orders.status, 'pending'));
    
    return pendingOrders[0]?.count || 0;
  }

  async getOrderDetails(orderId: number): Promise<any> {
    const [order] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        status: orders.status,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        customerEmail: orders.customerEmail,
        deliveryAddress: orders.deliveryAddress,
        paymentMethod: orders.paymentMethod,
        paymentStatus: orders.paymentStatus,
        total: orders.totalAmount,
        notes: orders.notes,
        websiteUserId: orders.websiteUserId,
        websiteUser: {
          id: websiteUsers.id,
          firstName: websiteUsers.firstName,
          lastName: websiteUsers.lastName,
          email: websiteUsers.email,
          phone: websiteUsers.phone,
        },
      })
      .from(orders)
      .leftJoin(websiteUsers, eq(orders.websiteUserId, websiteUsers.id))
      .where(eq(orders.id, orderId));

    if (!order) {
      return null;
    }

    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: orderItems.productName,
        productPrice: orderItems.productPrice,
        quantity: orderItems.quantity,
        subtotal: orderItems.subtotal,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return {
      ...order,
      items,
    };
  }

  async updateOrder(orderId: number, updates: Partial<Order>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return updatedOrder;
  }

  async deleteOrder(orderId: number): Promise<void> {
    // Delete order items first
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    // Delete the order
    await db.delete(orders).where(eq(orders.id, orderId));
  }

  // User Permissions Management
  async getUsersWithPermissions(): Promise<(User & { permissions: UserPermission[] })[]> {
    const usersData = await db
      .select()
      .from(users)
      .leftJoin(userPermissions, eq(users.id, userPermissions.userId));

    // Group permissions by user
    const userMap = new Map<string, User & { permissions: UserPermission[] }>();
    
    usersData.forEach(({ users: user, user_permissions: permission }) => {
      if (!userMap.has(user.id)) {
        const { password, ...safeUser } = user;
        userMap.set(user.id, { ...safeUser, permissions: [] });
      }
      
      if (permission) {
        userMap.get(user.id)!.permissions.push(permission);
      }
    });

    return Array.from(userMap.values());
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return await db
      .select()
      .from(userPermissions)
      .where(eq(userPermissions.userId, userId));
  }

  async updateUserPermissions(userId: string, permissions: Record<string, string[]>): Promise<UserPermission[]> {
    // First, delete existing permissions for the user
    await db.delete(userPermissions).where(eq(userPermissions.userId, userId));

    // Insert new permissions
    const permissionData: InsertUserPermission[] = Object.entries(permissions)
      .filter(([, actions]) => actions.length > 0)
      .map(([section, actions]) => ({
        userId,
        section: section as any,
        actions: actions as any,
      }));

    if (permissionData.length > 0) {
      return await db
        .insert(userPermissions)
        .values(permissionData)
        .returning();
    }

    return [];
  }

  // AI Settings Management
  async getAiSettings(): Promise<AiSettings | null> {
    const [settings] = await db.select().from(aiSettings).limit(1);
    return settings || null;
  }

  async updateAiSettings(settingsData: InsertAiSettings): Promise<AiSettings> {
    const existingSettings = await this.getAiSettings();
    
    if (existingSettings) {
      const [updated] = await db
        .update(aiSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(aiSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(aiSettings)
        .values(settingsData)
        .returning();
      return created;
    }
  }

  async generateImages(prompt: string): Promise<{ images: string[] }> {
    const settings = await this.getAiSettings();
    
    if (!settings || !settings.enabled || !settings.midjourney_api_key) {
      throw new Error("AI settings not configured or disabled");
    }

    // Simulate AI image generation for now
    // In a real implementation, you would call the Midjourney API
    const mockImages = [
      `/assets/generated-image-1-${Date.now()}.jpg`,
      `/assets/generated-image-2-${Date.now()}.jpg`,
      `/assets/generated-image-3-${Date.now()}.jpg`,
      `/assets/generated-image-4-${Date.now()}.jpg`,
    ];

    return { images: mockImages };
  }
}

export const storage = new DatabaseStorage();