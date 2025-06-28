import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Package, Clock, CheckCircle, Truck, X, Eye, ArrowLeft, LogOut } from "lucide-react";
import { Link } from "wouter";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  totalAmount: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: number;
    productName: string;
    productPrice: string;
    quantity: number;
    subtotal: string;
  }>;
}

export default function MyOrders() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/my-orders"],
    enabled: !!user,
  }) as { data: Order[], isLoading: boolean };

  // Redirect if not logged in - moved after all hooks
  if (!authLoading && !user) {
    setLocation("/login");
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "preparing":
        return <Package className="w-4 h-4" />;
      case "ready":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "preparing":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "ready":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: isRTL ? "في الانتظار" : "Pending",
      confirmed: isRTL ? "مؤكد" : "Confirmed",
      preparing: isRTL ? "قيد التحضير" : "Preparing",
      ready: isRTL ? "جاهز للاستلام" : "Ready",
      delivered: isRTL ? "تم التسليم" : "Delivered",
      cancelled: isRTL ? "ملغى" : "Cancelled",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/local/logout", { method: "POST" });
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
        <SEO 
          title={`${isRTL ? "تفاصيل الطلب" : "Order Details"} #${selectedOrder.orderNumber} | Action Protection`}
          description={`Order details for ${selectedOrder.orderNumber}`}
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setSelectedOrder(null)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 rtl:rotate-180" />
              {isRTL ? "العودة إلى طلباتي" : "Back to My Orders"}
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {isRTL ? "تفاصيل الطلب" : "Order Details"}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? "رقم الطلب:" : "Order #"} {selectedOrder.orderNumber}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1`}>
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    {isRTL ? "المنتجات المطلوبة" : "Ordered Items"}
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
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

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      {isRTL ? "معلومات العميل" : "Customer Information"}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">{isRTL ? "الاسم:" : "Name:"}</span> {selectedOrder.customerName}</p>
                      <p><span className="font-medium">{isRTL ? "الهاتف:" : "Phone:"}</span> {selectedOrder.customerPhone}</p>
                      {selectedOrder.customerEmail && (
                        <p><span className="font-medium">{isRTL ? "البريد الإلكتروني:" : "Email:"}</span> {selectedOrder.customerEmail}</p>
                      )}
                      <p><span className="font-medium">{isRTL ? "العنوان:" : "Address:"}</span> {selectedOrder.deliveryAddress}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      {isRTL ? "تفاصيل الدفع" : "Payment Details"}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">{isRTL ? "المبلغ الإجمالي:" : "Total Amount:"}</span> 
                        <span className="text-amber-600 dark:text-amber-400 font-semibold ml-2">
                          {selectedOrder.totalAmount} {t("kwd")}
                        </span>
                      </p>
                      <p><span className="font-medium">{isRTL ? "طريقة الدفع:" : "Payment Method:"}</span> 
                        {selectedOrder.paymentMethod === "cash" ? (isRTL ? "نقداً عند التسليم" : "Cash on Delivery") : selectedOrder.paymentMethod}
                      </p>
                      <p><span className="font-medium">{isRTL ? "حالة الدفع:" : "Payment Status:"}</span> 
                        <Badge variant={selectedOrder.paymentStatus === "paid" ? "default" : "secondary"} className="ml-2">
                          {selectedOrder.paymentStatus === "paid" ? (isRTL ? "مدفوع" : "Paid") : 
                           selectedOrder.paymentStatus === "pending" ? (isRTL ? "في الانتظار" : "Pending") : 
                           (isRTL ? "فشل" : "Failed")}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-lg mb-3">
                        {isRTL ? "ملاحظات" : "Notes"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedOrder.notes}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="text-sm text-gray-500">
                  <p>{isRTL ? "تاريخ الطلب:" : "Order Date:"} {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p>{isRTL ? "آخر تحديث:" : "Last Updated:"} {new Date(selectedOrder.updatedAt).toLocaleDateString()}</p>
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
        title={`${isRTL ? "طلباتي" : "My Orders"} | Action Protection`}
        description="Track your Action Protection service orders and view order history"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isRTL ? "طلباتي" : "My Orders"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isRTL ? "تتبع طلباتك وعرض تاريخ الطلبات" : "Track your orders and view order history"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline">
                  {isRTL ? "الصفحة الرئيسية" : "Home"}
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {isRTL ? "تسجيل الخروج" : "Logout"}
              </Button>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {isRTL ? "لا توجد طلبات" : "No Orders Yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isRTL ? "لم تقم بأي طلبات حتى الآن. ابدأ التسوق الآن!" : "You haven't placed any orders yet. Start shopping now!"}
                </p>
                <Link href="/menu">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    {isRTL ? "تصفح المنتجات" : "Browse Products"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order: Order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {isRTL ? "طلب رقم" : "Order"} #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? "المبلغ الإجمالي:" : "Total:"} 
                          <span className="font-semibold text-amber-600 dark:text-amber-400 ml-1">
                            {order.totalAmount} {t("kwd")}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isRTL ? "عدد المنتجات:" : "Items:"} {order.items.length}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {isRTL ? "عرض التفاصيل" : "View Details"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}