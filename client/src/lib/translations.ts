export const translations = {
  en: {
    // Navigation
    home: "Home",
    menu: "Menu",
    about: "About",
    contact: "Contact",
    search: "Search menu...",
    
    // Common
    loading: "Loading...",
    error: "Error",
    back: "Back",
    next: "Next",
    previous: "Previous",
    addToCart: "Add to Cart",
    viewAll: "View All",
    showMore: "Show More",
    showLess: "Show Less",
    
    // Hero section
    welcomeTitle: "Welcome to Lounge",
    welcomeSubtitle: "Discover the finest coffee and authentic cuisine in a warm, welcoming atmosphere",
    exploreMenu: "Explore Our Menu",
    
    // Categories
    ourCategories: "Our Categories",
    categoriesSubtitle: "Discover our carefully curated selection of premium beverages and delicious food items",
    backToCategories: "Back to Categories",
    items: "Items",
    
    // Products
    products: "Products",
    noProducts: "No products found",
    productNotFound: "Product not found",
    searchProducts: "Search products...",
    selectCategory: "Select Category",
    allCategories: "All Categories",
    price: "Price",
    sar: "SAR",
    viewDetails: "View Details",
    availableNow: "Available now",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    featured: "Featured",
    
    // Pagination
    page: "Page",
    of: "of",
    
    // Footer
    brandSubtitle: "Premium Coffee & Cuisine",
    brandDescription: "Experience the finest coffee and authentic cuisine in our welcoming atmosphere. Every cup tells a story, every meal creates memories.",
    quickLinks: "Quick Links",
    contactInfo: "Contact Info",
    address: "123 Coffee Street, Downtown, Riyadh",
    rights: "© 2024 Lounge. All rights reserved.",
    
    // Categories
    coffee: "Coffee & Espresso",
    coffeeDesc: "Premium coffee blends and specialty drinks",
    hotDrinks: "Hot Beverages",
    hotDrinksDesc: "Teas, hot chocolate, and warming drinks",
    coldDrinks: "Cold Beverages",
    coldDrinksDesc: "Iced coffees, smoothies, and refreshers",
    breakfast: "Breakfast",
    breakfastDesc: "Fresh pastries, eggs, and morning favorites",
    mainDishes: "Main Dishes",
    mainDishesDesc: "Sandwiches, salads, and hearty meals",
    desserts: "Desserts",
    dessertsDesc: "Cakes, pastries, and sweet treats",
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    menu: "القائمة",
    about: "من نحن",
    contact: "اتصل بنا",
    search: "البحث في القائمة...",
    
    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    addToCart: "إضافة للسلة",
    viewAll: "عرض الكل",
    showMore: "عرض المزيد",
    showLess: "عرض أقل",
    
    // Hero section
    welcomeTitle: "أهلاً بكم في لاونج",
    welcomeSubtitle: "اكتشف أجود أنواع القهوة والمأكولات الأصيلة في جو دافئ ومرحب",
    exploreMenu: "استكشف قائمتنا",
    
    // Categories
    ourCategories: "فئاتنا",
    categoriesSubtitle: "اكتشف مجموعتنا المختارة بعناية من المشروبات الفاخرة والأطعمة اللذيذة",
    backToCategories: "العودة للفئات",
    items: "عنصر",
    
    // Products
    products: "المنتجات",
    noProducts: "لم يتم العثور على منتجات",
    productNotFound: "المنتج غير موجود",
    searchProducts: "البحث في المنتجات...",
    selectCategory: "اختر الفئة",
    allCategories: "جميع الفئات",
    price: "السعر",
    sar: "ريال",
    viewDetails: "عرض التفاصيل",
    availableNow: "متوفر الآن",
    inStock: "متوفر",
    outOfStock: "غير متوفر",
    featured: "مميز",
    
    // Pagination
    page: "صفحة",
    of: "من",
    
    // Footer
    brandSubtitle: "قهوة ومأكولات فاخرة",
    brandDescription: "استمتع بأجود أنواع القهوة والمأكولات الأصيلة في جونا المرحب. كل كوب يحكي قصة، وكل وجبة تخلق ذكريات.",
    quickLinks: "روابط سريعة",
    contactInfo: "معلومات الاتصال",
    address: "123 شارع القهوة، وسط المدينة، الرياض",
    rights: "© 2024 لاونج. جميع الحقوق محفوظة.",
    
    // Categories
    coffee: "القهوة والإسبريسو",
    coffeeDesc: "خلطات قهوة فاخرة ومشروبات مميزة",
    hotDrinks: "المشروبات الساخنة",
    hotDrinksDesc: "الشاي والشوكولاتة الساخنة والمشروبات المدفئة",
    coldDrinks: "المشروبات الباردة",
    coldDrinksDesc: "القهوة المثلجة والعصائر والمشروبات المنعشة",
    breakfast: "الإفطار",
    breakfastDesc: "المعجنات الطازجة والبيض ومفضلات الصباح",
    mainDishes: "الأطباق الرئيسية",
    mainDishesDesc: "السندويشات والسلطات والوجبات الدسمة",
    desserts: "الحلويات",
    dessertsDesc: "الكعك والمعجنات والحلويات اللذيذة",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
