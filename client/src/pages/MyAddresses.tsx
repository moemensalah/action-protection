import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { MapPin, Plus, Edit, Trash2, Star, Home, Building, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserAddress } from "@shared/schema";

const addressSchema = z.object({
  title: z.string().min(1, "Address title is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  address: z.string().min(10, "Full address is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  isDefault: z.boolean().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function MyAddresses() {
  const { t, isRTL } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      area: "",
      isDefault: false,
    },
  });

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  }) as { data: UserAddress[], isLoading: boolean };

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressForm) => {
      return await apiRequest('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setShowAddressDialog(false);
      setEditingAddress(null);
      form.reset();
      toast({
        title: isRTL ? "تم حفظ العنوان" : "Address Saved",
        description: isRTL ? "تم إضافة العنوان بنجاح" : "Address has been added successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حفظ العنوان" : "Failed to save address",
        variant: "destructive",
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AddressForm }) => {
      return await apiRequest(`/api/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setShowAddressDialog(false);
      setEditingAddress(null);
      form.reset();
      toast({
        title: isRTL ? "تم تحديث العنوان" : "Address Updated",
        description: isRTL ? "تم تحديث العنوان بنجاح" : "Address has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في تحديث العنوان" : "Failed to update address",
        variant: "destructive",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/addresses/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: isRTL ? "تم حذف العنوان" : "Address Deleted",
        description: isRTL ? "تم حذف العنوان بنجاح" : "Address has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حذف العنوان" : "Failed to delete address",
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/addresses/${id}/set-default`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      toast({
        title: isRTL ? "تم تحديث العنوان الافتراضي" : "Default Address Updated",
        description: isRTL ? "تم تحديث العنوان الافتراضي بنجاح" : "Default address has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في تحديث العنوان الافتراضي" : "Failed to update default address",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [authLoading, user, setLocation]);

  // Early returns after all hooks
  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleAddAddress = () => {
    setEditingAddress(null);
    form.reset();
    setShowAddressDialog(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    form.reset({
      title: address.title,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      area: address.area,
      isDefault: address.isDefault || false,
    });
    setShowAddressDialog(true);
  };

  const onSubmit = (data: AddressForm) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data });
    } else {
      createAddressMutation.mutate(data);
    }
  };

  const getAddressIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('home') || lowerTitle.includes('منزل')) return Home;
    if (lowerTitle.includes('work') || lowerTitle.includes('عمل')) return Building;
    return MapPin;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={`${isRTL ? 'عناويني' : 'My Addresses'} | Action Protection`}
        description="Manage your delivery addresses for automotive protection services"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isRTL ? "عناويني" : "My Addresses"}
            </h1>
            <Button onClick={handleAddAddress} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {isRTL ? "إضافة عنوان" : "Add Address"}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            </div>
          ) : addresses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {isRTL ? "لا توجد عناوين محفوظة" : "No Saved Addresses"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isRTL ? "أضف عنوانك الأول لتسهيل عملية الطلب" : "Add your first address to make ordering easier"}
                </p>
                <Button onClick={handleAddAddress} className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {isRTL ? "إضافة عنوان" : "Add Address"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address) => {
                const IconComponent = getAddressIcon(address.title);
                return (
                  <Card key={address.id} className={`relative ${address.isDefault ? 'border-amber-500 dark:border-amber-400' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{address.title}</CardTitle>
                            {address.isDefault && (
                              <Badge variant="secondary" className="mt-1">
                                <Star className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                                {isRTL ? "افتراضي" : "Default"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAddressMutation.mutate(address.id)}
                            disabled={deleteAddressMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{address.firstName} {address.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{address.address}, {address.area}, {address.city}</span>
                        </div>
                        <div>
                          <span className="font-medium">{isRTL ? "الهاتف:" : "Phone:"}</span> {address.phone}
                        </div>
                      </div>
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full"
                          onClick={() => setDefaultMutation.mutate(address.id)}
                          disabled={setDefaultMutation.isPending}
                        >
                          {isRTL ? "تعيين كافتراضي" : "Set as Default"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress 
                ? (isRTL ? "تعديل العنوان" : "Edit Address")
                : (isRTL ? "إضافة عنوان جديد" : "Add New Address")
              }
            </DialogTitle>
            <DialogDescription>
              {isRTL ? "أدخل تفاصيل العنوان" : "Enter the address details"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">{isRTL ? "عنوان العنوان" : "Address Title"}</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder={isRTL ? "مثل: المنزل، العمل" : "e.g., Home, Work"}
                className={form.formState.errors.title ? "border-red-500" : ""}
              />
              {form.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{isRTL ? "الاسم الأول" : "First Name"}</Label>
                <Input
                  id="firstName"
                  {...form.register("firstName")}
                  className={form.formState.errors.firstName ? "border-red-500" : ""}
                />
                {form.formState.errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">{isRTL ? "الاسم الأخير" : "Last Name"}</Label>
                <Input
                  id="lastName"
                  {...form.register("lastName")}
                  className={form.formState.errors.lastName ? "border-red-500" : ""}
                />
                {form.formState.errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">{isRTL ? "رقم الهاتف" : "Phone Number"}</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder={isRTL ? "مثل: +965 1234 5678" : "e.g., +965 1234 5678"}
                className={form.formState.errors.phone ? "border-red-500" : ""}
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="address">{isRTL ? "العنوان التفصيلي" : "Full Address"}</Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder={isRTL ? "الشارع، البناية، الشقة" : "Street, Building, Apartment"}
                className={form.formState.errors.address ? "border-red-500" : ""}
              />
              {form.formState.errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">{isRTL ? "المنطقة" : "Area"}</Label>
                <Input
                  id="area"
                  {...form.register("area")}
                  placeholder={isRTL ? "مثل: السالمية" : "e.g., Salmiya"}
                  className={form.formState.errors.area ? "border-red-500" : ""}
                />
                {form.formState.errors.area && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.area.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="city">{isRTL ? "المدينة" : "City"}</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder={isRTL ? "مثل: حولي" : "e.g., Hawalli"}
                  className={form.formState.errors.city ? "border-red-500" : ""}
                />
                {form.formState.errors.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="isDefault"
                {...form.register("isDefault")}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <Label htmlFor="isDefault">
                {isRTL ? "تعيين كعنوان افتراضي" : "Set as default address"}
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddressDialog(false)}
                className="flex-1"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {(createAddressMutation.isPending || updateAddressMutation.isPending) 
                  ? (isRTL ? "جاري الحفظ..." : "Saving...") 
                  : (editingAddress ? (isRTL ? "تحديث" : "Update") : (isRTL ? "حفظ" : "Save"))
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}