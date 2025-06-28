import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { getImageUrl } from "@/lib/utils";
import { getDefaultProductImage } from "@/lib/defaultImages";

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  categoryId: number;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
}

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { language, t } = useLanguage();

  // Get image URL - use default if no image is set
  const getProductImageUrl = () => {
    if (product.image && product.image.trim() !== '') {
      return getImageUrl(product.image);
    }
    return getDefaultProductImage(product.categoryId, product.nameEn);
  };

  return (
    <Card className="product-card group overflow-hidden shadow-lg hover:shadow-xl">
      <div className="relative overflow-hidden cursor-pointer" onClick={() => onViewDetails?.(product)}>
        <img
          src={getProductImageUrl()}
          alt={language === "ar" ? product.nameAr : product.nameEn}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        <Badge className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-accent hover:bg-accent/90 text-white">
          {product.price} {t("sar")}
        </Badge>
        
        {product.isFeatured && (
          <Badge className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-primary hover:bg-primary/90 text-white">
            ⭐ {t("featured")}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {language === "ar" ? product.nameAr : product.nameEn}
        </h3>
        
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
          {language === "ar" ? product.descriptionAr : product.descriptionEn}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {product.price} {t("sar")}
          </span>
          
          <Button
            onClick={() => onViewDetails?.(product)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Eye className="h-4 w-4" />
            {t("viewDetails")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
