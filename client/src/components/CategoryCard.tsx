import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
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

  return (
    <Card 
      className="category-card group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl"
      onClick={onClick}
    >
      <div className="relative h-full">
        <img
          src={category.image}
          alt={language === "ar" ? category.nameAr : category.nameEn}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        <div className="category-overlay absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-all duration-300 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <div className="mb-4">
              <Coffee className="h-12 w-12 mx-auto mb-2 animate-bounce" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">
              {language === "ar" ? category.nameAr : category.nameEn}
            </h3>
            
            <p className="text-sm opacity-90 mb-4">
              {language === "ar" ? category.descriptionAr : category.descriptionEn}
            </p>
            
            <Badge className="bg-accent hover:bg-accent/90 text-white">
              {productCount} {t("items")}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Import the Coffee icon
import { Coffee } from "lucide-react";
