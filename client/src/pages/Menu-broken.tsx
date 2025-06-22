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

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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

  const breadcrumbItems = [
    { name: t("home"), url: "/" },
    { name: t("menu"), url: "/menu" }
  ];

  // Fetch categories and products from database API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: apiProductsData, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", { category: categorySlug, page: currentPage, search: searchQuery }],
  });

  const activeCategories = categories.filter((cat: Category) => cat.isActive);
  const category = categorySlug !== "all" ? activeCategories.find((cat: Category) => cat.slug === categorySlug) : null;
  
  // Get products from API response
  const allProducts = useMemo(() => {
    if (!apiProductsData?.products) return [];
    let filtered = apiProductsData.products;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product: Product) => 
        product.nameEn.toLowerCase().includes(query) ||
        product.nameAr.toLowerCase().includes(query) ||
        product.descriptionEn.toLowerCase().includes(query) ||
        product.descriptionAr.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [apiProductsData, searchQuery]);

  // Pagination logic
  const itemsPerPage = 12;
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = allProducts.slice(startIndex, startIndex + itemsPerPage);

  const productsResponse = {
    products: paginatedProducts,
    pagination: {
      page: currentPage,
      limit: itemsPerPage,
      total: allProducts.length,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    if (value === "all") {
      setLocation('/menu');
    } else {
      setLocation(`/menu?category=${value}`);
    }
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <SEO 
        title={isRTL ? "القائمة" : "Menu"}
        description={isRTL 
          ? "استكشف قائمة ليت لاونج الشاملة مع أفضل أنواع القهوة والمشروبات والمأكولات. من الإسبريسو المحضر بخبرة إلى الحلويات الطازجة والأطباق الرئيسية اللذيذة."
          : "Explore LateLounge's comprehensive menu featuring premium coffee, beverages, and culinary delights. From expertly crafted espresso to fresh desserts and delicious main dishes."
        }
        keywords={isRTL
          ? "قائمة الطعام, قهوة, إسبريسو, مشروبات باردة, إفطار, حلويات, أطباق رئيسية, ليت لاونج"
          : "menu, coffee, espresso, cold drinks, breakfast, desserts, main dishes, LateLounge"
        }
        url="/menu"
        type="restaurant.menu"
        structuredData={{
          ...getMenuSchema(isRTL),
          ...getBreadcrumbSchema(breadcrumbItems)
        }}
      />
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Navigation */}
        {!categorySlug && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t("ourCategories")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {categories?.map((cat) => (
                <Button
                  key={cat.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2 hover:bg-primary hover:text-white transition-colors"
                  onClick={() => setLocation(`/menu?category=${cat.slug}`)}
                >
                  <span className="font-medium text-sm">
                    {isRTL ? cat.nameAr : cat.nameEn}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t("searchProducts") || "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rtl:pr-10 rtl:pl-3"
              />
            </div>
            
            {/* Category Dropdown */}
            <div className={`md:w-64 ${isRTL ? "rtl-dropdown rtl-select" : ""}`}>
              <Select value={categorySlug || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger className={`${isRTL ? "text-right" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
                  <SelectValue placeholder={t("selectCategory") || "Select Category"} />
                </SelectTrigger>
                <SelectContent className={`${isRTL ? "text-right" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
                  <SelectItem value="all" className={`${isRTL ? "text-right" : ""}`}>
                    {t("allCategories") || "All Categories"}
                  </SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug} className={`${isRTL ? "text-right" : ""}`}>
                      {isRTL ? cat.nameAr : cat.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {category 
                ? (isRTL ? category.nameAr : category.nameEn)
                : t("menu")
              }
            </h1>
            {category && (
              <p className="text-lg text-muted-foreground">
                {isRTL ? category.descriptionAr : category.descriptionEn}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => categorySlug ? setLocation("/menu") : setLocation("/")}
            className="gap-2"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {categorySlug ? t("allCategories") : t("home")}
          </Button>
        </div>

        {/* Products Grid */}
        {productsData.products?.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {productsData.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            {productsData && productsData.pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {productsData && productsData.pagination.hasPrev && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                    
                    {productsData && Array.from({ length: productsData.pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === productsData.pagination.totalPages || 
                        Math.abs(page - currentPage) <= 2
                      )
                      .map((page, index, array) => (
                        <PaginationItem key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    
                    {productsData && productsData.pagination.hasNext && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {t("noProducts")}
            </p>
          </div>
        )}

        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
      <Footer />
    </div>
  );
}
