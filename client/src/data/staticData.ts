export interface Category {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  slug: string;
  image: string;
  isActive: boolean;
}

export interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  categoryId: number;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
}

export const categories: Category[] = [
  {
    id: 1,
    nameEn: "Coffee & Espresso",
    nameAr: "القهوة والإسبريسو",
    descriptionEn: "Premium coffee blends and specialty drinks",
    descriptionAr: "خلطات قهوة فاخرة ومشروبات مميزة",
    slug: "coffee",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    isActive: true
  },
  {
    id: 2,
    nameEn: "Hot Beverages",
    nameAr: "المشروبات الساخنة",
    descriptionEn: "Warm and comforting drinks for cozy moments",
    descriptionAr: "مشروبات دافئة ومريحة للحظات الدافئة",
    slug: "hot-drinks",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    isActive: true
  },
  {
    id: 3,
    nameEn: "Cold Beverages",
    nameAr: "المشروبات الباردة",
    descriptionEn: "Refreshing cold drinks to beat the heat",
    descriptionAr: "مشروبات باردة منعشة لمقاومة الحر",
    slug: "cold-drinks",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    isActive: true
  },
  {
    id: 4,
    nameEn: "Breakfast",
    nameAr: "الإفطار",
    descriptionEn: "Fresh and healthy breakfast options",
    descriptionAr: "خيارات إفطار طازجة وصحية",
    slug: "breakfast",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    isActive: true
  },
  {
    id: 5,
    nameEn: "Main Dishes",
    nameAr: "الأطباق الرئيسية",
    descriptionEn: "Hearty meals and savory delights",
    descriptionAr: "وجبات شهية ولذائذ مالحة",
    slug: "main-dishes",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    isActive: true
  },
  {
    id: 6,
    nameEn: "Desserts",
    nameAr: "الحلويات",
    descriptionEn: "Sweet treats and indulgent desserts",
    descriptionAr: "حلويات حلوة ولذائذ منغمسة",
    slug: "desserts",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    isActive: true
  }
];

export const products: Product[] = [
  // Coffee & Espresso
  {
    id: 1,
    nameEn: "Espresso",
    nameAr: "إسبريسو",
    descriptionEn: "Rich and bold espresso shot with perfect crema",
    descriptionAr: "جرعة إسبريسو غنية وجريئة مع كريما مثالية",
    price: 15,
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },
  {
    id: 2,
    nameEn: "Cappuccino",
    nameAr: "كابتشينو",
    descriptionEn: "Classic Italian coffee with steamed milk and foam",
    descriptionAr: "قهوة إيطالية كلاسيكية مع حليب مبخر ورغوة",
    price: 22,
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },
  {
    id: 3,
    nameEn: "Latte",
    nameAr: "لاتيه",
    descriptionEn: "Smooth espresso with steamed milk and light foam",
    descriptionAr: "إسبريسو ناعم مع حليب مبخر ورغوة خفيفة",
    price: 25,
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },

  // Hot Beverages
  {
    id: 4,
    nameEn: "Green Tea",
    nameAr: "شاي أخضر",
    descriptionEn: "Premium organic green tea with antioxidants",
    descriptionAr: "شاي أخضر عضوي فاخر مع مضادات الأكسدة",
    price: 18,
    categoryId: 2,
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },
  {
    id: 5,
    nameEn: "Earl Grey",
    nameAr: "إيرل جراي",
    descriptionEn: "Classic black tea with bergamot oil",
    descriptionAr: "شاي أسود كلاسيكي مع زيت البرغموت",
    price: 20,
    categoryId: 2,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },

  // Cold Beverages
  {
    id: 6,
    nameEn: "Iced Americano",
    nameAr: "أمريكانو مثلج",
    descriptionEn: "Refreshing iced coffee with bold espresso flavor",
    descriptionAr: "قهوة مثلجة منعشة بنكهة إسبريسو جريئة",
    price: 20,
    categoryId: 3,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },
  {
    id: 7,
    nameEn: "Iced Latte",
    nameAr: "لاتيه مثلج",
    descriptionEn: "Cold espresso with chilled milk over ice",
    descriptionAr: "إسبريسو بارد مع حليب مبرد على الثلج",
    price: 25,
    categoryId: 3,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },

  // Breakfast
  {
    id: 8,
    nameEn: "Avocado Toast",
    nameAr: "توست الأفوكادو",
    descriptionEn: "Fresh avocado on toasted artisan bread with herbs",
    descriptionAr: "أفوكادو طازج على خبز حرفي محمص مع الأعشاب",
    price: 28,
    categoryId: 4,
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },
  {
    id: 9,
    nameEn: "Croissant",
    nameAr: "كرواسون",
    descriptionEn: "Buttery, flaky French pastry baked fresh daily",
    descriptionAr: "معجنات فرنسية مقرمشة بالزبدة مخبوزة طازجة يومياً",
    price: 15,
    categoryId: 4,
    image: "https://images.unsplash.com/photo-1549903072-7e6e0bedb7fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },

  // Main Dishes
  {
    id: 10,
    nameEn: "Grilled Chicken Sandwich",
    nameAr: "ساندويتش دجاج مشوي",
    descriptionEn: "Tender grilled chicken with fresh vegetables",
    descriptionAr: "دجاج مشوي طري مع خضروات طازجة",
    price: 45,
    categoryId: 5,
    image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },
  {
    id: 11,
    nameEn: "Caesar Salad",
    nameAr: "سلطة قيصر",
    descriptionEn: "Crisp romaine lettuce with parmesan and croutons",
    descriptionAr: "خس روماني مقرمش مع البارميزان والخبز المحمص",
    price: 35,
    categoryId: 5,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },

  // Desserts
  {
    id: 12,
    nameEn: "Chocolate Cake",
    nameAr: "كعكة الشوكولاتة",
    descriptionEn: "Rich dark chocolate cake with smooth ganache",
    descriptionAr: "كعكة شوكولاتة داكنة غنية مع جاناش ناعم",
    price: 25,
    categoryId: 6,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },
  {
    id: 13,
    nameEn: "Tiramisu",
    nameAr: "تيراميسو",
    descriptionEn: "Classic Italian dessert with coffee and mascarpone",
    descriptionAr: "حلوى إيطالية كلاسيكية مع القهوة والماسكاربوني",
    price: 30,
    categoryId: 6,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },
  // Additional Coffee Options
  {
    id: 14,
    nameEn: "Turkish Coffee",
    nameAr: "قهوة تركية",
    descriptionEn: "Traditional Turkish coffee served with authentic preparation",
    descriptionAr: "قهوة تركية تقليدية تُقدم بالتحضير الأصيل",
    price: 20,
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1559496417-e7f25cb247cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },
  {
    id: 15,
    nameEn: "Arabic Coffee",
    nameAr: "قهوة عربية",
    descriptionEn: "Traditional Arabic coffee with cardamom and dates",
    descriptionAr: "قهوة عربية تقليدية مع الهيل والتمر",
    price: 18,
    categoryId: 1,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },
  // Additional Hot Beverages
  {
    id: 16,
    nameEn: "Moroccan Mint Tea",
    nameAr: "شاي النعناع المغربي",
    descriptionEn: "Refreshing mint tea with traditional Moroccan preparation",
    descriptionAr: "شاي النعناع المنعش بالتحضير المغربي التقليدي",
    price: 22,
    categoryId: 2,
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: true,
    isAvailable: true
  },
  {
    id: 17,
    nameEn: "Hot Chocolate",
    nameAr: "شوكولاتة ساخنة",
    descriptionEn: "Rich hot chocolate with whipped cream and marshmallows",
    descriptionAr: "شوكولاتة ساخنة غنية مع كريمة مخفوقة ومارشميلو",
    price: 25,
    categoryId: 2,
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },
  // Additional Cold Beverages
  {
    id: 18,
    nameEn: "Fresh Orange Juice",
    nameAr: "عصير برتقال طازج",
    descriptionEn: "Freshly squeezed orange juice with natural pulp",
    descriptionAr: "عصير برتقال طازج مع اللب الطبيعي",
    price: 16,
    categoryId: 3,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  },
  {
    id: 19,
    nameEn: "Iced Tea",
    nameAr: "شاي مثلج",
    descriptionEn: "Refreshing iced tea with lemon and mint",
    descriptionAr: "شاي مثلج منعش مع الليمون والنعناع",
    price: 15,
    categoryId: 3,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    isActive: true,
    isFeatured: false,
    isAvailable: true
  }
];

// Helper functions for data access
export const getCategoriesByActive = () => categories.filter(cat => cat.isActive);

export const getCategoryBySlug = (slug: string) => categories.find(cat => cat.slug === slug);

export const getProductsByCategory = (categoryId: number) => 
  products.filter(product => product.categoryId === categoryId && product.isActive);

export const getProductsByCategorySlug = (slug: string) => {
  const category = getCategoryBySlug(slug);
  return category ? getProductsByCategory(category.id) : [];
};

export const getFeaturedProducts = () => products.filter(product => product.isFeatured && product.isActive);

export const getAllProducts = () => products.filter(product => product.isActive);