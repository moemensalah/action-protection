import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Footer } from "@/components/Footer";
import { SEO, getMenuSchema, getBreadcrumbSchema } from "@/components/SEO";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  categoryId: number;
  image: string;
  isActive: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
}

interface Category {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  slug: string;
  image: string;
  isActive: boolean;
}

export default function Menu() {
  const { t, isRTL } = useLanguage();
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Get category from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const categorySlug = urlParams.get('category') || "all";

  useEffect(() => {
    setSelectedCategory(categorySlug);
  }, [categorySlug]);

  const breadcrumbItems = [
    { name: t("home"), url: "/" },
    { name: t("menu"), url: "/menu" }
  ];

  // Fetch categories from database
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Fetch products from database
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { category: categorySlug, search: searchQuery, page: currentPage }],
  });

  const activeCategories = (categories as any[]).filter((cat: any) => cat.isActive) as Category[];
  const currentCategory = categorySlug !== "all" ? activeCategories.find((cat: Category) => cat.slug === categorySlug) : null;

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    setSearchQuery("");
    if (value === "all") {
      setLocation("/menu");
    } else {
      setLocation(`/menu?category=${value}`);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const isLoading = categoriesLoading || productsLoading;
  const products = (productsResponse as any)?.products || [];
  const pagination = (productsResponse as any)?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={currentCategory ? (isRTL ? currentCategory.nameAr : currentCategory.nameEn) : t("menu")}
        description={currentCategory 
          ? (isRTL ? currentCategory.descriptionAr : currentCategory.descriptionEn)
          : (isRTL 
            ? "استكشف قائمة منتجاتنا المتنوعة من القهوة والمشروبات والأطعمة الطازجة. جودة عالية وطعم استثنائي في كل طلب."
            : "Explore our diverse menu of coffee, beverages, and fresh food. High quality and exceptional taste in every order."
          )
        }
        keywords={isRTL
          ? "قائمة الطعام, قهوة, مشروبات, إفطار, حلويات, ليت لاونج"
          : "menu, coffee, beverages, breakfast, desserts, LateLounge"
        }
        url="/menu"
        structuredData={{
          ...getMenuSchema(isRTL),
          ...getBreadcrumbSchema(breadcrumbItems)
        }}
      />
      
      <AnimatedBackground />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {currentCategory ? (isRTL ? currentCategory.nameAr : currentCategory.nameEn) : t("menu")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {currentCategory 
                ? (isRTL ? currentCategory.descriptionAr : currentCategory.descriptionEn)
                : "Discover our carefully crafted menu of specialty coffee, fresh food, and delightful treats"
              }
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("searchProducts")}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-64">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  {activeCategories.map((cat: Category) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {isRTL ? cat.nameAr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery 
                ? "No products found matching your search" 
                : "No products available in this category"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={() => handleViewDetails(product)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {pagination.hasPrev && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(currentPage - 1)}
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {pagination.hasNext && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(currentPage + 1)}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}