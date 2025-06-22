import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Shield, UserPlus, Edit, Crown, Key } from "lucide-react";
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
  email: string;
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
  const [formData, setFormData] = useState<UserForm>({
    email: "",
    firstName: "",
    lastName: "",
    role: "moderator",
    isActive: true
  });

  // Fetch users from API
  const { data: users = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

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
      return apiRequest(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
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
      email: "",
      firstName: "",
      lastName: "",
      role: "moderator",
      isActive: true
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });
    setIsDialogOpen(true);
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
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isRTL ? "إدارة المستخدمين" : "Users Management"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? "إدارة المديرين والمشرفين والصلاحيات" : "Manage administrators, moderators, and permissions"}
          </p>
        </div>
        
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
                <div className={`flex flex-col ${isRTL ? 'items-end order-2' : 'items-start order-1'}`}>
                  <Label htmlFor="isActive" className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? "حالة المستخدم" : "User Status"}
                  </Label>
                  <p className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
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
      </div>

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
            <Badge variant="secondary">{users.length}</Badge>
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
                      <TableHead className="text-right">المستخدم</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead className="text-left">User</TableHead>
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
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        {isRTL ? "لا توجد مستخدمين" : "No users found"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: User) => (
                    <TableRow key={user.id}>
                      {isRTL ? (
                        <>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
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
    </div>
  );
}