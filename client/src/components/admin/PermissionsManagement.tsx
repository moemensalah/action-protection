import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Save, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import type { User, UserPermission, InsertUserPermission } from "@shared/schema";
import { AdminLoading } from "@/components/ui/admin-loading";

interface UserWithPermissions extends User {
  permissions: UserPermission[];
}

interface PermissionSection {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  actions: string[];
}

const permissionSections: PermissionSection[] = [
  {
    id: "users",
    nameEn: "Admin Users",
    nameAr: "إدارة المستخدمين",
    descriptionEn: "Manage admin and moderator accounts",
    descriptionAr: "إدارة حسابات الإدارة",
    actions: ["create", "read", "update", "delete"]
  },
  {
    id: "website_users",
    nameEn: "Website Users",
    nameAr: "مستخدمي الموقع",
    descriptionEn: "Manage website customer accounts",
    descriptionAr: "إدارة حسابات العملاء",
    actions: ["read", "update", "delete"]
  },
  {
    id: "orders",
    nameEn: "Orders Management",
    nameAr: "إدارة الطلبات",
    descriptionEn: "View and manage customer orders",
    descriptionAr: "إدارة الطلبات",
    actions: ["read", "update", "delete"]
  },
  {
    id: "categories",
    nameEn: "Categories",
    nameAr: "الفئات",
    descriptionEn: "Manage product categories",
    descriptionAr: "إدارة الفئات",
    actions: ["create", "read", "update", "delete"]
  },
  {
    id: "products",
    nameEn: "Products",
    nameAr: "المنتجات",
    descriptionEn: "Manage products and services",
    descriptionAr: "إدارة المنتجات",
    actions: ["create", "read", "update", "delete"]
  },
  {
    id: "content",
    nameEn: "Content Management",
    nameAr: "إدارة المحتوى",
    descriptionEn: "Manage website content and pages",
    descriptionAr: "إدارة محتوى الموقع",
    actions: ["read", "update"]
  },
  {
    id: "reviews",
    nameEn: "Reviews",
    nameAr: "المراجعات",
    descriptionEn: "Manage customer reviews and ratings",
    descriptionAr: "إدارة المراجعات",
    actions: ["read", "update", "delete"]
  },
  {
    id: "smtp_settings",
    nameEn: "SMTP Settings",
    nameAr: "إعدادات البريد",
    descriptionEn: "Configure email settings",
    descriptionAr: "إعدادات البريد",
    actions: ["read", "update"]
  },
  {
    id: "hero_section",
    nameEn: "Hero Section",
    nameAr: "القسم الرئيسي",
    descriptionEn: "Manage homepage hero section",
    descriptionAr: "إدارة القسم الرئيسي",
    actions: ["read", "update"]
  },
  {
    id: "experience_section",
    nameEn: "Experience Section",
    nameAr: "قسم التجربة",
    descriptionEn: "Manage experience showcase section",
    descriptionAr: "إدارة قسم التجربة",
    actions: ["read", "update"]
  }
];

const actionLabels = {
  create: { en: "Create", ar: "إنشاء" },
  read: { en: "View", ar: "عرض" },
  update: { en: "Edit", ar: "تعديل" },
  delete: { en: "Delete", ar: "حذف" }
};

export default function PermissionsManagement() {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<UserWithPermissions[]>({
    queryKey: ["/api/admin/users/with-permissions"],
  });

  // Get current user permissions when user is selected
  useEffect(() => {
    if (selectedUser && users.length > 0) {
      const user = users.find(u => u.id === selectedUser);
      if (user) {
        const permissions: Record<string, string[]> = {};
        user.permissions.forEach(permission => {
          permissions[permission.section] = Array.isArray(permission.actions) ? permission.actions : [];
        });
        setUserPermissions(permissions);
        setHasChanges(false);
      }
    }
  }, [selectedUser, users]);

  // Save permissions mutation
  const savePermissionsMutation = useMutation({
    mutationFn: async (data: { userId: string; permissions: Record<string, string[]> }) => {
      return await apiRequest(`/api/admin/users/${data.userId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions: data.permissions }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/with-permissions"] });
      toast({
        title: isRTL ? "تم حفظ الصلاحيات بنجاح" : "Permissions saved successfully",
        variant: "default",
      });
      setHasChanges(false);
    },
    onError: () => {
      toast({
        title: isRTL ? "فشل في حفظ الصلاحيات" : "Failed to save permissions",
        variant: "destructive",
      });
    },
  });

  const handlePermissionChange = (section: string, action: string, enabled: boolean) => {
    setUserPermissions(prev => {
      const sectionPermissions = prev[section] || [];
      const newPermissions = enabled 
        ? [...sectionPermissions, action]
        : sectionPermissions.filter(a => a !== action);
      
      const updated = { ...prev, [section]: newPermissions };
      setHasChanges(true);
      return updated;
    });
  };

  const handleSavePermissions = () => {
    if (selectedUser) {
      savePermissionsMutation.mutate({ userId: selectedUser, permissions: userPermissions });
    }
  };

  const handleResetPermissions = () => {
    if (selectedUser && users.length > 0) {
      const user = users.find(u => u.id === selectedUser);
      if (user) {
        const permissions: Record<string, string[]> = {};
        user.permissions.forEach(permission => {
          permissions[permission.section] = Array.isArray(permission.actions) ? permission.actions : [];
        });
        setUserPermissions(permissions);
        setHasChanges(false);
      }
    }
  };

  const selectedUserData = users.find(u => u.id === selectedUser);
  const isAdministrator = selectedUserData?.role === "administrator";

  if (isLoadingUsers) {
    return <AdminLoading />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? "إدارة الصلاحيات" : "Permissions Management"}
        </h1>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isRTL ? "إدارة صلاحيات المستخدمين" : "Manage User Permissions"}
          </span>
        </div>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <Users className="h-5 w-5" />
            <span>{isRTL ? "اختيار المستخدم" : "Select User"}</span>
          </CardTitle>
          <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
            {isRTL ? "اختر مستخدماً لإدارة صلاحياته" : "Choose a user to manage their permissions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isRTL ? "اختر مستخدماً..." : "Select a user..."} />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{user.firstName} {user.lastName}</span>
                      <Badge variant={user.role === "administrator" ? "default" : "secondary"}>
                        {user.role === "administrator" ? (isRTL ? "مدير" : "Admin") : (isRTL ? "مشرف" : "Moderator")}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedUserData && (
              <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{selectedUserData.firstName} {selectedUserData.lastName}</span>
                  <Badge variant={selectedUserData.role === "administrator" ? "default" : "secondary"}>
                    {selectedUserData.role === "administrator" ? (isRTL ? "مدير" : "Administrator") : (isRTL ? "مشرف" : "Moderator")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUserData.email}</p>
                {isAdministrator && (
                  <div className={`flex items-center gap-2 mt-2 text-amber-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">
                      {isRTL ? "المديرون لديهم جميع الصلاحيات افتراضياً" : "Administrators have all permissions by default"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Configuration */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div>
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                  <Shield className="h-5 w-5" />
                  <span>{isRTL ? "تكوين الصلاحيات" : "Permissions Configuration"}</span>
                </CardTitle>
                <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                  {isRTL ? "قم بتحديد الصلاحيات لكل قسم" : "Set permissions for each section"}
                </CardDescription>
              </div>
              
              {hasChanges && (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetPermissions}
                    disabled={savePermissionsMutation.isPending}
                  >
                    <RotateCcw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? "إلغاء" : "Reset"}
                  </Button>
                  <Button
                    onClick={handleSavePermissions}
                    disabled={savePermissionsMutation.isPending}
                    size="sm"
                  >
                    <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {savePermissionsMutation.isPending ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ" : "Save")}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {permissionSections.map((section) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`${isRTL ? 'text-right' : 'text-left'} max-w-full`}>
                      <h3 className="font-semibold text-lg truncate">
                        {isRTL ? section.nameAr : section.nameEn}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {isRTL ? section.descriptionAr : section.descriptionEn}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-4`}>
                    {section.actions.map((action) => {
                      const isEnabled = userPermissions[section.id]?.includes(action) || false;
                      const isDisabled = isAdministrator; // Admins always have all permissions
                      
                      return (
                        <div key={action} className={`flex items-center justify-between p-3 border rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-sm font-medium">
                              {isRTL ? actionLabels[action as keyof typeof actionLabels].ar : actionLabels[action as keyof typeof actionLabels].en}
                            </span>
                            {isEnabled && <CheckCircle className="w-4 h-4 text-green-600" />}
                          </div>
                          <Switch
                            checked={isEnabled || isAdministrator}
                            disabled={isDisabled}
                            onCheckedChange={(checked) => handlePermissionChange(section.id, action, checked)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}