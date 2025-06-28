import { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "wouter";

export function CartDropdown() {
  const { state, updateQuantity, removeFromCart } = useCart();
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation("/checkout");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          {state.itemCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 bg-amber-600 dark:bg-amber-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full"
            >
              {state.itemCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align={isRTL ? "start" : "end"} 
        className="w-80 p-0 max-h-96 overflow-hidden"
      >
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t("cart")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {state.items.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t("cartEmpty")}
            </p>
            <Button 
              onClick={() => {
                setIsOpen(false);
                setLocation("/menu");
              }}
              className="w-full"
            >
              {t("startShopping")}
            </Button>
          </div>
        ) : (
          <>
            <div className="max-h-64 overflow-y-auto">
              {state.items.map((item) => (
                <div key={item.id} className="p-4 border-b dark:border-gray-700 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.product.image}
                      alt={isRTL ? item.product.nameAr : item.product.nameEn}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {isRTL ? item.product.nameAr : item.product.nameEn}
                      </h4>
                      <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                        {item.product.price} {t("sar")}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {t("total")}:
                </span>
                <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
                  {state.total.toFixed(2)} {t("sar")}
                </span>
              </div>
              
              <Button 
                onClick={handleCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
              >
                {t("proceedToCheckout")}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}