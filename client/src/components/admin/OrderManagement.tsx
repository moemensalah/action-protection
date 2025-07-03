import { useState } from "react";
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
import { Trash2, Edit, Eye, Package, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import type { Order, OrderItem, WebsiteUser } from "@shared/schema";

interface OrderWithDetails extends Order {
  websiteUser: WebsiteUser;
  items: OrderItem[];
}

export default function OrderManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithDetails | null>(null);

  // Fetch orders with details
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  // Get order statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/orders/stats"],
  });

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
        title: t("orders.updateSuccess"),
        variant: "default",
      });
      setEditingOrder(null);
    },
    onError: () => {
      toast({
        title: t("orders.updateError"),
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
        title: t("orders.deleteSuccess"),
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: t("orders.deleteError"),
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders?.filter((order: OrderWithDetails) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.websiteUser?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleUpdateOrderStatus = (order: OrderWithDetails, newStatus: string) => {
    updateOrderMutation.mutate({
      id: order.id,
      updates: { status: newStatus as any }
    });
  };

  const handleDeleteOrder = (order: OrderWithDetails) => {
    if (confirm(t("orders.deleteOrder"))) {
      deleteOrderMutation.mutate(order.id);
    }
  };

  const handleUpdateOrder = (order: OrderWithDetails, updates: Partial<Order>) => {
    updateOrderMutation.mutate({
      id: order.id,
      updates
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-KW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'preparing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <div className="p-6">{t("loading")}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h2 className={`text-3xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("orders.management")}
          </h2>
          <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("orders.title")}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("orders.totalOrders")}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("orders.pendingOrders")}</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("orders.completedOrders")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("orders.revenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue} {isRTL ? "د.ك" : "KWD"}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className={`flex gap-4 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Input
          placeholder={t("orders.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`max-w-sm ${isRTL ? 'text-right' : 'text-left'}`}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("orders.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("orders.allOrders")}</SelectItem>
            <SelectItem value="pending">{t("orders.pending")}</SelectItem>
            <SelectItem value="confirmed">{t("orders.confirmed")}</SelectItem>
            <SelectItem value="preparing">{t("orders.preparing")}</SelectItem>
            <SelectItem value="ready">{t("orders.ready")}</SelectItem>
            <SelectItem value="delivered">{t("orders.delivered")}</SelectItem>
            <SelectItem value="cancelled">{t("orders.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
            {t("orders.title")} ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className={`text-center py-8 text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t("orders.noOrders")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("orders.orderDetails")}</th>
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("orders.customerInfo")}</th>
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("orders.paymentInfo")}</th>
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>Status</th>
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: OrderWithDetails) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">#{order.orderNumber}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="text-sm font-medium">
                            {order.totalAmount} {isRTL ? "د.ك" : "KWD"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.items.length} {t("orders.orderItems")}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {order.customerPhone}
                          </div>
                          {order.customerEmail && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {order.customerEmail}
                            </div>
                          )}
                          {order.websiteUser && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              User: {order.websiteUser.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                            {order.paymentStatus}
                          </Badge>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {order.paymentMethod}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {t(`orders.${order.status}`)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t("orders.pending")}</SelectItem>
                            <SelectItem value="confirmed">{t("orders.confirmed")}</SelectItem>
                            <SelectItem value="preparing">{t("orders.preparing")}</SelectItem>
                            <SelectItem value="ready">{t("orders.ready")}</SelectItem>
                            <SelectItem value="delivered">{t("orders.delivered")}</SelectItem>
                            <SelectItem value="cancelled">{t("orders.cancelled")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                                {t("orders.viewOrder")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                                  {t("orders.orderDetails")} - #{selectedOrder?.orderNumber}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Customer Information */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">{t("orders.customerInfo")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div><strong>{t("name")}:</strong> {selectedOrder.customerName}</div>
                                      <div><strong>{t("phone")}:</strong> {selectedOrder.customerPhone}</div>
                                      {selectedOrder.customerEmail && (
                                        <div><strong>{t("email")}:</strong> {selectedOrder.customerEmail}</div>
                                      )}
                                      <div><strong>{t("address")}:</strong> {selectedOrder.deliveryAddress}</div>
                                    </CardContent>
                                  </Card>

                                  {/* Payment Information */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">{t("orders.paymentInfo")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div><strong>{t("paymentMethod")}:</strong> {selectedOrder.paymentMethod}</div>
                                      <div><strong>{t("paymentStatus")}:</strong> 
                                        <Badge className={`ml-2 ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                                          {selectedOrder.paymentStatus}
                                        </Badge>
                                      </div>
                                      <div><strong>{t("total")}:</strong> {selectedOrder.totalAmount} {isRTL ? "د.ك" : "KWD"}</div>
                                    </CardContent>
                                  </Card>

                                  {/* Order Items */}
                                  <Card className="md:col-span-2">
                                    <CardHeader>
                                      <CardTitle className="text-lg">{t("orders.orderItems")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2">
                                        {selectedOrder.items.map((item, index) => (
                                          <div key={index} className={`flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            <div>
                                              <div className="font-medium">{item.productName}</div>
                                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.quantity} × {item.productPrice} {isRTL ? "د.ك" : "KWD"}
                                              </div>
                                            </div>
                                            <div className="font-medium">
                                              {item.subtotal} {isRTL ? "د.ك" : "KWD"}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Order Notes */}
                                  {selectedOrder.notes && (
                                    <Card className="md:col-span-2">
                                      <CardHeader>
                                        <CardTitle className="text-lg">{t("orders.orderNotes")}</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <p className="text-gray-700 dark:text-gray-300">{selectedOrder.notes}</p>
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingOrder(order)}
                              >
                                <Edit className="h-4 w-4" />
                                {t("orders.editOrder")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                                  {t("orders.editOrder")} - #{editingOrder?.orderNumber}
                                </DialogTitle>
                              </DialogHeader>
                              {editingOrder && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>{t("orders.updateStatus")}</Label>
                                      <Select
                                        value={editingOrder.status}
                                        onValueChange={(value) => 
                                          setEditingOrder({...editingOrder, status: value as any})
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">{t("orders.pending")}</SelectItem>
                                          <SelectItem value="confirmed">{t("orders.confirmed")}</SelectItem>
                                          <SelectItem value="preparing">{t("orders.preparing")}</SelectItem>
                                          <SelectItem value="ready">{t("orders.ready")}</SelectItem>
                                          <SelectItem value="delivered">{t("orders.delivered")}</SelectItem>
                                          <SelectItem value="cancelled">{t("orders.cancelled")}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>{t("paymentStatus")}</Label>
                                      <Select
                                        value={editingOrder.paymentStatus}
                                        onValueChange={(value) => 
                                          setEditingOrder({...editingOrder, paymentStatus: value as any})
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="paid">Paid</SelectItem>
                                          <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>{t("orders.orderNotes")}</Label>
                                    <Textarea
                                      value={editingOrder.notes || ""}
                                      onChange={(e) => 
                                        setEditingOrder({...editingOrder, notes: e.target.value})
                                      }
                                      className={isRTL ? 'text-right' : 'text-left'}
                                    />
                                  </div>
                                  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Button
                                      onClick={() => handleUpdateOrder(editingOrder, {
                                        status: editingOrder.status,
                                        paymentStatus: editingOrder.paymentStatus,
                                        notes: editingOrder.notes
                                      })}
                                    >
                                      {t("save")}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDeleteOrder(editingOrder)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t("orders.deleteOrder")}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}