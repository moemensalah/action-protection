import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Shield, UserPlus, Edit, Crown, Key, Trash2, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  role: "administrator" | "moderator";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "administrator" | "moderator";
  isActive: boolean;
}

export function UsersManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserForm>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "moderator",
    isActive: true
  });

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "administrator" | "moderator">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users from API
  const { data: users = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user: User) => {
      // Search filter
      const searchMatch = !searchTerm || 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const roleMatch = roleFilter === "all" || user.role === roleFilter;

      // Status filter
      const statusMatch = statusFilter === "all" || 
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return searchMatch && roleMatch && statusMatch;
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Statistics
  const adminCount = users.filter(user => user.role === "administrator").length;
  const moderatorCount = users.filter(user => user.role === "moderator").length;
  const activeCount = users.filter(user => user.isActive).length;

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserForm) => {
      return apiRequest('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: isRTL ? "تم إنشاء المستخدم" : "User Created",
        description: isRTL ? "تم إنشاء المستخدم بنجاح" : "User created successfully",
      });
      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في إنشاء المستخدم" : "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: UserForm }) => {
      // Remove password from update if it's empty (keep current password)
      const updateData: any = { ...userData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      return apiRequest(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: isRTL ? "تم تحديث المستخدم" : "User Updated",
        description: isRTL ? "تم تحديث المستخدم بنجاح" : "User updated successfully",
      });
      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في تحديث المستخدم" : "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: isRTL ? "تم حذف المستخدم" : "User Deleted",
        description: isRTL ? "تم حذف المستخدم بنجاح" : "User deleted successfully",
      });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في حذف المستخدم" : "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const getRoleBadge = (role: string) => {
    if (role === "administrator") {
      return (
        <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <Crown className="h-3 w-3 mr-1" />
          {isRTL ? "مدير" : "Administrator"}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        <Shield className="h-3 w-3 mr-1" />
        {isRTL ? "مشرف" : "Moderator"}
      </Badge>
    );
  };

  const getPermissions = (role: string) => {
    if (role === "administrator") {
      return isRTL 
        ? "جميع الصلاحيات - إدارة المستخدمين والمحتوى والمنتجات والفئات"
        : "Full access - Manage users, content, products, and categories";
    }
    return isRTL
      ? "صلاحيات محدودة - إدارة المنتجات والفئات فقط"
      : "Limited access - Manage products and categories only";
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "moderator",
      isActive: true
    });
    setEditingUser(null);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      password: "", // Don't prefill password for security
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role || "moderator",
      isActive: user.isActive || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const canDeleteUser = (user: User) => {
    // Cannot delete the main admin (first admin in the system)
    return user.id !== "admin_seed_1";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, userData: formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRTL ? "إجمالي المستخدمين" : "Total Users"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Crown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRTL ? "المديرين" : "Administrators"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRTL ? "المشرفين" : "Moderators"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{moderatorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isRTL ? "المستخدمين النشطين" : "Active Users"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* In RTL: Title on right, button on left */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <UserPlus className="h-4 w-4" />
              {isRTL ? "إضافة مستخدم" : "Add User"}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
              <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                {editingUser 
                  ? (isRTL ? "تعديل المستخدم" : "Edit User")
                  : (isRTL ? "إضافة مستخدم جديد" : "Add New User")
                }
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Username Field */}
              <div>
                <Label htmlFor="username" className={`block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "اسم المستخدم" : "Username"}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className={isRTL ? 'text-right [&:focus]:text-right' : 'text-left'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  placeholder={isRTL ? "أدخل اسم المستخدم" : "Enter username"}
                />
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className={`block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? "كلمة المرور" : "Password"}
                  {editingUser && (
                    <span className="text-sm text-gray-500 ml-1">
                      {isRTL ? "(اتركها فارغة للاحتفاظ بكلمة المرور الحالية)" : "(leave empty to keep current)"}
                    </span>
                  )}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!editingUser}
                  className={isRTL ? 'text-right [&:focus]:text-right' : 'text-left'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                  placeholder={isRTL ? "أدخل كلمة المرور" : "Enter password"}
                />
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
                <div className={isRTL ? 'md:order-2' : ''}>
                  <Label htmlFor="firstName" className={`block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "الاسم الأول" : "First Name"}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className={isRTL ? 'text-right [&:focus]:text-right' : 'text-left'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                
                <div className={isRTL ? 'md:order-1' : ''}>
                  <Label htmlFor="lastName" className={`block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "الاسم الأخير" : "Last Name"}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className={isRTL ? 'text-right [&:focus]:text-right' : 'text-left'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className={`block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className={isRTL ? 'text-right [&:focus]:text-right' : 'text-left'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              
              <div>
                <Label htmlFor="role" className={`block mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? "الدور" : "Role"}</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: "administrator" | "moderator") => 
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <SelectTrigger className={isRTL ? 'text-right [&>span]:text-right [&>svg]:order-first' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
                    <SelectValue placeholder={isRTL ? "اختر الدور" : "Select role"} />
                  </SelectTrigger>
                  <SelectContent className={isRTL ? '[&_*]:text-right' : ''} dir={isRTL ? 'rtl' : 'ltr'}>
                    <SelectItem value="moderator" className={isRTL ? 'text-right' : ''}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <Shield className="h-4 w-4" />
                        <span>{isRTL ? "مشرف" : "Moderator"}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="administrator" className={isRTL ? 'text-right' : ''}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <Crown className="h-4 w-4" />
                        <span>{isRTL ? "مدير" : "Administrator"}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className={`text-sm text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {getPermissions(formData.role)}
                </p>
              </div>
              
              <div className={`flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${isRTL ? 'flex-row-reverse justify-between' : 'justify-between'}`}>
                <div className={`flex flex-col ${isRTL ? 'items-end order-2' : 'items-start order-1'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <Label htmlFor="isActive" className={`font-medium ${isRTL ? 'text-right w-full' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    {isRTL ? "حالة المستخدم" : "User Status"}
                  </Label>
                  <p className={`text-sm text-gray-500 ${isRTL ? 'text-right w-full' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    {isRTL ? "تحديد ما إذا كان المستخدم نشطًا أم لا" : "Determine if the user account is active"}
                  </p>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'order-1' : 'order-2'}`}>
                  <span className={`text-sm ${formData.isActive ? 'text-green-600' : 'text-gray-500'} ${isRTL ? 'order-2' : 'order-1'}`}>
                    {formData.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                  </span>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    className={`${isRTL ? 'order-1 [&>span]:!justify-start' : 'order-2'}`}
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className={`flex gap-2 pt-4 ${isRTL ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {(createUserMutation.isPending || updateUserMutation.isPending) ? (
                    isRTL ? "جاري الحفظ..." : "Saving..."
                  ) : (
                    editingUser ? (isRTL ? "تحديث" : "Update") : (isRTL ? "إضافة" : "Add")
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isRTL ? "إدارة المستخدمين" : "Users Management"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? "إدارة المديرين والمشرفين والصلاحيات" : "Manage administrators, moderators, and permissions"}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className={`flex flex-col gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {/* Search */}
            <div className="relative">
              <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={isRTL ? "البحث عن المستخدمين..." : "Search users..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-10 text-right' : 'pl-10 text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Filters */}
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <Label className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? "تصفية حسب الدور:" : "Filter by Role:"}
                </Label>
                <Select value={roleFilter} onValueChange={(value: "all" | "administrator" | "moderator") => setRoleFilter(value)}>
                  <SelectTrigger className={isRTL ? 'text-right [&>span]:text-right [&>svg]:order-first' : 'text-left'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isRTL ? '[&_*]:text-right' : ''}>
                    <SelectItem value="all">{isRTL ? "جميع الأدوار" : "All Roles"}</SelectItem>
                    <SelectItem value="administrator">{isRTL ? "مدير" : "Administrator"}</SelectItem>
                    <SelectItem value="moderator">{isRTL ? "مشرف" : "Moderator"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label className={`block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? "تصفية حسب الحالة:" : "Filter by Status:"}
                </Label>
                <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
                  <SelectTrigger className={isRTL ? 'text-right [&>span]:text-right [&>svg]:order-first' : 'text-left'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isRTL ? '[&_*]:text-right' : ''}>
                    <SelectItem value="all">{isRTL ? "جميع الحالات" : "All Status"}</SelectItem>
                    <SelectItem value="active">{isRTL ? "نشط" : "Active"}</SelectItem>
                    <SelectItem value="inactive">{isRTL ? "غير نشط" : "Inactive"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Filter className="h-4 w-4" />
                  {isRTL ? "إعادة تعيين" : "Reset"}
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? (
                `إظهار ${filteredUsers.length} من أصل ${users.length} مستخدم`
              ) : (
                `Showing ${filteredUsers.length} of ${users.length} users`
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-red-700 dark:text-red-400 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <Crown className="h-5 w-5" />
              {isRTL ? "المدير" : "Administrator"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`space-y-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Key className="h-4 w-4" />
                <span>{isRTL ? "جميع الصلاحيات" : "Full system access"}</span>
              </div>
              <ul className={`text-gray-600 dark:text-gray-400 space-y-1 ${isRTL ? 'text-right' : 'text-left list-disc ml-4'}`}>
                <li className={isRTL ? 'relative pr-4' : ''}>{isRTL && <span className="absolute right-0 top-0 text-gray-400 font-bold">•</span>}{isRTL ? "إدارة المستخدمين" : "Manage users"}</li>
                <li className={isRTL ? 'relative pr-4' : ''}>{isRTL && <span className="absolute right-0 top-0 text-gray-400 font-bold">•</span>}{isRTL ? "إدارة المحتوى" : "Manage content"}</li>
                <li className={isRTL ? 'relative pr-4' : ''}>{isRTL && <span className="absolute right-0 top-0 text-gray-400 font-bold">•</span>}{isRTL ? "إدارة المنتجات والفئات" : "Manage products & categories"}</li>
                <li className={isRTL ? 'relative pr-4' : ''}>{isRTL && <span className="absolute right-0 top-0 text-gray-400 font-bold">•</span>}{isRTL ? "إعدادات النظام" : "System settings"}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-blue-700 dark:text-blue-400 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <Shield className="h-5 w-5" />
              {isRTL ? "المشرف" : "Moderator"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`space-y-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Key className="h-4 w-4" />
                <span>{isRTL ? "صلاحيات محدودة" : "Limited access"}</span>
              </div>
              <ul className={`text-gray-600 dark:text-gray-400 space-y-1 ${isRTL ? 'text-right' : 'text-left list-disc ml-4'}`}>
                <li className={isRTL ? 'relative pr-4' : ''}>{isRTL && <span className="absolute right-0 top-0 text-gray-400 font-bold">•</span>}{isRTL ? "إدارة المنتجات" : "Manage products"}</li>
                <li className={isRTL ? 'relative pr-4' : ''}>{isRTL && <span className="absolute right-0 top-0 text-gray-400 font-bold">•</span>}{isRTL ? "إدارة الفئات" : "Manage categories"}</li>
                <li className={isRTL ? 'relative pr-4' : ''}>{isRTL && <span className="absolute right-0 top-0 text-gray-400 font-bold">•</span>}{isRTL ? "عرض التقارير" : "View reports"}</li>
              </ul>
              <p className={`text-xs text-amber-600 dark:text-amber-400 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? "لا يمكن إدارة المستخدمين أو المحتوى الثابت" : "Cannot manage users or static content"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <Users className="h-5 w-5" />
            {isRTL ? "قائمة المستخدمين" : "Users List"}
            <Badge variant="secondary">{filteredUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isRTL ? (
                    <>
                      <TableHead className="text-right">الإجراءات</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الصلاحيات</TableHead>
                      <TableHead className="text-right">الدور</TableHead>
                      <TableHead className="text-right">البريد الإلكتروني</TableHead>
                      <TableHead className="text-right">اسم المستخدم</TableHead>
                      <TableHead className="text-right">المستخدم</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-left">User</TableHead>
                      <TableHead className="text-left">Username</TableHead>
                      <TableHead className="text-left">Email</TableHead>
                      <TableHead className="text-left">Role</TableHead>
                      <TableHead className="text-left">Permissions</TableHead>
                      <TableHead className="text-left">Status</TableHead>
                      <TableHead className="text-left">Actions</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                        <span className="text-gray-500">{isRTL ? "جاري التحميل..." : "Loading..."}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-gray-500">
                        {isRTL ? "لا توجد نتائج" : "No results found"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      {isRTL ? (
                        <>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {canDeleteUser(user) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(user)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-xs text-gray-500 max-w-xs">
                              {getPermissions(user.role)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-3 flex-row-reverse">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium text-sm">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  منذ {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-left">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium text-sm">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Since {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-left">
                            <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                          </TableCell>
                          <TableCell className="text-left">
                            <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                          </TableCell>
                          <TableCell className="text-left">
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="text-xs text-gray-500 max-w-xs">
                              {getPermissions(user.role)}
                            </div>
                          </TableCell>
                          <TableCell className="text-left">
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-left">
                            <div className="flex items-center gap-2 justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {canDeleteUser(user) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(user)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && totalPages > 1 && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 pb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? (
                  `إظهار ${startIndex + 1}-${Math.min(endIndex, filteredUsers.length)} من ${filteredUsers.length} مستخدم`
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
        </CardContent>
      </Card>

      {/* System Note */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <CardContent className="pt-6">
          <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                {isRTL ? "ملاحظة أمنية" : "Security Note"}
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                {isRTL 
                  ? "يمكن للمديرين فقط إدارة المستخدمين وتعديل الأدوار. المشرفون لديهم صلاحيات محدودة لإدارة المحتوى فقط."
                  : "Only administrators can manage users and modify roles. Moderators have limited permissions for content management only."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
            <DialogTitle className={`flex items-center gap-2 text-red-600 dark:text-red-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? (
                <>
                  <Trash2 className="h-5 w-5 order-1" />
                  <span className="order-2">تأكيد الحذف</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  <span>Confirm Delete</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {isRTL 
                ? `هل أنت متأكد من حذف المستخدم "${userToDelete?.firstName} ${userToDelete?.lastName}"؟`
                : `Are you sure you want to delete user "${userToDelete?.firstName} ${userToDelete?.lastName}"?`
              }
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {isRTL 
                ? "هذا الإجراء لا يمكن التراجع عنه."
                : "This action cannot be undone."
              }
            </p>
          </div>
          <div className={`flex gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
            {isRTL ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={deleteUserMutation.isPending}
                >
                  إلغاء
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  disabled={deleteUserMutation.isPending}
                >
                  {deleteUserMutation.isPending ? "جاري الحذف..." : "حذف"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={deleteUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  disabled={deleteUserMutation.isPending}
                >
                  {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}