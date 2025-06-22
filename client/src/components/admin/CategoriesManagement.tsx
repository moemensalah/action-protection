import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Image as ImageIcon, Package, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
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
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryForm {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  slug: string;
  image: string;
  isActive: boolean;
}

export function CategoriesManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryForm>({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    slug: "",
    image: "",
    isActive: true
  });

  // Fetch categories from admin endpoint (includes all categories, properly sorted)
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/admin/categories"],
  });

  // Fetch products count for each category
  const { data: productsData = { products: [] } } = useQuery({
    queryKey: ["/api/products"],
  });

  const getProductCount = (categoryId: number) => {
    return (productsData as any)?.products?.filter((product: any) => product.categoryId === categoryId).length || 0;
  };

  const handleDelete = (category: Category) => {
    deleteMutation.mutate(category.id);
  };

  const handleReorder = (categoryId: number, direction: 'up' | 'down') => {
    reorderMutation.mutate({ id: categoryId, direction });
  };

  // Sort categories by sortOrder for display
  const sortedCategories = [...(categories as Category[])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      return await apiRequest("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: isRTL ? "تم إنشاء الفئة" : "Category Created",
        description: isRTL ? "تم إنشاء الفئة بنجاح" : "Category created successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إنشاء الفئة" : "Failed to create category",
        variant: "destructive",
      });
    }
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryForm }) => {
      return await apiRequest(`/api/admin/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      toast({
        title: isRTL ? "تم تحديث الفئة" : "Category Updated",
        description: isRTL ? "تم تحديث الفئة بنجاح" : "Category updated successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في تحديث الفئة" : "Failed to update category",
        variant: "destructive",
      });
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: isRTL ? "تم حذف الفئة" : "Category Deleted",
        description: isRTL ? "تم حذف الفئة وجميع منتجاتها بنجاح" : "Category and all its products deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حذف الفئة" : "Failed to delete category",
        variant: "destructive",
      });
    }
  });

  // Reorder category mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number; direction: 'up' | 'down' }) => {
      return await apiRequest(`/api/admin/categories/${id}/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ direction }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: isRTL ? "تم إعادة الترتيب" : "Reordered",
        description: isRTL ? "تم إعادة ترتيب الفئات بنجاح" : "Categories reordered successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إعادة الترتيب" : "Failed to reorder categories",
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
      slug: "",
      image: "",
      isActive: true
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      descriptionEn: category.descriptionEn,
      descriptionAr: category.descriptionAr,
      slug: category.slug,
      image: category.image,
      isActive: category.isActive
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (nameEn: string) => {
    return nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    if (formData.nameEn && !editingCategory) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.nameEn) }));
    }
  }, [formData.nameEn, editingCategory]);

  if (isLoading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className={`text-2xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? "إدارة الفئات" : "Categories Management"}
          </h2>
          <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? "إدارة فئات المنتجات والصور" : "Manage product categories and images"}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Plus className="h-4 w-4" />
              {isRTL ? "إضافة فئة" : "Add Category"}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                {editingCategory 
                  ? (isRTL ? "تعديل الفئة" : "Edit Category")
                  : (isRTL ? "إضافة فئة جديدة" : "Add New Category")
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
              
              <div>
                <Label htmlFor="slug">{isRTL ? "الرابط المختصر" : "Slug"}</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
              
              <FileUpload
                label={isRTL ? "صورة الفئة" : "Category Image"}
                value={formData.image}
                onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                isRTL={isRTL}
              />
              
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
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCategory 
                    ? (isRTL ? "تحديث" : "Update")
                    : (isRTL ? "إضافة" : "Add")
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <Package className="h-5 w-5" />
            {isRTL ? "قائمة الفئات" : "Categories List"}
            <Badge variant="secondary">{(categories as Category[]).length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={isRTL ? "text-right" : "text-left"} dir={isRTL ? "rtl" : "ltr"}>
                  {isRTL ? (
                    // RTL order: Actions, Status, Products, Description, Name, Image, Order
                    <>
                      <TableHead className="text-right">{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "الحالة" : "Status"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "المنتجات" : "Products"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "الوصف" : "Description"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "الاسم" : "Name"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "الصورة" : "Image"}</TableHead>
                      <TableHead className="text-right">{isRTL ? "الترتيب" : "Order"}</TableHead>
                    </>
                  ) : (
                    // LTR order: Order, Image, Name, Description, Products, Status, Actions
                    <>
                      <TableHead className="text-left">{isRTL ? "الترتيب" : "Order"}</TableHead>
                      <TableHead className="text-left">{isRTL ? "الصورة" : "Image"}</TableHead>
                      <TableHead className="text-left">{isRTL ? "الاسم" : "Name"}</TableHead>
                      <TableHead className="text-left">{isRTL ? "الوصف" : "Description"}</TableHead>
                      <TableHead className="text-left">{isRTL ? "المنتجات" : "Products"}</TableHead>
                      <TableHead className="text-left">{isRTL ? "الحالة" : "Status"}</TableHead>
                      <TableHead className="text-left">{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category: Category, index: number) => (
                  <TableRow key={category.id} className={isRTL ? "text-right" : "text-left"} dir={isRTL ? "rtl" : "ltr"}>
                    {isRTL ? (
                      // RTL order: Actions, Status, Products, Description, Name, Image, Order
                      <>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="text-right">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-right">
                                    {isRTL ? "تأكيد حذف الفئة" : "Confirm Delete Category"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-right">
                                    {isRTL 
                                      ? `هل أنت متأكد من حذف فئة "${category.nameAr}"؟ سيتم حذف جميع المنتجات التابعة لهذه الفئة (${getProductCount(category.id)} منتج). هذا الإجراء لا يمكن التراجع عنه.`
                                      : `Are you sure you want to delete category "${category.nameEn}"? This will also delete all products in this category (${getProductCount(category.id)} products). This action cannot be undone.`
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-row-reverse">
                                  <AlertDialogCancel>
                                    {isRTL ? "إلغاء" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending 
                                      ? (isRTL ? "جاري الحذف..." : "Deleting...")
                                      : (isRTL ? "حذف" : "Delete")
                                    }
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {getProductCount(category.id)} {isRTL ? "منتج" : "products"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="max-w-xs truncate text-gray-600 dark:text-gray-400 text-right">
                            {isRTL ? category.descriptionAr : category.descriptionEn}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {isRTL ? category.nameAr : category.nameEn}
                            </div>
                            <div className="text-sm text-gray-500">
                              {isRTL ? category.nameEn : category.nameAr}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {category.image ? (
                              <img 
                                src={getImageUrl(category.image)} 
                                alt={isRTL ? category.nameAr : category.nameEn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorder(category.id, 'up')}
                              disabled={index === 0 || reorderMutation.isPending}
                              className="p-1 h-6 w-6"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorder(category.id, 'down')}
                              disabled={index === sortedCategories.length - 1 || reorderMutation.isPending}
                              className="p-1 h-6 w-6"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      // LTR order: Order, Image, Name, Description, Products, Status, Actions
                      <>
                        <TableCell className="text-left">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorder(category.id, 'up')}
                              disabled={index === 0 || reorderMutation.isPending}
                              className="p-1 h-6 w-6"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorder(category.id, 'down')}
                              disabled={index === sortedCategories.length - 1 || reorderMutation.isPending}
                              className="p-1 h-6 w-6"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {category.image ? (
                              <img 
                                src={getImageUrl(category.image)} 
                                alt={isRTL ? category.nameAr : category.nameEn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {isRTL ? category.nameAr : category.nameEn}
                            </div>
                            <div className="text-sm text-gray-500">
                              {isRTL ? category.nameEn : category.nameAr}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="max-w-xs truncate text-gray-600 dark:text-gray-400 text-left">
                            {isRTL ? category.descriptionAr : category.descriptionEn}
                          </div>
                        </TableCell>
                        <TableCell className="text-left">
                          <Badge variant="outline">
                            {getProductCount(category.id)} {isRTL ? "منتج" : "products"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center gap-2 justify-start">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="text-left">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-left">
                                    {isRTL ? "تأكيد حذف الفئة" : "Confirm Delete Category"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-left">
                                    {isRTL 
                                      ? `هل أنت متأكد من حذف فئة "${category.nameAr}"؟ سيتم حذف جميع المنتجات التابعة لهذه الفئة (${getProductCount(category.id)} منتج). هذا الإجراء لا يمكن التراجع عنه.`
                                      : `Are you sure you want to delete category "${category.nameEn}"? This will also delete all products in this category (${getProductCount(category.id)} products). This action cannot be undone.`
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {isRTL ? "إلغاء" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteMutation.isPending}
                                  >
                                    {deleteMutation.isPending 
                                      ? (isRTL ? "جاري الحذف..." : "Deleting...")
                                      : (isRTL ? "حذف" : "Delete")
                                    }
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}