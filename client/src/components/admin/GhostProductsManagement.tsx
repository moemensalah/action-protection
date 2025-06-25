import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: number;
  nameEn: string | null;
  nameAr: string | null;
  categoryId: number | null;
  isActive: boolean;
  createdAt: string;
}

export function GhostProductsManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Fetch all products including ghost products
  const { data: allProductsData, isLoading } = useQuery({
    queryKey: ["/api/admin/products/all"],
    enabled: showAllProducts,
  });

  // Fetch categories for validation
  const { data: categories } = useQuery({
    queryKey: ["/api/admin/categories"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف المنتج بنجاح" : "Product deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حذف المنتج" : "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const identifyGhostProducts = (products: Product[]) => {
    if (!products || !categories) return [];
    
    const categoryIds = new Set(categories.map((cat: any) => cat.id));
    
    return products.filter(product => 
      !product.nameEn || 
      !product.nameAr || 
      !product.categoryId || 
      !categoryIds.has(product.categoryId)
    );
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذا المنتج؟" : "Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const allProducts = allProductsData?.products || [];
  const ghostProducts = identifyGhostProducts(allProducts);
  const validProducts = allProducts.filter(p => !ghostProducts.some(ghost => ghost.id === p.id));

  if (!showAllProducts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {isRTL ? "إدارة المنتجات الشبحية" : "Ghost Products Management"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-gray-600 dark:text-gray-400 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL 
              ? "عرض وإزالة المنتجات الشبحية أو المعطلة التي لا تظهر بشكل صحيح على الموقع"
              : "View and remove ghost or corrupted products that don't display properly on the website"
            }
          </p>
          <Button onClick={() => setShowAllProducts(true)} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {isRTL ? "عرض جميع المنتجات" : "Show All Products"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center justify-between ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {isRTL ? "إدارة المنتجات الشبحية" : "Ghost Products Management"}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowAllProducts(false)}
              className="flex items-center gap-2"
            >
              <EyeOff className="h-4 w-4" />
              {isRTL ? "إخفاء" : "Hide"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {allProducts.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                {isRTL ? "إجمالي المنتجات" : "Total Products"}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {validProducts.length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {isRTL ? "المنتجات الصالحة" : "Valid Products"}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {ghostProducts.length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                {isRTL ? "المنتجات الشبحية" : "Ghost Products"}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
            </div>
          ) : ghostProducts.length > 0 ? (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold text-red-600 dark:text-red-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? "المنتجات الشبحية المكتشفة" : "Detected Ghost Products"}
              </h3>
              {ghostProducts.map((product) => (
                <Card key={product.id} className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">
                            {isRTL ? "شبحي" : "Ghost"}
                          </Badge>
                          <span className="text-sm text-gray-500">ID: {product.id}</span>
                        </div>
                        <div className="space-y-1">
                          <div>
                            <strong>{isRTL ? "الاسم الإنجليزي:" : "English Name:"}</strong>{" "}
                            {product.nameEn || <span className="text-red-500">{isRTL ? "مفقود" : "Missing"}</span>}
                          </div>
                          <div>
                            <strong>{isRTL ? "الاسم العربي:" : "Arabic Name:"}</strong>{" "}
                            {product.nameAr || <span className="text-red-500">{isRTL ? "مفقود" : "Missing"}</span>}
                          </div>
                          <div>
                            <strong>{isRTL ? "الفئة:" : "Category:"}</strong>{" "}
                            {product.categoryId || <span className="text-red-500">{isRTL ? "مفقودة" : "Missing"}</span>}
                          </div>
                          <div className="text-sm text-gray-500">
                            {isRTL ? "تاريخ الإنشاء:" : "Created:"} {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deleteProductMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isRTL ? "حذف" : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-green-600 dark:text-green-400">
              <div className="text-lg font-semibold mb-2">
                {isRTL ? "لا توجد منتجات شبحية" : "No Ghost Products Found"}
              </div>
              <div className="text-sm">
                {isRTL ? "جميع المنتجات صالحة ومعروضة بشكل صحيح" : "All products are valid and displaying correctly"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}