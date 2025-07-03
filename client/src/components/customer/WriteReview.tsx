import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Star, Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";

interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  image: string;
}

interface ReviewFormData {
  productId: number;
  rating: number;
  titleEn: string;
  titleAr: string;
  reviewEn: string;
  reviewAr: string;
  customerName: string;
}

export function WriteReview() {
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ReviewFormData>({
    productId: 0,
    rating: 0,
    titleEn: "",
    titleAr: "",
    reviewEn: "",
    reviewAr: "",
    customerName: ""
  });

  // Fetch reviewable products for the user
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/user/reviewable-products"],
  });

  // Submit review mutation
  const submitMutation = useMutation({
    mutationFn: async (reviewData: ReviewFormData) => {
      return await apiRequest("/api/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم الإرسال بنجاح" : "Success",
        description: isRTL 
          ? "تم إرسال تقييمك بنجاح وسيتم مراجعته قريباً"
          : "Your review has been submitted successfully and will be reviewed soon",
      });
      
      // Reset form
      setFormData({
        productId: 0,
        rating: 0,
        titleEn: "",
        titleAr: "",
        reviewEn: "",
        reviewAr: "",
        customerName: ""
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/user/reviewable-products"] });
    },
    onError: (error: any) => {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل في إرسال التقييم" : "Failed to submit review"),
        variant: "destructive",
      });
    },
  });

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى اختيار منتج" : "Please select a product",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.rating === 0) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى اختيار تقييم" : "Please select a rating",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.reviewEn.trim() || !formData.reviewAr.trim()) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى كتابة التقييم بكلا اللغتين" : "Please write the review in both languages",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(formData);
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleRatingClick(i + 1)}
            className="transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                i < formData.rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          {isRTL ? "جاري التحميل..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">
            {isRTL ? "لا توجد منتجات للتقييم" : "No Products to Review"}
          </h2>
          <p className="text-gray-600">
            {isRTL 
              ? "يجب عليك إتمام طلب أولاً لتتمكن من كتابة تقييم للمنتجات"
              : "You need to complete an order first to be able to write reviews for products"
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? "text-right" : "text-left"}>
            {isRTL ? "كتابة تقييم" : "Write a Review"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Selection */}
            <div className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              <Label>{isRTL ? "اختر المنتج" : "Select Product"}</Label>
              <Select value={formData.productId.toString()} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, productId: parseInt(value) }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر منتج للتقييم" : "Select a product to review"} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: Product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      <div className="flex items-center gap-2">
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={isRTL ? product.nameAr : product.nameEn}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        {isRTL ? product.nameAr : product.nameEn}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Name */}
            <div className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              <Label>{isRTL ? "اسمك" : "Your Name"}</Label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                required
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* Rating */}
            <div className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
              <Label>{isRTL ? "التقييم" : "Rating"}</Label>
              <div className="flex items-center gap-2">
                {renderStarRating()}
                <span className="text-sm text-gray-600">
                  {formData.rating > 0 && `${formData.rating}/5`}
                </span>
              </div>
            </div>

            {/* Review Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? "عنوان التقييم (بالإنجليزية)" : "Review Title (English)"}</Label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                  placeholder="Great service!"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "عنوان التقييم (بالعربية)" : "Review Title (Arabic)"}</Label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                  placeholder="خدمة ممتازة!"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Review Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? "التقييم (بالإنجليزية)" : "Review (English)"}</Label>
                <Textarea
                  value={formData.reviewEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewEn: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  required
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "التقييم (بالعربية)" : "Review (Arabic)"}</Label>
                <Textarea
                  value={formData.reviewAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, reviewAr: e.target.value }))}
                  placeholder="شارك تجربتك مع هذا المنتج..."
                  rows={4}
                  required
                  dir="rtl"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitMutation.isPending 
                  ? (isRTL ? "جاري الإرسال..." : "Submitting...")
                  : (isRTL ? "إرسال التقييم" : "Submit Review")
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}