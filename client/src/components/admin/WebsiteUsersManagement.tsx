import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Eye, UserX, UserCheck, Calendar, Mail, Phone, ShoppingCart, DollarSign, Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import type { WebsiteUser, Order } from "@shared/schema";

interface WebsiteUserWithStats extends WebsiteUser {
  totalOrders: number;
  totalSpent: string;
}

// Helper function to format dates
const formatDate = (date: string | Date | null) => {
  if (!date) return "N/A";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

export default function WebsiteUsersManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<WebsiteUserWithStats | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showUserOrders, setShowUserOrders] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch website users with statistics
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/website-users"],
  });

  // Get user statistics
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/admin/website-users/stats"],
  });

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter((user: WebsiteUserWithStats) => {
      const matchesSearch = 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  // Reset page when filters change
  const resetPageOnFilterChange = () => {
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<WebsiteUser> }) => {
      return await apiRequest(`/api/admin/website-users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/website-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/website-users/stats"] });
      toast({
        title: isRTL ? "تم تحديث المستخدم بنجاح" : "User updated successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "فشل في تحديث المستخدم" : "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/website-users/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/website-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/website-users/stats"] });
      toast({
        title: isRTL ? "تم حذف المستخدم بنجاح" : "User deleted successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: isRTL ? "فشل في حذف المستخدم" : "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Fetch user orders
  const fetchUserOrders = async (userId: number) => {
    try {
      const response = await apiRequest(`/api/admin/website-users/${userId}/orders`);
      const orders = Array.isArray(response) ? response : [];
      setUserOrders(orders);
      setShowUserOrders(true);
    } catch (error) {
      setUserOrders([]);
      toast({
        title: isRTL ? "فشل في جلب طلبات المستخدم" : "Failed to fetch user orders",
        variant: "destructive",
      });
    }
  };

  const handleActivateUser = (user: WebsiteUserWithStats) => {
    updateUserMutation.mutate({
      id: user.id,
      updates: { isActive: true }
    });
  };

  const handleDeactivateUser = (user: WebsiteUserWithStats) => {
    updateUserMutation.mutate({
      id: user.id,
      updates: { isActive: false }
    });
  };

  const handleDeleteUser = (user: WebsiteUserWithStats) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isRTL ? "إدارة مستخدمي الموقع" : "Website Users Management"}
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isRTL ? 
            `إجمالي المستخدمين: ${filteredUsers.length}` : 
            `Total Users: ${filteredUsers.length}`
          }
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? "إجمالي المستخدمين" : "Total Users"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats as any).totalUsers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? "المستخدمون النشطون" : "Active Users"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats as any).activeUsers || 0}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? "المستخدمون الجدد هذا الشهر" : "New Users This Month"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats as any).newUsersThisMonth || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={isRTL ? "البحث في المستخدمين..." : "Search users..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPageOnFilterChange();
            }}
            className="w-full"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          resetPageOnFilterChange();
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={isRTL ? "فلترة بالحالة" : "Filter by Status"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? "كل المستخدمين" : "All Users"}</SelectItem>
            <SelectItem value="active">{isRTL ? "نشط فقط" : "Active Only"}</SelectItem>
            <SelectItem value="inactive">{isRTL ? "غير نشط فقط" : "Inactive Only"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {currentUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isRTL ? "لا يوجد مستخدمون" : "No Users Found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL ? "لا يوجد مستخدمون يطابقون معايير البحث" : "No users match your search criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentUsers.map((user: WebsiteUserWithStats) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-semibold text-lg">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isRTL ? "تاريخ التسجيل:" : "Registered:"} {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                    </Badge>
                  </div>
                </div>

                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isRTL ? "إجمالي الطلبات:" : "Total Orders:"} 
                      <span className="font-semibold text-blue-600 dark:text-blue-400 ml-1">
                        {user.totalOrders || 0}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isRTL ? "إجمالي المبلغ المنفق:" : "Total Spent:"} 
                      <span className="font-semibold text-amber-600 dark:text-amber-400 ml-1">
                        {user.totalSpent || "0"} {t("kwd")}
                      </span>
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}
                    >
                      <Eye className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? "عرض التفاصيل" : "View Details"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchUserOrders(user.id)}
                    >
                      <ShoppingCart className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? "عرض الطلبات" : "View Orders"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => user.isActive ? handleDeactivateUser(user) : handleActivateUser(user)}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? "إلغاء التفعيل" : "Deactivate"}
                        </>
                      ) : (
                        <>
                          <UserCheck className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? "تفعيل" : "Activate"}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
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
      {filteredUsers.length > 0 && totalPages > 1 && (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isRTL ? (
              `إظهار ${startIndex + 1}-${Math.min(endIndex, filteredUsers.length)} من ${filteredUsers.length} مستخدمين`
            ) : (
              `Showing ${startIndex + 1}-${Math.min(endIndex, filteredUsers.length)} of ${filteredUsers.length} users`
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

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "تفاصيل المستخدم" : "User Details"}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? "عرض معلومات المستخدم الكاملة" : "Complete user information and statistics"}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{isRTL ? "المعلومات الشخصية" : "Personal Information"}</h4>
                  <p><strong>{isRTL ? "الاسم الأول:" : "First Name:"}</strong> {selectedUser.firstName}</p>
                  <p><strong>{isRTL ? "الاسم الأخير:" : "Last Name:"}</strong> {selectedUser.lastName}</p>
                  <p><strong>{isRTL ? "البريد الإلكتروني:" : "Email:"}</strong> {selectedUser.email}</p>
                  <p><strong>{isRTL ? "رقم الهاتف:" : "Phone:"}</strong> {selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{isRTL ? "معلومات الحساب" : "Account Information"}</h4>
                  <p><strong>{isRTL ? "الحالة:" : "Status:"}</strong> {selectedUser.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}</p>
                  <p><strong>{isRTL ? "تاريخ التسجيل:" : "Registration Date:"}</strong> {formatDate(selectedUser.createdAt)}</p>
                  <p><strong>{isRTL ? "إجمالي الطلبات:" : "Total Orders:"}</strong> {selectedUser.totalOrders || 0}</p>
                  <p><strong>{isRTL ? "إجمالي المبلغ المنفق:" : "Total Spent:"}</strong> {selectedUser.totalSpent || "0"} {t("kwd")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Orders Dialog */}
      <Dialog open={showUserOrders} onOpenChange={setShowUserOrders}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "طلبات المستخدم" : "User Orders"}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? "عرض جميع طلبات المستخدم" : "View all orders for this user"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {userOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {isRTL ? "لا توجد طلبات لهذا المستخدم" : "No orders found for this user"}
              </p>
            ) : (
              <div className="space-y-2">
                {userOrders.map((order: Order) => (
                  <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <span className="font-medium">#{order.orderNumber}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{order.totalAmount} {t("kwd")}</span>
                      <Badge className="ml-2" variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}