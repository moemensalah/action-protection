import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { Minus, Plus, Trash2, ShoppingBag, User, MapPin, CreditCard, Check, ArrowRight, ArrowLeft, LogIn, UserPlus, Home, Building, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserAddress } from "@shared/schema";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  address: z.string().min(10, "Full address is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutNew() {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Address management state
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'visa' | 'mastercard' | 'knet'>('cod');

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      email: (user as any)?.email || "",
      phone: "",
      address: "",
      city: "",
      area: "",
      notes: "",
    }
  });

  // Address schema for new address creation
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

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: "",
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      phone: "",
      address: "",
      city: "",
      area: "",
      isDefault: false,
    }
  });

  // Query to fetch user addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  // Type-safe address array
  const addressList = Array.isArray(addresses) ? addresses : [];

  // Mutation to create new address
  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressForm) => {
      return await apiRequest("/api/addresses", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (newAddress: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setSelectedAddressId(newAddress.id.toString());
      setShowAddressDialog(false);
      setShowNewAddressForm(false);
      addressForm.reset();
      toast({
        title: isRTL ? "تم إنشاء العنوان" : "Address Created",
        description: isRTL ? "تم إنشاء العنوان بنجاح" : "Address created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إنشاء العنوان" : "Failed to create address",
        variant: "destructive",
      });
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (state.items.length === 0 && !orderPlaced) {
      setLocation("/menu");
    }
  }, [state.items.length, orderPlaced, setLocation]);

  // Check if new address form is valid
  const isNewAddressFormValid = () => {
    if (!showNewAddressForm) return false;
    const values = form.getValues();
    return values.firstName && 
           values.lastName && 
           values.email && 
           values.phone && 
           values.address && 
           values.city && 
           values.area &&
           values.firstName.length > 0 &&
           values.lastName.length > 0 &&
           values.email.includes('@') &&
           values.phone.length >= 8 &&
           values.address.length >= 10 &&
           values.city.length >= 2 &&
           values.area.length >= 2;
  };

  // Check if user can proceed to payment
  const canProceedToPayment = () => {
    if (!user) return true; // Guest users can always proceed if form is filled
    return selectedAddressId || isNewAddressFormValid();
  };

  // Watch form values to trigger re-render when validation state changes
  const watchedValues = form.watch();
  
  // Debug form value changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form field changed:", { name, type, value: name ? (value as any)?.[name] : undefined });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Conditional submit handler that bypasses form validation for existing addresses
  const handleOrderSubmission = async () => {
    console.log("Button clicked - starting order submission");
    console.log("User:", user);
    console.log("Selected address ID:", selectedAddressId);
    console.log("Show new address form:", showNewAddressForm);
    
    try {
      // If using existing address, bypass form validation
      if (user && selectedAddressId && !showNewAddressForm) {
        console.log("Processing with existing address...");
        console.log("Available addresses:", addresses);
        console.log("Looking for address ID:", selectedAddressId);
        
        const selectedAddress = (addresses as any[])?.find((addr: any) => addr.id === parseInt(selectedAddressId));
        console.log("Found selected address:", selectedAddress);
        
        if (selectedAddress) {
          console.log("Processing order with selected address data...");
          await processOrder({
            firstName: (user as any)?.firstName,
            lastName: (user as any)?.lastName,
            email: (user as any)?.email,
            phone: selectedAddress.phone,
            address: selectedAddress.address,
            city: selectedAddress.city,
            area: selectedAddress.area,
            notes: selectedAddress.notes || ""
          });
          return;
        } else {
          console.error("Selected address not found in addresses list!");
          toast({
            title: "Error",
            description: "Selected address not found. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // If creating new address, trigger form validation
      console.log("Triggering form validation for new address...");
      form.handleSubmit(onSubmit)();
    } catch (error) {
      console.error("Error in handleOrderSubmission:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    await processOrder(data);
  };

  const processOrder = async (data: CheckoutForm) => {
    console.log("Form submission started");
    console.log("Form data received:", data);
    console.log("User:", user);
    console.log("Selected address ID:", selectedAddressId);
    console.log("Show new address form:", showNewAddressForm);
    console.log("Payment method:", paymentMethod);
    
    setIsSubmitting(true);
    try {
      // Prepare order data based on whether user selected existing address or is creating new one
      let orderData;
      
      if (user && selectedAddressId && !showNewAddressForm) {
        // User selected an existing address
        const selectedAddress = (addresses as any[])?.find((addr: any) => addr.id === parseInt(selectedAddressId));
        if (selectedAddress) {
          orderData = {
            firstName: selectedAddress.firstName,
            lastName: selectedAddress.lastName,
            email: (user as any)?.email || null, // Use user email, not address email
            phone: selectedAddress.phone,
            address: selectedAddress.address,
            city: selectedAddress.city,
            area: selectedAddress.area,
            notes: data.notes || "",
            paymentMethod: paymentMethod,
            selectedAddressId: selectedAddressId, // Include this to let server know it's existing address
            items: state.items,
            totalAmount: state.total,
            userId: (user as any)?.id || null,
          };
        } else {
          throw new Error("Selected address not found");
        }
      } else {
        // User is creating a new address or is a guest
        orderData = {
          ...data,
          email: data.email || (user as any)?.email || null, // Ensure email is included
          paymentMethod: paymentMethod,
          selectedAddressId: null, // Explicitly mark as new address
          items: state.items,
          totalAmount: state.total,
          userId: (user as any)?.id || null,
        };
      }

      console.log("Submitting order data:", orderData);

      const response = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      console.log("Order response received:", response);
      
      const result = await response.json();
      console.log("Order result parsed:", result);

      const orderNum = result.orderNumber || `AP-${Date.now()}`;
      localStorage.setItem('lastOrderNumber', orderNum);
      
      console.log("Checkout: Order created successfully, redirecting to:", `/order-complete?order=${orderNum}`);
      
      // Invalidate cache to refresh orders and addresses
      queryClient.invalidateQueries({ queryKey: ["/api/my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      
      clearCart();
      setLocation(`/order-complete?order=${orderNum}`);
      return;
    } catch (error) {
      console.error("Error placing order:", error);
      
      // Don't show fake success - show actual error
      alert(`Order failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // For now, only clear cart and redirect if it was actually successful
      // setOrderNumber(`AP-${Date.now()}`);
      // setOrderPlaced(true);
      // clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: isRTL ? "مراجعة الطلب" : "Review Order", icon: ShoppingBag },
    { id: 2, title: isRTL ? "معلومات العميل" : "Customer Info", icon: User },
    { id: 3, title: isRTL ? "الدفع والتأكيد" : "Payment & Confirm", icon: CreditCard },
  ];

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
        <SEO 
          title={`${t("orderPlaced")} | Action Protection`}
          description={t("orderPlaced")}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  {t("orderPlaced")}
                </CardTitle>
                <CardDescription className="text-lg">
                  {t("orderNumber")}: <span className="font-bold text-primary">{orderNumber}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isRTL ? "شكراً لك على طلبك. سنتواصل معك قريباً لتأكيد التفاصيل وترتيب التسليم." : "Thank you for your order. We'll contact you soon to confirm details and arrange delivery."}
                </p>
                <div className="space-y-3">
                  <Button onClick={() => setLocation("/")} className="w-full">
                    {t("home")}
                  </Button>
                  <Button onClick={() => setLocation("/menu")} variant="outline" className="w-full">
                    {isRTL ? "متابعة التسوق" : "Continue Shopping"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={`${t("checkout")} | Action Protection`}
        description="Complete your order for premium automotive protection services"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {t("checkout")}
          </h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.id <= currentStep 
                      ? 'bg-amber-600 border-amber-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500'
                  }`}>
                    {step.id < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 rtl:ml-0 rtl:mr-2 text-sm font-medium ${
                    step.id <= currentStep ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 mx-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Order Review */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  {t("orderSummary")}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "مراجعة وتعديل طلبك قبل المتابعة" : "Review and modify your order before proceeding"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg dark:border-gray-700">
                      <img
                        src={item.product.image || "/api/placeholder/80/80"}
                        alt={isRTL ? item.product.nameAr || "" : item.product.nameEn || ""}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {isRTL ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {isRTL ? item.product.descriptionAr : item.product.descriptionEn}
                        </p>
                        <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mt-2">
                          {item.product.price} {t("kwd")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center bg-gray-100 dark:bg-gray-800 py-1 px-2 rounded">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {isRTL ? "إزالة" : "Remove"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{isRTL ? "المجموع الفرعي:" : "Subtotal:"}</span>
                    <span>{state.total.toFixed(2)} {t("kwd")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{isRTL ? "الضرائب:" : "Tax:"}</span>
                    <span>{isRTL ? "شامل الضريبة" : "Included"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("total")}:</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {state.total.toFixed(2)} {t("kwd")}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                  >
                    {isRTL ? "متابعة إلى معلومات العميل" : "Continue to Customer Info"}
                    <ArrowRight className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Customer Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {isRTL ? "معلومات العميل" : "Customer Information"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "أدخل معلوماتك الشخصية ومعلومات التسليم" : "Enter your personal and delivery information"}
                </CardDescription>
              </CardHeader>
              
              {/* Authentication Options */}
              {!user && (
                <CardContent className="border-b pb-6 mb-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      {isRTL ? "لديك حساب؟" : "Have an account?"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {isRTL ? "قم بتسجيل الدخول لحفظ معلوماتك وتتبع طلباتك" : "Sign in to save your information and track your orders"}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAuthMode('login');
                          setShowAuthDialog(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        {isRTL ? "تسجيل الدخول" : "Sign In"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAuthMode('register');
                          setShowAuthDialog(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        {isRTL ? "إنشاء حساب" : "Create Account"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {isRTL ? "أو تابع كضيف" : "Or continue as guest"}
                    </p>
                  </div>
                </CardContent>
              )}
              
              {user && (
                <CardContent className="border-b pb-6 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          {isRTL ? "مرحباً" : "Welcome"}, {(user as any)?.firstName || 'User'}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {isRTL ? "ستتمكن من تتبع طلبك في صفحة طلباتي" : "You'll be able to track your order in My Orders"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
              
              <CardContent className="space-y-6">
                {/* Address Section for Logged-in Users */}
                {user && (
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <Label className="text-base font-medium">
                          {isRTL ? "عنوان التسليم" : "Delivery Address"}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddressDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        {isRTL ? "إدارة العناوين" : "Manage Addresses"}
                      </Button>
                    </div>

                    {addressesLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">
                          {isRTL ? "جار تحميل العناوين..." : "Loading addresses..."}
                        </p>
                      </div>
                    ) : addressList.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid gap-3">
                          {addressList.map((addr: any) => (
                            <label key={addr.id} className="cursor-pointer">
                              <div className={`border rounded-lg p-3 transition-colors ${
                                selectedAddressId === addr.id.toString()
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}>
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="selectedAddress"
                                    value={addr.id.toString()}
                                    checked={selectedAddressId === addr.id.toString()}
                                    onChange={() => setSelectedAddressId(addr.id.toString())}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">
                                        {addr.title}
                                      </span>
                                      {addr.isDefault && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Star className="h-3 w-3 mr-1" />
                                          {isRTL ? "افتراضي" : "Default"}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {addr.firstName} {addr.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {addr.address}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {addr.area}, {addr.city}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {addr.phone}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowNewAddressForm(true);
                            setSelectedAddressId(null); // Clear selected address when creating new
                          }}
                          className="w-full flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          {isRTL ? "إضافة عنوان جديد" : "Add New Address"}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {isRTL ? "لا توجد عناوين محفوظة" : "No saved addresses"}
                        </p>
                        <Button
                          type="button"
                          onClick={() => setShowNewAddressForm(true)}
                          className="flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          {isRTL ? "إضافة عنوان جديد" : "Add New Address"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Address Input for Guests or when creating new address */}
                {(!user || showNewAddressForm) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        {isRTL ? "معلومات العنوان" : "Address Information"}
                      </Label>
                      {user && showNewAddressForm && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          {isRTL ? "إلغاء" : "Cancel"}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{t("firstName")}</Label>
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
                        <Label htmlFor="lastName">{t("lastName")}</Label>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">{t("email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register("email")}
                          className={form.formState.errors.email ? "border-red-500" : ""}
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">{t("phoneNumber")}</Label>
                        <Input
                          id="phone"
                          {...form.register("phone", {
                            required: "Phone number is required",
                            minLength: { value: 8, message: "Valid phone number is required" }
                          })}
                          placeholder="+965 XXXX XXXX"
                          className={form.formState.errors.phone ? "border-red-500" : ""}
                        />
                        {form.formState.errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">{t("deliveryAddress")}</Label>
                      <Textarea
                        id="address"
                        {...form.register("address")}
                        placeholder={isRTL ? "العنوان الكامل مع تفاصيل الموقع" : "Full address with location details"}
                        className={form.formState.errors.address ? "border-red-500" : ""}
                      />
                      {form.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {form.formState.errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">{t("city")}</Label>
                        <Input
                          id="city"
                          {...form.register("city")}
                          placeholder={isRTL ? "الكويت" : "Kuwait"}
                          className={form.formState.errors.city ? "border-red-500" : ""}
                        />
                        {form.formState.errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="area">{t("area")}</Label>
                        <Input
                          id="area"
                          {...form.register("area")}
                          placeholder={isRTL ? "المنطقة" : "Area"}
                          className={form.formState.errors.area ? "border-red-500" : ""}
                        />
                        {form.formState.errors.area && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.area.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">{isRTL ? "ملاحظات إضافية (اختياري)" : "Additional Notes (Optional)"}</Label>
                      <Textarea
                        id="notes"
                        {...form.register("notes")}
                        placeholder={isRTL ? "أي تعليمات خاصة للتسليم" : "Any special delivery instructions"}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 rtl:rotate-180" />
                    {isRTL ? "العودة إلى مراجعة الطلب" : "Back to Order Review"}
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                    disabled={!canProceedToPayment()}
                  >
                    {isRTL ? "متابعة إلى الدفع" : "Continue to Payment"}
                    <ArrowRight className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment & Confirmation */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {isRTL ? "الدفع والتأكيد" : "Payment & Confirmation"}
                </CardTitle>
                <CardDescription>
                  {isRTL ? "مراجعة نهائية وتأكيد الطلب" : "Final review and order confirmation"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">{t("orderSummary")}</h3>
                  <div className="space-y-2">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{isRTL ? item.product.nameAr : item.product.nameEn} x{item.quantity}</span>
                        <span>{(parseFloat(item.product.price) * item.quantity).toFixed(2)} {t("kwd")}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>{t("total")}</span>
                      <span className="text-amber-600">{state.total.toFixed(2)} {t("kwd")}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-medium">{t("paymentMethod")}</h3>
                  <div className="grid gap-3">
                    {/* Cash on Delivery */}
                    <label className="cursor-pointer">
                      <div className={`border rounded-lg p-4 transition-colors ${
                        paymentMethod === 'cod'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="text-green-600"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-green-800 dark:text-green-200">
                              {isRTL ? "الدفع عند التسليم" : "Cash on Delivery"}
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {isRTL ? "ادفع نقداً أو بالكارت عند استلام الطلب" : "Pay with cash or card upon delivery"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Credit/Debit Cards (Disabled) */}
                    <div className="opacity-50">
                      <div className="border rounded-lg p-4 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            disabled
                            className="text-gray-400"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-600 dark:text-gray-400">
                              {isRTL ? "فيزا / ماستركارد" : "Visa / MasterCard"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              {isRTL ? "غير متاح حالياً" : "Currently unavailable"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KNET (Disabled) */}
                    <div className="opacity-50">
                      <div className="border rounded-lg p-4 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            disabled
                            className="text-gray-400"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-600 dark:text-gray-400">
                              {isRTL ? "كي نت" : "KNET"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              {isRTL ? "غير متاح حالياً" : "Currently unavailable"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 rtl:rotate-180" />
                    {isRTL ? "العودة إلى معلومات العميل" : "Back to Customer Info"}
                  </Button>
                  <Button 
                    onClick={handleOrderSubmission}
                    disabled={isSubmitting}
                    className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                  >
                    {isSubmitting ? (isRTL ? "جاري تأكيد الطلب..." : "Placing Order...") : t("placeOrder")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === 'login' 
                ? (isRTL ? "تسجيل الدخول" : "Sign In") 
                : (isRTL ? "إنشاء حساب جديد" : "Create New Account")
              }
            </DialogTitle>
            <DialogDescription>
              {authMode === 'login' 
                ? (isRTL ? "ادخل بياناتك لتسجيل الدخول" : "Enter your credentials to sign in")
                : (isRTL ? "أنشئ حساباً جديداً لحفظ معلوماتك" : "Create a new account to save your information")
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {isRTL ? "يمكنك تسجيل الدخول أو إنشاء حساب بسرعة" : "You can quickly sign in or create an account"}
              </p>
              <div className="space-y-3">
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => {
                    setLocation('/login');
                    setShowAuthDialog(false);
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {isRTL ? "الذهاب لصفحة تسجيل الدخول" : "Go to Login Page"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setLocation('/register');
                    setShowAuthDialog(false);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {isRTL ? "الذهاب لصفحة إنشاء حساب" : "Go to Register Page"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {isRTL ? "ستعود تلقائياً إلى صفحة الطلب بعد تسجيل الدخول" : "You'll automatically return to checkout after signing in"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}