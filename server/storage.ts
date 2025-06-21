import { categories, products, type Category, type Product, type InsertCategory, type InsertProduct } from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByCategorySlug(slug: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private categoryIdCounter: number;
  private productIdCounter: number;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Categories
    const sampleCategories: InsertCategory[] = [
      {
        nameEn: "Coffee & Espresso",
        nameAr: "القهوة والإسبريسو",
        descriptionEn: "Premium coffee blends and specialty drinks",
        descriptionAr: "خلطات قهوة فاخرة ومشروبات مميزة",
        slug: "coffee",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
      },
      {
        nameEn: "Hot Beverages",
        nameAr: "المشروبات الساخنة",
        descriptionEn: "Teas, hot chocolate, and warming drinks",
        descriptionAr: "الشاي والشوكولاتة الساخنة والمشروبات المدفئة",
        slug: "hot-drinks",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
      },
      {
        nameEn: "Cold Beverages",
        nameAr: "المشروبات الباردة",
        descriptionEn: "Iced coffees, smoothies, and refreshers",
        descriptionAr: "القهوة المثلجة والعصائر والمشروبات المنعشة",
        slug: "cold-drinks",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
      },
      {
        nameEn: "Breakfast",
        nameAr: "الإفطار",
        descriptionEn: "Fresh pastries, eggs, and morning favorites",
        descriptionAr: "المعجنات الطازجة والبيض ومفضلات الصباح",
        slug: "breakfast",
        image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
      },
      {
        nameEn: "Main Dishes",
        nameAr: "الأطباق الرئيسية",
        descriptionEn: "Sandwiches, salads, and hearty meals",
        descriptionAr: "السندويشات والسلطات والوجبات الدسمة",
        slug: "main-dishes",
        image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
      },
      {
        nameEn: "Desserts",
        nameAr: "الحلويات",
        descriptionEn: "Cakes, pastries, and sweet treats",
        descriptionAr: "الكعك والمعجنات والحلويات اللذيذة",
        slug: "desserts",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        isActive: true,
      },
    ];

    sampleCategories.forEach(category => {
      this.createCategory(category);
    });

    // Products
    const sampleProducts: InsertProduct[] = [
      // Coffee products
      {
        categoryId: 1,
        nameEn: "Espresso Classic",
        nameAr: "إسبريسو كلاسيكي",
        descriptionEn: "Rich, bold espresso shot with perfect crema",
        descriptionAr: "جرعة إسبريسو غنية وجريئة مع رغوة مثالية",
        price: "3.50",
        image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      {
        categoryId: 1,
        nameEn: "Cappuccino Deluxe",
        nameAr: "كابتشينو ديلوكس",
        descriptionEn: "Perfectly balanced espresso with steamed milk and foam",
        descriptionAr: "إسبريسو متوازن مع الحليب المبخر والرغوة",
        price: "4.25",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 1,
        nameEn: "Arabica Supreme",
        nameAr: "عربيكا سوبريم",
        descriptionEn: "Premium single-origin arabica beans, medium roast",
        descriptionAr: "حبوب عربيكا فاخرة من مصدر واحد، تحميص متوسط",
        price: "5.75",
        image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      {
        categoryId: 1,
        nameEn: "Mocha Latte",
        nameAr: "موكا لاتيه",
        descriptionEn: "Rich espresso with chocolate and steamed milk",
        descriptionAr: "إسبريسو غني مع الشوكولاتة والحليب المبخر",
        price: "4.50",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 1,
        nameEn: "Americano",
        nameAr: "أمريكانو",
        descriptionEn: "Espresso with hot water for a lighter coffee experience",
        descriptionAr: "إسبريسو مع الماء الساخن لتجربة قهوة أخف",
        price: "3.75",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 1,
        nameEn: "Vanilla Latte",
        nameAr: "لاتيه الفانيليا",
        descriptionEn: "Smooth espresso with vanilla syrup and steamed milk",
        descriptionAr: "إسبريسو ناعم مع شراب الفانيليا والحليب المبخر",
        price: "4.75",
        image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      // Hot drinks
      {
        categoryId: 2,
        nameEn: "Green Tea Premium",
        nameAr: "الشاي الأخضر الفاخر",
        descriptionEn: "High-quality green tea with antioxidants",
        descriptionAr: "شاي أخضر عالي الجودة مع مضادات الأكسدة",
        price: "2.75",
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 2,
        nameEn: "Hot Chocolate Deluxe",
        nameAr: "شوكولاتة ساخنة فاخرة",
        descriptionEn: "Rich Belgian chocolate with whipped cream",
        descriptionAr: "شوكولاتة بلجيكية غنية مع كريمة مخفوقة",
        price: "3.95",
        image: "https://images.unsplash.com/photo-1542990253-0b8be8bd0651?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      {
        categoryId: 2,
        nameEn: "Earl Grey Tea",
        nameAr: "شاي إيرل جراي",
        descriptionEn: "Classic black tea with bergamot oil",
        descriptionAr: "شاي أسود كلاسيكي مع زيت البرغموت",
        price: "2.50",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 2,
        nameEn: "Chamomile Tea",
        nameAr: "شاي البابونج",
        descriptionEn: "Soothing herbal tea perfect for relaxation",
        descriptionAr: "شاي عشبي مهدئ مثالي للاسترخاء",
        price: "2.25",
        image: "https://images.unsplash.com/photo-1597318181409-0bae2c6b1a4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 2,
        nameEn: "Masala Chai",
        nameAr: "الشاي المسالا",
        descriptionEn: "Spiced tea with cardamom, cinnamon, and ginger",
        descriptionAr: "شاي بالتوابل مع الهيل والقرفة والزنجبيل",
        price: "3.25",
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 2,
        nameEn: "Matcha Latte",
        nameAr: "لاتيه الماتشا",
        descriptionEn: "Japanese green tea powder with steamed milk",
        descriptionAr: "مسحوق الشاي الأخضر الياباني مع الحليب المبخر",
        price: "4.50",
        image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      // Cold drinks
      {
        categoryId: 3,
        nameEn: "Iced Americano",
        nameAr: "أمريكانو مثلج",
        descriptionEn: "Chilled espresso over ice with cold water",
        descriptionAr: "إسبريسو مبرد على الثلج مع الماء البارد",
        price: "3.25",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 3,
        nameEn: "Mango Smoothie",
        nameAr: "عصير المانجو",
        descriptionEn: "Fresh mango blend with yogurt and honey",
        descriptionAr: "خليط المانجو الطازج مع الزبادي والعسل",
        price: "4.75",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      {
        categoryId: 3,
        nameEn: "Iced Latte",
        nameAr: "لاتيه مثلج",
        descriptionEn: "Cold espresso with chilled milk over ice",
        descriptionAr: "إسبريسو بارد مع الحليب المبرد على الثلج",
        price: "4.00",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 3,
        nameEn: "Berry Smoothie",
        nameAr: "عصير التوت",
        descriptionEn: "Mixed berries with banana and almond milk",
        descriptionAr: "خليط التوت مع الموز وحليب اللوز",
        price: "5.25",
        image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 3,
        nameEn: "Frappuccino",
        nameAr: "فرابتشينو",
        descriptionEn: "Blended coffee drink with ice and whipped cream",
        descriptionAr: "مشروب قهوة مخلوط مع الثلج والكريمة المخفوقة",
        price: "5.50",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      {
        categoryId: 3,
        nameEn: "Fresh Orange Juice",
        nameAr: "عصير البرتقال الطازج",
        descriptionEn: "Freshly squeezed orange juice with pulp",
        descriptionAr: "عصير برتقال طازج مع اللب",
        price: "3.75",
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      // Breakfast
      {
        categoryId: 4,
        nameEn: "Avocado Toast",
        nameAr: "توست الأفوكادو",
        descriptionEn: "Fresh avocado on sourdough with tomatoes",
        descriptionAr: "أفوكادو طازج على خبز العجين المخمر مع الطماطم",
        price: "6.50",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      {
        categoryId: 4,
        nameEn: "Pancake Stack",
        nameAr: "رقائق البان كيك",
        descriptionEn: "Fluffy pancakes with maple syrup and berries",
        descriptionAr: "بان كيك طري مع شراب القيقب والتوت",
        price: "7.25",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 4,
        nameEn: "Eggs Benedict",
        nameAr: "بيض بنديكت",
        descriptionEn: "Poached eggs with hollandaise sauce on English muffin",
        descriptionAr: "بيض مسلوق مع صلصة الهولنديز على الخبز الإنجليزي",
        price: "8.75",
        image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      // Main dishes
      {
        categoryId: 5,
        nameEn: "Grilled Chicken Salad",
        nameAr: "سلطة الدجاج المشوي",
        descriptionEn: "Tender grilled chicken with mixed greens",
        descriptionAr: "دجاج مشوي طري مع خضار مشكلة",
        price: "9.75",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 5,
        nameEn: "Club Sandwich",
        nameAr: "ساندويش كلوب",
        descriptionEn: "Triple-layer sandwich with turkey and bacon",
        descriptionAr: "ساندويش ثلاثي الطبقات مع الديك الرومي واللحم المقدد",
        price: "8.50",
        image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      // Desserts
      {
        categoryId: 6,
        nameEn: "Chocolate Cake",
        nameAr: "كعكة الشوكولاتة",
        descriptionEn: "Rich chocolate layer cake with ganache",
        descriptionAr: "كعكة الشوكولاتة الغنية متعددة الطبقات مع الغاناش",
        price: "5.95",
        image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      {
        categoryId: 6,
        nameEn: "Tiramisu",
        nameAr: "تيراميسو",
        descriptionEn: "Classic Italian dessert with coffee flavor",
        descriptionAr: "حلوى إيطالية كلاسيكية بنكهة القهوة",
        price: "6.25",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 6,
        nameEn: "Cheesecake",
        nameAr: "تشيز كيك",
        descriptionEn: "New York style cheesecake with berry compote",
        descriptionAr: "تشيز كيك على طراز نيويورك مع مربى التوت",
        price: "6.75",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: true,
      },
      {
        categoryId: 6,
        nameEn: "Baklava",
        nameAr: "بقلاوة",
        descriptionEn: "Traditional Middle Eastern pastry with nuts and honey",
        descriptionAr: "معجنات شرق أوسطية تقليدية بالمكسرات والعسل",
        price: "4.95",
        image: "https://images.unsplash.com/photo-1571197133229-6e8b07a00e81?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 6,
        nameEn: "Crème Brûlée",
        nameAr: "كريم بروليه",
        descriptionEn: "French vanilla custard with caramelized sugar",
        descriptionAr: "كاسترد الفانيليا الفرنسي مع السكر المكرمل",
        price: "7.25",
        image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
      {
        categoryId: 6,
        nameEn: "Apple Pie",
        nameAr: "فطيرة التفاح",
        descriptionEn: "Homemade apple pie with cinnamon and vanilla ice cream",
        descriptionAr: "فطيرة تفاح منزلية بالقرفة وآيس كريم الفانيليا",
        price: "5.50",
        image: "https://images.unsplash.com/photo-1621743478914-cc8a86d7e9b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        isActive: true,
        isFeatured: false,
      },
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isActive);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categoryId === categoryId && product.isActive
    );
  }

  async getProductsByCategorySlug(slug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return [];
    return this.getProductsByCategory(category.id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
}

export const storage = new MemStorage();
