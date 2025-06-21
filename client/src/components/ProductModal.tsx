import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Product } from "@shared/schema";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { language, t } = useLanguage();

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">
            {language === "ar" ? product.nameAr : product.nameEn}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative">
            <img
              src={product.image}
              alt={language === "ar" ? product.nameAr : product.nameEn}
              className="w-full h-64 sm:h-80 object-cover rounded-lg"
            />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge className="bg-accent hover:bg-accent/90 text-white">
                ${product.price}
              </Badge>
              {product.isFeatured && (
                <Badge className="bg-primary hover:bg-primary/90 text-white">
                  ⭐ Featured
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
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <span className="text-3xl font-bold text-primary">
                    ${product.price}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-2">
                    Available now
                  </p>
                  <Badge 
                    variant={product.isActive ? "default" : "secondary"}
                    className={product.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {product.isActive ? "In Stock" : "Out of Stock"}
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