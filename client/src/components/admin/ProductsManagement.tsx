import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Image as ImageIcon, ArrowUpDown, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  categoryId: number;
  image: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  nameEn: string;
  nameAr: string;
  slug: string;
}

interface ProductForm {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  categoryId: number;
  image: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
}

export function ProductsManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newCategoryId, setNewCategoryId] = useState<number>(0);
  
  const [formData, setFormData] = useState<ProductForm>({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    price: "",
    categoryId: 0,
    image: "",
    stock: 0,
    isActive: true,
    isFeatured: false,
    isAvailable: true
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch products
  const { data: productsData = { products: [] }, isLoading } = useQuery({
    queryKey: ["/api/products", { category: selectedCategory }],
  });

  const filteredProducts = selectedCategory === "all" 
    ? productsData.products || []
    : productsData.products?.filter((product: Product) => 
        categories.find((cat: Category) => cat.id === product.categoryId)?.slug === selectedCategory
      ) || [];

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category ? (isRTL ? category.nameAr : category.nameEn) : '';
  };

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      return await apiRequest("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: isRTL ? "تم إنشاء المنتج" : "Product Created",
        description: isRTL ? "تم إنشاء المنتج بنجاح" : "Product created successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إنشاء المنتج" : "Failed to create product",
        variant: "destructive",
      });
    }
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductForm }) => {
      return await apiRequest(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({
        title: isRTL ? "تم تحديث المنتج" : "Product Updated",
        description: isRTL ? "تم تحديث المنتج بنجاح" : "Product updated successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في تحديث المنتج" : "Failed to update product",
        variant: "destructive",
      });
    }
  });

  // Move product mutation
  const moveMutation = useMutation({
    mutationFn: async ({ id, categoryId }: { id: number; categoryId: number }) => {
      return await apiRequest(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ categoryId }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsMoveDialogOpen(false);
      setMovingProduct(null);
      setNewCategoryId(0);
      toast({
        title: isRTL ? "تم نقل المنتج" : "Product Moved",
        description: isRTL ? "تم نقل المنتج بنجاح" : "Product moved successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في نقل المنتج" : "Failed to move product",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nameEn: "",
      nameAr: "",
      descriptionEn: "",
      descriptionAr: "",
      price: "",
      categoryId: 0,
      image: "",
      stock: 0,
      isActive: true,
      isFeatured: false,
      isAvailable: true
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      descriptionEn: product.descriptionEn,
      descriptionAr: product.descriptionAr,
      price: product.price,
      categoryId: product.categoryId,
      image: product.image,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isAvailable: product.isAvailable
    });
    setIsDialogOpen(true);
  };

  const handleMove = (product: Product) => {
    setMovingProduct(product);
    setNewCategoryId(product.categoryId);
    setIsMoveDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleMoveSubmit = () => {
    if (movingProduct && newCategoryId > 0) {
      moveMutation.mutate({ id: movingProduct.id, categoryId: newCategoryId });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isRTL ? "إدارة المنتجات" : "Products Management"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? "إدارة جميع المنتجات والأسعار والمخزون" : "Manage all products, prices, and inventory"}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? "إضافة منتج" : "Add Product"}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct 
                  ? (isRTL ? "تعديل المنتج" : "Edit Product")
                  : (isRTL ? "إضافة منتج جديد" : "Add New Product")
                }
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameEn">{isRTL ? "الاسم بالإنجليزية" : "Name (English)"}</Label>
                  <Input
                    id="nameEn"
                    value={formData.nameEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="nameAr">{isRTL ? "الاسم بالعربية" : "Name (Arabic)"}</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                    required
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="descEn">{isRTL ? "الوصف بالإنجليزية" : "Description (English)"}</Label>
                  <Textarea
                    id="descEn"
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="descAr">{isRTL ? "الوصف بالعربية" : "Description (Arabic)"}</Label>
                  <Textarea
                    id="descAr"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">{isRTL ? "الفئة" : "Category"}</Label>
                  <Select 
                    value={formData.categoryId.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? "اختر الفئة" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {isRTL ? category.nameAr : category.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price">{isRTL ? "السعر (ريال)" : "Price (SAR)"}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock">{isRTL ? "المخزون" : "Stock"}</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="image">{isRTL ? "رابط الصورة" : "Image URL"}</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">{isRTL ? "نشط" : "Active"}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isFeatured">{isRTL ? "مميز" : "Featured"}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isAvailable">{isRTL ? "متوفر" : "Available"}</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingProduct 
                    ? (isRTL ? "تحديث" : "Update")
                    : (isRTL ? "إضافة" : "Add")
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="categoryFilter">{isRTL ? "تصفية حسب الفئة" : "Filter by Category"}</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "جميع الفئات" : "All Categories"}</SelectItem>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {isRTL ? category.nameAr : category.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isRTL ? "قائمة المنتجات" : "Products List"}
            <Badge variant="secondary">{filteredProducts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "الصورة" : "Image"}</TableHead>
                  <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                  <TableHead>{isRTL ? "الفئة" : "Category"}</TableHead>
                  <TableHead>{isRTL ? "السعر" : "Price"}</TableHead>
                  <TableHead>{isRTL ? "المخزون" : "Stock"}</TableHead>
                  <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={isRTL ? product.nameAr : product.nameEn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {isRTL ? product.nameAr : product.nameEn}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {isRTL ? product.descriptionAr : product.descriptionEn}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryName(product.categoryId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{product.price} {isRTL ? "ريال" : "SAR"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={product.isActive ? "default" : "secondary"} className="w-fit">
                          {product.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                        </Badge>
                        {product.isFeatured && (
                          <Badge variant="outline" className="w-fit text-xs">
                            {isRTL ? "مميز" : "Featured"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMove(product)}
                        >
                          <Move className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Move Product Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "نقل المنتج" : "Move Product"}
            </DialogTitle>
          </DialogHeader>
          
          {movingProduct && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? "نقل" : "Moving"}: <strong>{isRTL ? movingProduct.nameAr : movingProduct.nameEn}</strong>
              </div>
              
              <div>
                <Label>{isRTL ? "الفئة الجديدة" : "New Category"}</Label>
                <Select value={newCategoryId.toString()} onValueChange={(value) => setNewCategoryId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر الفئة الجديدة" : "Select new category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {isRTL ? category.nameAr : category.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  onClick={handleMoveSubmit}
                  disabled={moveMutation.isPending || newCategoryId === movingProduct.categoryId}
                >
                  {isRTL ? "نقل" : "Move"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}