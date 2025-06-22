import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, Users, FolderOpen, Package, FileText, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { CategoriesManagement } from "@/components/admin/CategoriesManagement";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default function AdminPanel() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("categories");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing login
    const token = localStorage.getItem("admin_token");
    const userData = localStorage.getItem("admin_user");
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const adminSections = [
    {
      id: "categories",
      icon: FolderOpen,
      nameEn: "Categories",
      nameAr: "الفئات",
      descEn: "Manage product categories",
      descAr: "إدارة فئات المنتجات"
    },
    {
      id: "products", 
      icon: Package,
      nameEn: "Products",
      nameAr: "المنتجات",
      descEn: "Manage all products",
      descAr: "إدارة جميع المنتجات"
    },
    {
      id: "content",
      icon: FileText,
      nameEn: "Content",
      nameAr: "المحتوى",
      descEn: "Manage pages and content",
      descAr: "إدارة الصفحات والمحتوى"
    },
    {
      id: "users",
      icon: Users,
      nameEn: "Users",
      nameAr: "المستخدمين",
      descEn: "Manage admin users",
      descAr: "إدارة المستخدمين الإداريين"
    }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {isRTL ? "لوحة التحكم الإدارية" : "Admin Control Panel"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="h-4 w-4" />
              <span>{user.firstName} {user.lastName}</span>
              <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded">
                {user.role === 'administrator' ? (isRTL ? 'مدير' : 'Admin') : (isRTL ? 'مشرف' : 'Moderator')}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isRTL ? "تسجيل خروج" : "Logout"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/")}
              className="hidden sm:flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isRTL ? "عودة للموقع" : "Back to Site"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          <div className="p-4 space-y-2">
            {adminSections.map((section) => {
              const Icon = section.icon;
              const name = isRTL ? section.nameAr : section.nameEn;
              const desc = isRTL ? section.descAr : section.descEn;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === section.id
                      ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <FolderOpen className="h-5 w-5" />
                      {isRTL ? "إدارة الفئات" : "Categories Management"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoriesManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <Package className="h-5 w-5" />
                      {isRTL ? "إدارة المنتجات" : "Products Management"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductsManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <FileText className="h-5 w-5" />
                      {isRTL ? "إدارة المحتوى" : "Content Management"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContentManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <Users className="h-5 w-5" />
                      {isRTL ? "إدارة المستخدمين" : "Users Management"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UsersManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}