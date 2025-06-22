import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
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

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { language, t, isRTL } = useLanguage();

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${isRTL ? 'text-right' : ''}`} dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold mb-4 ${isRTL ? 'text-right' : ''}`}>
            {language === "ar" ? product.nameAr : product.nameEn}
          </DialogTitle>
          <DialogDescription className={`${isRTL ? 'text-right' : ''}`}>
            {language === "ar" ? product.descriptionAr : product.descriptionEn}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative">
            <img
              src={product.image}
              alt={language === "ar" ? product.nameAr : product.nameEn}
              className="w-full h-64 sm:h-80 object-cover rounded-lg"
            />
            
            <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} flex gap-2`}>
              <Badge className="bg-accent hover:bg-accent/90 text-white">
                {product.price} {t("sar")}
              </Badge>
              {product.isFeatured && (
                <Badge className="bg-primary hover:bg-primary/90 text-white">
                  ⭐ {t("featured")}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {t("about")} {language === "ar" ? product.nameAr : product.nameEn}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                {language === "ar" ? product.descriptionAr : product.descriptionEn}
              </p>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("price")}</p>
                  <span className="text-3xl font-bold text-primary">
                    {product.price} {t("sar")}
                  </span>
                </div>
                
                <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("availableNow")}
                  </p>
                  <Badge 
                    variant={product.isActive ? "default" : "secondary"}
                    className={product.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {product.isActive ? t("inStock") : t("outOfStock")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}