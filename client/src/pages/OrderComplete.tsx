import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Check, Package, Home, ShoppingBag, User, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface OrderDetails {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  totalAmount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    id: number;
    productName: string;
    productPrice: string;
    quantity: number;
    subtotal: string;
  }>;
}

export default function OrderComplete() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [orderNumber, setOrderNumber] = useState<string>("");

  // Get order number from URL or local storage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNum = urlParams.get('order') || localStorage.getItem('lastOrderNumber') || "";
    setOrderNumber(orderNum);
    
    // Clear the order number from localStorage after displaying
    if (orderNum) {
      localStorage.removeItem('lastOrderNumber');
    }
  }, []);

  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ["/api/orders", orderNumber],
    enabled: !!orderNumber,
  });

  if (!orderNumber) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={`${isRTL ? "تم إتمام الطلب" : "Order Complete"} | Action Protection`}
        description={`Order ${orderNumber} has been successfully placed`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <Card className="text-center mb-8">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-3xl text-green-600 dark:text-green-400 mb-2">
                {isRTL ? "تم إتمام طلبك بنجاح!" : "Order Completed Successfully!"}
              </CardTitle>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {isRTL ? "رقم الطلب:" : "Order #"} {orderNumber}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isRTL 
                  ? "شكراً لك على طلبك من Action Protection. سنتواصل معك قريباً لتأكيد التفاصيل وترتيب موعد الخدمة."
                  : "Thank you for your order with Action Protection. We'll contact you soon to confirm details and schedule your service."
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Package className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                    {isRTL ? "تأكيد الطلب" : "Order Confirmation"}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {isRTL ? "خلال 30 دقيقة" : "Within 30 minutes"}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    {isRTL ? "جدولة الخدمة" : "Service Scheduling"}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {isRTL ? "خلال 24 ساعة" : "Within 24 hours"}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    {isRTL ? "إنجاز الخدمة" : "Service Completion"}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {isRTL ? "حسب الموعد المحدد" : "As scheduled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          {orderDetails && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{isRTL ? "تفاصيل الطلب" : "Order Details"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">
                    {isRTL ? "الخدمات المطلوبة" : "Requested Services"}
                  </h3>
                  <div className="space-y-3">
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.productPrice} {t("kwd")} x {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {item.subtotal} {t("kwd")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{isRTL ? "المبلغ الإجمالي:" : "Total Amount:"}</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {orderDetails.totalAmount} {t("kwd")}
                  </span>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {isRTL ? "معلومات الاتصال" : "Contact Information"}
                    </h4>
                    <p>{isRTL ? "الاسم:" : "Name:"} {orderDetails.customerName}</p>
                    <p>{isRTL ? "الهاتف:" : "Phone:"} {orderDetails.customerPhone}</p>
                    {orderDetails.customerEmail && (
                      <p>{isRTL ? "البريد الإلكتروني:" : "Email:"} {orderDetails.customerEmail}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      {isRTL ? "عنوان الخدمة" : "Service Address"}
                    </h4>
                    <p>{orderDetails.deliveryAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {user ? (
              <Link href="/my-orders">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">
                  {isRTL ? "عرض جميع طلباتي" : "View All My Orders"}
                  <ArrowRight className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">
                  {isRTL ? "إنشاء حساب لتتبع طلباتك" : "Create Account to Track Orders"}
                  <User className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
                </Button>
              </Link>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {isRTL ? "الصفحة الرئيسية" : "Home"}
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" className="w-full">
                  <ShoppingBag className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  {isRTL ? "متابعة التسوق" : "Continue Shopping"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="text-center py-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                {isRTL ? "بحاجة للمساعدة؟" : "Need Help?"}
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                {isRTL 
                  ? "فريق خدمة العملاء متاح لمساعدتك في أي وقت"
                  : "Our customer service team is available to help you anytime"
                }
              </p>
              <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                <p>{isRTL ? "الهاتف:" : "Phone:"} +965 2245 0123</p>
                <p>{isRTL ? "واتساب:" : "WhatsApp:"} +965 9988 7766</p>
                <p>{isRTL ? "البريد الإلكتروني:" : "Email:"} info@actionprotection.kw</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}