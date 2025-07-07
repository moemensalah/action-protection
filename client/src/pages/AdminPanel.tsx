import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, Users, FolderOpen, Package, FileText, Settings, LogOut, Menu, X, Mail, Monitor, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { CategoriesManagement } from "@/components/admin/CategoriesManagement";
import { ProductsManagement } from "@/components/admin/ProductsManagement";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { GhostProductsManagement } from "@/components/admin/GhostProductsManagement";
import SmtpSettings from "@/components/admin/SmtpSettings";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { HeroSectionManager } from "@/components/admin/HeroSectionManager";
import { ExperienceSectionManager } from "@/components/admin/ExperienceSectionManager";
import { ReviewsManager } from "@/components/admin/ReviewsManager";
import WebsiteUsersManagement from "@/components/admin/WebsiteUsersManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import PermissionsManagement from "@/components/admin/PermissionsManagement";

export default function AdminPanel() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("categories");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedOrdersUserFilter, setSelectedOrdersUserFilter] = useState<string>("");

  // Function to navigate to orders tab with user filter
  const navigateToOrdersWithUserFilter = (userId: number) => {
    setSelectedOrdersUserFilter(userId.toString());
    setActiveTab("website-orders");
  };

  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "administrator" | "moderator";
    isActive: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define all sections at component level
  const allSections = [
    {
      id: "categories",
      icon: FolderOpen,
      nameEn: "Categories",
      nameAr: "الفئات",
      descEn: "Manage product categories",
      descAr: "إدارة فئات المنتجات",
      roles: ["administrator", "moderator"]
    },
    {
      id: "products", 
      icon: Package,
      nameEn: "Products",
      nameAr: "المنتجات",
      descEn: "Manage all products",
      descAr: "إدارة جميع المنتجات",
      roles: ["administrator", "moderator"]
    },
    {
      id: "content",
      icon: FileText,
      nameEn: "Content",
      nameAr: "المحتوى",
      descEn: "Manage pages and content",
      descAr: "إدارة الصفحات والمحتوى",
      roles: ["administrator"]
    },
    {
      id: "hero-section",
      icon: Monitor,
      nameEn: "Hero Section",
      nameAr: "القسم الرئيسي",
      descEn: "Manage hero section content",
      descAr: "إدارة محتوى القسم الرئيسي",
      roles: ["administrator"]
    },
    {
      id: "experience-section",
      icon: Video,
      nameEn: "Experience Section",
      nameAr: "قسم التجربة",
      descEn: "Manage experience section",
      descAr: "إدارة قسم التجربة",
      roles: ["administrator"]
    },
    {
      id: "reviews",
      icon: MessageSquare,
      nameEn: "Customer Reviews",
      nameAr: "تقييمات العملاء",
      descEn: "Manage customer reviews",
      descAr: "إدارة تقييمات العملاء",
      roles: ["administrator", "moderator"]
    },
    {
      id: "smtp-settings",
      icon: Mail,
      nameEn: "SMTP Settings",
      nameAr: "إعدادات البريد",
      descEn: "Configure email settings",
      descAr: "تكوين إعدادات البريد الإلكتروني",
      roles: ["administrator"]
    },
    {
      id: "website-users",
      icon: Users,
      nameEn: "Website Users",
      nameAr: "مستخدمو الموقع", 
      descEn: "Manage website users and accounts",
      descAr: "إدارة مستخدمي الموقع والحسابات",
      roles: ["administrator", "moderator"]
    },
    {
      id: "website-orders",
      icon: Package,
      nameEn: "Website Orders",
      nameAr: "طلبات الموقع",
      descEn: "Manage customer orders and details",
      descAr: "إدارة طلبات العملاء والتفاصيل",
      roles: ["administrator", "moderator"]
    },
    {
      id: "permissions",
      icon: Shield,
      nameEn: "Permissions",
      nameAr: "الصلاحيات",
      descEn: "Manage users permissions",
      descAr: "إدارة صلاحيات المستخدمين",
      roles: ["administrator"]
    },
    {
      id: "users",
      icon: Users,
      nameEn: "Admin Users",
      nameAr: "المستخدمين الإداريين",
      descEn: "Manage admin users",
      descAr: "إدارة المستخدمين الإداريين",
      roles: ["administrator"]
    }
  ];

  // Filter sections based on user role
  const adminSections = allSections.filter(section => 
    user?.role && section.roles.includes(user.role)
  );

  useEffect(() => {
    // Check server session instead of localStorage
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/admin/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.log('No active session');
      }
      setIsLoading(false);
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    // Ensure activeTab is valid for the user's role
    if (user && adminSections.length > 0 && !adminSections.find(section => section.id === activeTab)) {
      setActiveTab(adminSections[0].id);
    }
  }, [user, adminSections, activeTab]);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
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
                {isRTL ? "لوحة الإدارة" : "Admin Panel"}
              </h1>
            </div>
          </div>

          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="font-medium text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-gray-500 dark:text-gray-400 capitalize">
                {user.role}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <LogOut className="h-4 w-4" />
              {isRTL ? "تسجيل خروج" : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden`}>
          <div className="p-6">
            <h2 className={`text-lg font-semibold text-gray-900 dark:text-white mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "الأقسام" : "Sections"}
            </h2>
            
            {adminSections.map((section) => {
              const isActive = activeTab === section.id;
              const name = isRTL ? section.nameAr : section.nameEn;
              const desc = isRTL ? section.descAr : section.descEn;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full p-4 rounded-lg mb-2 transition-all ${
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800'
                      : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <section.icon className={`h-5 w-5 ${
                      isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className={`font-medium ${
                        isActive ? 'text-amber-700 dark:text-amber-300' : 'text-gray-900 dark:text-white'
                      }`}>{name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{desc}</div>
                    </div>
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

              {user?.role === "administrator" && (
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
              )}

              {user?.role === "administrator" && (
                <TabsContent value="hero-section" className="space-y-6">
                  <HeroSectionManager />
                </TabsContent>
              )}

              {user?.role === "administrator" && (
                <TabsContent value="experience-section" className="space-y-6">
                  <ExperienceSectionManager />
                </TabsContent>
              )}

              <TabsContent value="reviews" className="space-y-6">
                <ReviewsManager />
              </TabsContent>

              {user?.role === "administrator" && (
                <TabsContent value="smtp-settings" className="space-y-6">
                  <SmtpSettings />
                </TabsContent>
              )}

              <TabsContent value="website-users" className="space-y-6">
                <WebsiteUsersManagement onNavigateToOrders={navigateToOrdersWithUserFilter} />
              </TabsContent>

              <TabsContent value="website-orders" className="space-y-6">
                <OrderManagement initialUserFilter={selectedOrdersUserFilter} onUserFilterChange={setSelectedOrdersUserFilter} />
              </TabsContent>

              {user?.role === "administrator" && (
                <TabsContent value="permissions" className="space-y-6">
                  <PermissionsManagement />
                </TabsContent>
              )}

              {user?.role === "administrator" && (
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
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}