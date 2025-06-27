import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { getImageUrl } from "@/lib/utils";
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

interface CategoryCardProps {
  category: Category;
  productCount: number;
  onClick: () => void;
}

export function CategoryCard({ category, productCount, onClick }: CategoryCardProps) {
  const { language, t } = useLanguage();

  // Map category slugs to appropriate automotive icons
  const getIcon = () => {
    switch (category.slug) {
      case 'thermal-insulator':
        return <Shield className="h-12 w-12 mx-auto mb-2 animate-bounce text-blue-400" />;
      case 'thermal-protection':
        return <Car className="h-12 w-12 mx-auto mb-2 animate-bounce text-orange-400" />;
      case 'protection':
        return <Shield className="h-12 w-12 mx-auto mb-2 animate-bounce text-green-400" />;
      case 'polish':
        return <Sparkles className="h-12 w-12 mx-auto mb-2 animate-bounce text-purple-400" />;
      case 'painting-vacuuming':
        return <Paintbrush className="h-12 w-12 mx-auto mb-2 animate-bounce text-red-400" />;
      default:
        return <Wrench className="h-12 w-12 mx-auto mb-2 animate-bounce text-gray-400" />;
    }
  };

  return (
    <Card 
      className="automotive-category-card group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500"
      onClick={onClick}
    >
      <div className="relative h-full">
        <img
          src={getImageUrl(category.image)}
          alt={language === "ar" ? category.nameAr : category.nameEn}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            // Fallback to a gradient background if image fails to load
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-black/90 group-hover:via-black/60 group-hover:to-black/30 transition-all duration-500"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
              {getIcon()}
            </div>
            
            <h3 className="text-3xl font-bold mb-3 tracking-wide">
              {language === "ar" ? category.nameAr : category.nameEn}
            </h3>
            
            <p className="text-sm opacity-90 mb-6 leading-relaxed max-w-xs mx-auto">
              {language === "ar" ? category.descriptionAr : category.descriptionEn}
            </p>
            
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 text-sm font-medium shadow-lg">
              {productCount} {t("items")}
            </Badge>
          </div>
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-orange-400/30 to-orange-600/30 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500"></div>
      </div>
    </Card>
  );
}

// Import automotive icons
import { Shield, Car, Sparkles, Wrench, Paintbrush } from "lucide-react";
