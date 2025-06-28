import { ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { KuwaitiHeroSection } from "@/components/KuwaitiHeroSection";
import { CarBrandSlider } from "@/components/CarBrandSlider";
import { VideoShowcaseSection } from "@/components/VideoShowcaseSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Footer } from "@/components/Footer";
import { SEO, getOrganizationSchema, getBreadcrumbSchema } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface Category {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  slug: string;
  image: string;
  isActive: boolean;
}

export default function Home() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  
  const breadcrumbItems = [
    { name: t("home"), url: "/" }
  ];

  // Fetch categories from database API
  const { data: categoriesResponse, isLoading } = useQuery<{ categories: Category[] }>({
    queryKey: ["/api/categories"],
  });

  // Fetch products to get category counts
  const { data: productsResponse } = useQuery<{ products: any[] }>({
    queryKey: ["/api/products"],
  });

  const categories = categoriesResponse?.categories || [];
  const activeCategories = categories.filter((cat: Category) => cat.isActive);
  const products = productsResponse?.products || [];

  // Calculate product count for each category
  const getCategoryProductCount = (categoryId: number) => {
    return products.filter(product => product.categoryId === categoryId && product.isActive).length;
  };

  const handleCategoryClick = (category: Category) => {
    setLocation(`/menu?category=${category.slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={isRTL ? "الرئيسية" : "Home"}
        description={isRTL 
          ? "مرحباً بكم في أكشن بروتكشن - خدمات حماية مركبات متقدمة مع العزل الحراري وحماية الطلاء والتلميع الاحترافي. اكتشف خدماتنا الشاملة لحماية وعناية مركبتك."
          : "Welcome to Action Protection - Advanced vehicle protection services with thermal insulation, paint protection, and professional polishing. Discover our comprehensive services for vehicle protection and care."
        }
        keywords={isRTL
          ? "أكشن بروتكشن, حماية مركبات, عزل حراري, حماية طلاء, تلميع سيارات, طلاء سيراميكي, تنظيف سيارات, حماية داخلية"
          : "Action Protection, vehicle protection, thermal insulation, paint protection, car polishing, ceramic coating, car cleaning, interior protection"
        }
        url="/"
        type="website"
        structuredData={{
          ...getOrganizationSchema(isRTL),
          ...getBreadcrumbSchema(breadcrumbItems)
        }}
      />
      {/* Kuwaiti Hero Section */}
      <KuwaitiHeroSection />

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-900 theme-transition relative overflow-hidden">
        {/* Animated light effects background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Base light gradients */}
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-orange-100/20 via-amber-50/10 to-transparent dark:from-orange-900/15 dark:via-amber-800/8 dark:to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-blue-50/15 via-sky-50/8 to-transparent dark:from-blue-900/12 dark:via-sky-800/6 dark:to-transparent"></div>
          
          {/* Floating light orbs */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-orange-300/20 via-amber-200/10 to-transparent dark:from-orange-400/15 dark:via-amber-300/8 dark:to-transparent rounded-full blur-3xl animate-pulse"
               style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-radial from-blue-300/18 via-sky-200/9 to-transparent dark:from-blue-400/13 dark:via-sky-300/7 dark:to-transparent rounded-full blur-2xl animate-pulse"
               style={{ animationDelay: '2s', animationDuration: '8s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-radial from-purple-200/16 via-violet-100/8 to-transparent dark:from-purple-400/12 dark:via-violet-300/6 dark:to-transparent rounded-full blur-3xl animate-pulse"
               style={{ animationDelay: '4s', animationDuration: '10s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-56 h-56 bg-gradient-radial from-green-200/14 via-emerald-100/7 to-transparent dark:from-green-400/10 dark:via-emerald-300/5 dark:to-transparent rounded-full blur-2xl animate-pulse"
               style={{ animationDelay: '6s', animationDuration: '7s' }}></div>
          
          {/* Twinkling light spots */}
          <div className="absolute top-1/6 left-1/6 w-4 h-4 bg-yellow-300/80 dark:bg-yellow-400/60 rounded-full blur-sm animate-ping"
               style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          <div className="absolute top-2/3 right-1/5 w-3 h-3 bg-blue-400/70 dark:bg-blue-300/50 rounded-full blur-sm animate-ping"
               style={{ animationDelay: '3s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/4 left-2/3 w-5 h-5 bg-orange-400/75 dark:bg-orange-300/55 rounded-full blur-sm animate-ping"
               style={{ animationDelay: '5s', animationDuration: '5s' }}></div>
          <div className="absolute top-3/4 right-2/3 w-2 h-2 bg-purple-400/65 dark:bg-purple-300/45 rounded-full blur-sm animate-ping"
               style={{ animationDelay: '7s', animationDuration: '6s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t("ourCategories")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("categoriesSubtitle")}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeCategories.map((category: Category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  productCount={getCategoryProductCount(category.id)}
                  onClick={() => handleCategoryClick(category)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Car Brand Slider */}
      <CarBrandSlider />

      {/* Video Showcase Section */}
      <VideoShowcaseSection />

      {/* Customer Reviews */}
      <ReviewsSection />

      <Footer />
    </div>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: string }) {
  const iconMap = {
    facebook: "👥",
    instagram: "📸", 
    twitter: "🐦"
  };
  
  return (
    <a
      href={href}
      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
    >
      <span className="text-lg">{iconMap[icon as keyof typeof iconMap]}</span>
    </a>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        className="text-gray-400 hover:text-white transition-colors"
      >
        {label}
      </a>
    </li>
  );
}

function ContactItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse">
      <span className="text-primary-400">{icon}</span>
      <span className="text-gray-400">{text}</span>
    </div>
  );
}
