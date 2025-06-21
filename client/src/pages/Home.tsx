import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/CategoryCard";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { LogoSection } from "@/components/LogoSection";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "wouter";
import type { Category } from "@shared/schema";

export default function Home() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();

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

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="w-12 h-12 gradient-cafe rounded-full flex items-center justify-center">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`font-bold text-2xl text-primary-300 ${isRTL ? 'arabic-brand' : ''}`}>
                    {isRTL ? "لاونج" : "Lounge"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {t("brandSubtitle")}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                {t("brandDescription")}
              </p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <SocialIcon href="#" icon="facebook" />
                <SocialIcon href="#" icon="instagram" />
                <SocialIcon href="#" icon="twitter" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">{t("quickLinks")}</h4>
              <ul className="space-y-2">
                <FooterLink href="/menu" label={t("menu")} />
                <FooterLink href="/about" label={t("about")} />
                <FooterLink href="/contact" label={t("contact")} />
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-4">{t("contactInfo")}</h4>
              <div className="space-y-3">
                <ContactItem icon="📍" text={t("address")} />
                <ContactItem icon="📞" text="+1 (555) 123-4567" />
                <ContactItem icon="✉️" text="info@cafearabica.com" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">{t("rights")}</p>
          </div>
        </div>
      </footer>
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
