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

  // Mock users data for demonstration (in real app, fetch from API)
  const mockUsers: User[] = [
    {
      id: "admin1",
      email: "admin@latelounge.sa",
      firstName: "System",
      lastName: "Administrator",
      profileImageUrl: "",
      role: "administrator",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "mod1",
      email: "moderator@latelounge.sa",
      firstName: "Content",
      lastName: "Moderator",
      profileImageUrl: "",
      role: "moderator",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const users = mockUsers; // In real app: useQuery to fetch users

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
    
    // Mock implementation - in real app, call API
    toast({
      title: isRTL ? "تم الحفظ" : "Saved",
      description: editingUser 
        ? (isRTL ? "تم تحديث المستخدم بنجاح" : "User updated successfully")
        : (isRTL ? "تم إنشاء المستخدم بنجاح" : "User created successfully"),
    });
    
    setIsDialogOpen(false);
    setEditingUser(null);
    resetForm();
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
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>
                {editingUser 
                  ? (isRTL ? "تعديل المستخدم" : "Edit User")
                  : (isRTL ? "إضافة مستخدم جديد" : "Add New User")
                }
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "الاسم الأول" : "First Name"}</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "الاسم الأخير" : "Last Name"}</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className={isRTL ? 'text-right' : 'text-left'}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email" className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className={isRTL ? 'text-right' : 'text-left'}
                />
              </div>
              
              <div>
                <Label htmlFor="role" className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "الدور" : "Role"}</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: "administrator" | "moderator") => 
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Shield className="h-4 w-4" />
                        {isRTL ? "مشرف" : "Moderator"}
                      </div>
                    </SelectItem>
                    <SelectItem value="administrator">
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Crown className="h-4 w-4" />
                        {isRTL ? "مدير" : "Administrator"}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className={`text-sm text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {getPermissions(formData.role)}
                </p>
              </div>
              
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive" className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "نشط" : "Active"}</Label>
              </div>
              
              <div className={`flex gap-2 pt-4 ${isRTL ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit">
                  {editingUser 
                    ? (isRTL ? "تحديث" : "Update")
                    : (isRTL ? "إضافة" : "Add")
                  }
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
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "المستخدم" : "User"}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "البريد الإلكتروني" : "Email"}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "الدور" : "Role"}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "الصلاحيات" : "Permissions"}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "الحالة" : "Status"}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-medium text-sm">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {isRTL ? "منذ" : "Since"} {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <div className="text-xs text-gray-500 max-w-xs">
                        {getPermissions(user.role)}
                      </div>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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