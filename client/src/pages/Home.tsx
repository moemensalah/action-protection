import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { LogoSection } from "@/components/LogoSection";
import { Footer } from "@/components/Footer";
import { SEO, getOrganizationSchema, getBreadcrumbSchema } from "@/components/SEO";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "wouter";
import type { Category } from "@shared/schema";

export default function Home() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  
  const breadcrumbItems = [
    { name: t("home"), url: "/" }
  ];

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleCategoryClick = (category: Category) => {
    setLocation(`/menu?category=${category.slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={isRTL ? "الرئيسية" : "Home"}
        description={isRTL 
          ? "مرحباً بكم في ليت لاونج - تجربة قهوة مميزة مع أفضل المشروبات والمأكولات في أجواء دافئة ومريحة. اكتشف قائمتنا المتنوعة من القهوة المميزة والحلويات الطازجة."
          : "Welcome to LateLounge - Premium coffee experience with the finest beverages and culinary delights in a warm, inviting atmosphere. Discover our diverse menu of specialty coffee and fresh desserts."
        }
        keywords={isRTL
          ? "ليت لاونج, قهوة مميزة, مقهى الرياض, قهوة طازجة, إفطار, حلويات, مشروبات ساخنة, مشروبات باردة"
          : "LateLounge, premium coffee, Riyadh cafe, fresh coffee, breakfast, desserts, hot beverages, cold drinks"
        }
        url="/"
        type="website"
        structuredData={{
          ...getOrganizationSchema(isRTL),
          ...getBreadcrumbSchema(breadcrumbItems)
        }}
      />
      <AnimatedBackground />
      {/* Logo Section */}
      <LogoSection />

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-gray-900 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t("ourCategories")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("categoriesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories?.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                productCount={category.id === 1 ? 6 : category.id === 2 ? 6 : category.id === 3 ? 6 : category.id === 4 ? 3 : category.id === 5 ? 2 : 6} // Mock counts
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Helper Components
import { Coffee } from "lucide-react";

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
