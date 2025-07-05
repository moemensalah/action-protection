import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Eye, Package, DollarSign, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import type { Order, OrderItem, WebsiteUser } from "@shared/schema";

interface OrderWithDetails extends Order {
  websiteUser: WebsiteUser;
  items: OrderItem[];
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: string;
}

export default function OrderManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithDetails | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Fetch orders with details
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  // Get order statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery<OrderStats>({
    queryKey: ["/api/admin/orders/stats"],
  });

  // Fetch website users for filtering
  const { data: websiteUsers = [] } = useQuery<WebsiteUser[]>({
    queryKey: ["/api/admin/website-users"],
  });

  // Filter and paginate orders
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    
    return (orders as OrderWithDetails[]).filter((order: OrderWithDetails) => {
      const matchesSearch = 
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.websiteUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.websiteUser?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.websiteUser?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesUser = userFilter === "all" || order.websiteUserId?.toString() === userFilter;
      
      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [orders, searchTerm, statusFilter, userFilter]);

  // Reset page when filters change
  const resetPageOnFilterChange = () => {
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Order> }) => {
      return await apiRequest(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/stats"] });
      toast({
        title: isRTL ? "تم تحديث الطلب بنجاح" : "Order updated successfully",
        variant: "default",
      });
      setEditingOrder(null);
    },
    onError: () => {
      toast({
        title: isRTL ? "فشل في تحديث الطلب" : "Failed to update order",
        variant: "destructive",
      });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/orders/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders/stats"] });
      toast({
        title: isRTL ? "تم حذف الطلب بنجاح" : "Order deleted successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "فشل في حذف الطلب" : "Failed to delete order",
        variant: "destructive",
      });
    },
  });

  const handleUpdateOrderStatus = (order: OrderWithDetails, newStatus: string) => {
    updateOrderMutation.mutate({
      id: order.id,
      updates: { status: newStatus as any }
    });
  };

  const handleDeleteOrder = (order: OrderWithDetails) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذا الطلب؟" : "Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(order.id);
    }
  };

  const handleUpdateOrder = (order: OrderWithDetails, updates: Partial<Order>) => {
    updateOrderMutation.mutate({
      id: order.id,
      updates
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "ready": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { en: string; ar: string }> = {
      pending: { en: "Pending", ar: "في الانتظار" },
      confirmed: { en: "Confirmed", ar: "مؤكد" },
      preparing: { en: "Preparing", ar: "قيد التحضير" },
      ready: { en: "Ready", ar: "جاهز" },
      delivered: { en: "Delivered", ar: "تم التسليم" },
      cancelled: { en: "Cancelled", ar: "ملغي" }
    };
    return isRTL ? statusMap[status]?.ar || status : statusMap[status]?.en || status;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        {/* In RTL: Title on right, total orders on left */}
        <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? "إدارة الطلبات" : "Order Management"}
        </h1>
        <div className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? 
            `إجمالي الطلبات: ${filteredOrders.length}` : 
            `Total Orders: ${filteredOrders.length}`
          }
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? "إجمالي الطلبات" : "Total Orders"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? "الطلبات المعلقة" : "Pending Orders"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.pendingOrders || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? "الطلبات المكتملة" : "Completed Orders"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.completedOrders || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? "إجمالي الإيرادات" : "Total Revenue"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isRTL ? `${stats?.totalRevenue || 0} ${t("kwd")}` : `${t("kwd")} ${stats?.totalRevenue || 0}`}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={isRTL ? "البحث في الطلبات..." : "Search orders..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPageOnFilterChange();
            }}
            className="w-full"
          />
        </div>
        
        <Select 
          value={statusFilter} 
          onValueChange={(value) => {
            setStatusFilter(value);
            resetPageOnFilterChange();
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={isRTL ? "فلترة بالحالة" : "Filter by Status"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? "كل الحالات" : "All Status"}</SelectItem>
            <SelectItem value="pending">{getStatusText("pending")}</SelectItem>
            <SelectItem value="confirmed">{getStatusText("confirmed")}</SelectItem>
            <SelectItem value="preparing">{getStatusText("preparing")}</SelectItem>
            <SelectItem value="ready">{getStatusText("ready")}</SelectItem>
            <SelectItem value="delivered">{getStatusText("delivered")}</SelectItem>
            <SelectItem value="cancelled">{getStatusText("cancelled")}</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={userFilter} 
          onValueChange={(value) => {
            setUserFilter(value);
            resetPageOnFilterChange();
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={isRTL ? "فلترة بالمستخدم" : "Filter by User"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? "كل المستخدمين" : "All Users"}</SelectItem>
            {websiteUsers.map((user: WebsiteUser) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.firstName} {user.lastName} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {currentOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isRTL ? "لا توجد طلبات" : "No Orders Found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL ? "لا توجد طلبات تطابق معايير البحث" : "No orders match your search criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentOrders.map((order: OrderWithDetails) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {/* RTL: Order info on the right / LTR: Order info on the left */}
                  <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h3 className="font-semibold text-lg mb-2">
                      {isRTL ? `${order.orderNumber}# طلب رقم` : `Order #${order.orderNumber}`}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {order.websiteUser ? `${order.websiteUser.firstName} ${order.websiteUser.lastName}` : 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown Date'}
                    </p>
                  </div>

                  {/* RTL: Status, price, items on the left / LTR: Status, price, items on the right */}
                  <div className={`flex-1 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                      <Badge className={getStatusColor(order.status || 'pending')}>
                        {getStatusText(order.status || 'pending')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {isRTL ? "المبلغ الاجمالى:" : "Total:"} 
                      <span className={`font-semibold text-amber-600 dark:text-amber-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                        {isRTL ? `${Number(order.totalAmount) || 0} د.ك` : `KWD ${Number(order.totalAmount) || 0}`}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isRTL ? "عدد المنتجات:" : "Items:"} {order.items?.length || 0}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center mt-4 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    >
                      <Eye className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? "عرض التفاصيل" : "View Details"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingOrder(order)}
                    >
                      <Edit className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? "تحرير" : "Edit"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteOrder(order)}
                    >
                      <Trash2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? "حذف" : "Delete"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && totalPages > 1 && (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isRTL ? (
              `إظهار ${startIndex + 1}-${Math.min(endIndex, filteredOrders.length)} من ${filteredOrders.length} طلبات`
            ) : (
              `Showing ${startIndex + 1}-${Math.min(endIndex, filteredOrders.length)} of ${filteredOrders.length} orders`
            )}
          </div>

          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-8 h-8 p-0"
            >
              {isRTL ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span className="hidden sm:inline">{isRTL ? "السابق" : "Previous"}</span>
            </Button>

            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              <span className="hidden sm:inline">{isRTL ? "التالي" : "Next"}</span>
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 p-0"
            >
              {isRTL ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "تفاصيل الطلب" : "Order Details"} #{selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? "عرض تفاصيل الطلب الكاملة" : "Complete order information and details"}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{isRTL ? "معلومات العميل" : "Customer Information"}</h4>
                  <p><strong>{isRTL ? "الاسم:" : "Name:"}</strong> {selectedOrder.websiteUser?.firstName} {selectedOrder.websiteUser?.lastName}</p>
                  <p><strong>{isRTL ? "البريد الإلكتروني:" : "Email:"}</strong> {selectedOrder.websiteUser?.email}</p>
                  <p><strong>{isRTL ? "رقم الطلب:" : "Order Number:"}</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>{isRTL ? "التاريخ:" : "Date:"}</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{isRTL ? "معلومات الطلب" : "Order Information"}</h4>
                  <p><strong>{isRTL ? "الحالة:" : "Status:"}</strong> {getStatusText(selectedOrder.status || 'pending')}</p>
                  <p><strong>{isRTL ? "المبلغ الإجمالي:" : "Total Amount:"}</strong> {isRTL ? `${Number(selectedOrder.totalAmount) || 0} د.ك` : `KWD ${Number(selectedOrder.totalAmount) || 0}`}</p>
                  <p><strong>{isRTL ? "طريقة الدفع:" : "Payment Method:"}</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
                  <p><strong>{isRTL ? "حالة الدفع:" : "Payment Status:"}</strong> {selectedOrder.paymentStatus || 'pending'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{isRTL ? "المنتجات" : "Items"}</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: OrderItem, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span>{item.productName}</span>
                      <span>{item.quantity} × {isRTL ? `${Number(item.productPrice) || 0} د.ك` : `KWD ${Number(item.productPrice) || 0}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "تحرير الطلب" : "Edit Order"} #{editingOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? "تحديث معلومات الطلب" : "Update order information"}
            </DialogDescription>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">{isRTL ? "الحالة" : "Status"}</Label>
                <Select 
                  value={editingOrder.status || 'pending'} 
                  onValueChange={(value) => setEditingOrder({ ...editingOrder, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{getStatusText("pending")}</SelectItem>
                    <SelectItem value="confirmed">{getStatusText("confirmed")}</SelectItem>
                    <SelectItem value="preparing">{getStatusText("preparing")}</SelectItem>
                    <SelectItem value="ready">{getStatusText("ready")}</SelectItem>
                    <SelectItem value="delivered">{getStatusText("delivered")}</SelectItem>
                    <SelectItem value="cancelled">{getStatusText("cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="paymentStatus">{isRTL ? "حالة الدفع" : "Payment Status"}</Label>
                <Select 
                  value={editingOrder.paymentStatus || 'pending'} 
                  onValueChange={(value) => setEditingOrder({ ...editingOrder, paymentStatus: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{isRTL ? "في الانتظار" : "Pending"}</SelectItem>
                    <SelectItem value="paid">{isRTL ? "مدفوع" : "Paid"}</SelectItem>
                    <SelectItem value="failed">{isRTL ? "فشل" : "Failed"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">{isRTL ? "ملاحظات" : "Notes"}</Label>
                <Textarea
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  placeholder={isRTL ? "أدخل ملاحظات إضافية..." : "Enter additional notes..."}
                />
              </div>

              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button 
                  onClick={() => handleUpdateOrder(editingOrder, {
                    status: editingOrder.status,
                    paymentStatus: editingOrder.paymentStatus,
                    notes: editingOrder.notes
                  })}
                  disabled={updateOrderMutation.isPending}
                >
                  {isRTL ? "حفظ التغييرات" : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditingOrder(null)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}