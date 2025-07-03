import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Eye, UserX, UserCheck, Calendar, Mail, Phone, ShoppingCart, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import type { WebsiteUser, Order } from "@shared/schema";

interface WebsiteUserWithStats extends WebsiteUser {
  totalOrders: number;
  totalSpent: string;
}

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

  // Fetch website users with statistics
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/website-users"],
  });

  // Get user statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/website-users/stats"],
  });

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
        title: t("users.updateSuccess"),
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: t("users.updateError"),
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
        title: t("users.deleteSuccess"),
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: t("users.deleteError"),
        variant: "destructive",
      });
    },
  });

  // Get user orders
  const fetchUserOrders = async (userId: number) => {
    try {
      const response = await apiRequest(`/api/admin/website-users/${userId}/orders`);
      setUserOrders(response);
      setShowUserOrders(true);
    } catch (error) {
      toast({
        title: t("orders.updateError"),
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users?.filter((user: WebsiteUserWithStats) => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesStatus;
  }) || [];

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
    if (confirm(t("users.deleteUser"))) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString(isRTL ? 'ar-KW' : 'en-US');
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
            {t("users.management")}
          </h2>
          <p className={`text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t("users.title")}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("users.totalUsers")}</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("users.activeUsers")}</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("users.newUsers")}</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("orders.revenue")}</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
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
          placeholder={t("users.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`max-w-sm ${isRTL ? 'text-right' : 'text-left'}`}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("users.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("users.allUsers")}</SelectItem>
            <SelectItem value="active">{t("users.activeOnly")}</SelectItem>
            <SelectItem value="inactive">{t("users.inactiveOnly")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
            {t("users.title")} ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className={`text-center py-8 text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t("users.noUsers")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("users.personalInfo")}</th>
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("users.accountInfo")}</th>
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("users.orderHistory")}</th>
                    <th className={`text-left p-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: WebsiteUserWithStats) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? t("active") : t("inactive")}
                          </Badge>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {t("users.registrationDate")}: {formatDate(user.createdAt)}
                          </div>
                          {user.lastLogin && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {t("users.lastLogin")}: {formatDate(user.lastLogin)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            <span className="text-sm">{user.totalOrders} {t("users.totalOrders")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-sm">{user.totalSpent} {isRTL ? "د.ك" : "KWD"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchUserOrders(user.id)}
                          >
                            <Eye className="h-4 w-4" />
                            {t("users.viewOrders")}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                                {t("users.editUser")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                                  {t("users.userDetails")}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t("firstName")}
                                      </label>
                                      <Input value={selectedUser.firstName} readOnly />
                                    </div>
                                    <div>
                                      <label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t("lastName")}
                                      </label>
                                      <Input value={selectedUser.lastName} readOnly />
                                    </div>
                                  </div>
                                  <div>
                                    <label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                      {t("email")}
                                    </label>
                                    <Input value={selectedUser.email} readOnly />
                                  </div>
                                  {selectedUser.phone && (
                                    <div>
                                      <label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t("phone")}
                                      </label>
                                      <Input value={selectedUser.phone} readOnly />
                                    </div>
                                  )}
                                  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    {selectedUser.isActive ? (
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleDeactivateUser(selectedUser)}
                                      >
                                        <UserX className="h-4 w-4 mr-2" />
                                        {t("users.deactivateUser")}
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="default"
                                        onClick={() => handleActivateUser(selectedUser)}
                                      >
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        {t("users.activateUser")}
                                      </Button>
                                    )}
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDeleteUser(selectedUser)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t("users.deleteUser")}
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

      {/* User Orders Dialog */}
      <Dialog open={showUserOrders} onOpenChange={setShowUserOrders}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
              {t("users.orderHistory")}
            </DialogTitle>
            <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
              {selectedUser && `${selectedUser.firstName} ${selectedUser.lastName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {userOrders.length === 0 ? (
              <div className={`text-center py-8 text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t("orders.noOrders")}
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                          <div className="font-medium">#{order.orderNumber}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className={`text-right ${isRTL ? 'text-left' : 'text-right'}`}>
                          <Badge variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'cancelled' ? 'destructive' :
                            'secondary'
                          }>
                            {t(`orders.${order.status}`)}
                          </Badge>
                          <div className="text-sm font-medium">
                            {order.totalAmount} {isRTL ? "د.ك" : "KWD"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}