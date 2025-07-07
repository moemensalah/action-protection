import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Star, Eye, EyeOff, Trash2, Settings } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";
import { AdminLoading } from "@/components/ui/admin-loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CustomerReview {
  id: number;
  userId: string;
  productId?: number;
  orderId?: number;
  rating: number;
  titleEn?: string;
  titleAr?: string;
  reviewEn: string;
  reviewAr: string;
  customerName: string;
  customerImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  isShowOnWebsite: boolean;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewSettings {
  id: number;
  enableReviews: boolean;
  autoApproveReviews: boolean;
  requireOrderToReview: boolean;
  showReviewsOnWebsite: boolean;
  maxReviewsPerUser: number;
  reviewCooldownDays: number;
}

export function ReviewsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, isRTL } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fetch reviews
  const { data: reviewsData = [], isLoading } = useQuery({
    queryKey: ["/api/admin/reviews", statusFilter],
    queryFn: () => apiRequest(`/api/admin/reviews${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`),
  });

  // Ensure reviews is always an array
  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  // Fetch review settings
  const { data: settingsData } = useQuery({
    queryKey: ["/api/admin/review-settings"],
  });

  // Ensure settings has default values with proper typing
  const defaultSettings: ReviewSettings = {
    id: 1,
    enableReviews: true,
    autoApproveReviews: false,
    requireOrderToReview: true,
    showReviewsOnWebsite: true,
    maxReviewsPerUser: 5,
    reviewCooldownDays: 7
  };
  
  const settings = settingsData ? (settingsData as ReviewSettings) : defaultSettings;

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: (reviewId: number) => apiRequest(`/api/admin/reviews/${reviewId}/approve`, { method: "PUT" }),
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("reviews.approveSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("reviews.updateError"), variant: "destructive" });
    },
  });

  // Reject review mutation
  const rejectMutation = useMutation({
    mutationFn: ({ reviewId, notes }: { reviewId: number; notes: string }) => 
      apiRequest(`/api/admin/reviews/${reviewId}/reject`, { 
        method: "PUT",
        body: JSON.stringify({ adminNotes: notes }),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("reviews.rejectSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      setSelectedReview(null);
      setAdminNotes("");
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("reviews.updateError"), variant: "destructive" });
    },
  });

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ reviewId, isVisible }: { reviewId: number; isVisible: boolean }) =>
      apiRequest(`/api/admin/reviews/${reviewId}/toggle-visibility`, {
        method: "PUT",
        body: JSON.stringify({ isShowOnWebsite: isVisible }),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("reviews.visibilityUpdateSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("reviews.updateError"), variant: "destructive" });
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => apiRequest(`/api/admin/reviews/${reviewId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("reviews.deleteSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("reviews.updateError"), variant: "destructive" });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settingsData: Partial<ReviewSettings>) =>
      apiRequest("/api/admin/review-settings", {
        method: "PUT",
        body: JSON.stringify(settingsData),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("reviews.settingsUpdateSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/review-settings"] });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("reviews.updateError"), variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t("reviews.pending")}</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">{t("reviews.approved")}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t("reviews.rejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleReject = () => {
    if (selectedReview) {
      rejectMutation.mutate({ reviewId: selectedReview.id, notes: adminNotes });
    }
  };

  if (isLoading) {
    return <AdminLoading />;
  }

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* In RTL: Buttons on left, title on right */}
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Settings className="h-4 w-4" />
                {isRTL ? "الإعدادات" : "Settings"}
              </Button>
            </DialogTrigger>
            <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
              <DialogHeader>
                <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t("reviews.settingsTitle")}</DialogTitle>
                <DialogDescription className={isRTL ? 'text-right' : 'text-left'}>
                  {t("reviews.settingsDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Label className={isRTL ? 'text-right' : 'text-left'}>{t("reviews.enableReviews")}</Label>
                    <Switch
                      checked={settings.enableReviews}
                      onCheckedChange={(checked) =>
                        updateSettingsMutation.mutate({ enableReviews: checked })
                      }
                    />
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Label className={isRTL ? 'text-right' : 'text-left'}>Auto Approve Reviews</Label>
                    <Switch
                      checked={settings.autoApproveReviews}
                      onCheckedChange={(checked) =>
                        updateSettingsMutation.mutate({ autoApproveReviews: checked })
                      }
                    />
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Label className={isRTL ? 'text-right' : 'text-left'}>Require Order to Review</Label>
                    <Switch
                      checked={settings.requireOrderToReview}
                      onCheckedChange={(checked) =>
                        updateSettingsMutation.mutate({ requireOrderToReview: checked })
                      }
                    />
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Label className={isRTL ? 'text-right' : 'text-left'}>Show Reviews on Website</Label>
                    <Switch
                      checked={settings.showReviewsOnWebsite}
                      onCheckedChange={(checked) =>
                        updateSettingsMutation.mutate({ showReviewsOnWebsite: checked })
                      }
                    />
                  </div>
                </div>
            </DialogContent>
          </Dialog>
        </div>
        <h2 className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? "إدارة التقييمات" : "Reviews Management"}
        </h2>
      </div>

      {/* Filter */}
      <div className="flex gap-4 items-center">
        <Label>Filter by Status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No reviews found for the selected filter.
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: CustomerReview) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold">{review.customerName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(review.status)}
                    {review.isShowOnWebsite ? (
                      <Badge variant="outline" className="text-green-600">
                        <Eye className="h-3 w-3 mr-1" />
                        Visible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hidden
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium">English Review:</Label>
                    <p className="mt-1 text-sm">{review.reviewEn}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Arabic Review:</Label>
                    <p className="mt-1 text-sm" dir="rtl">{review.reviewAr}</p>
                  </div>
                </div>

                {review.adminNotes && (
                  <div className="mb-4 p-3 bg-gray-100 rounded">
                    <Label className="text-sm font-medium">Admin Notes:</Label>
                    <p className="mt-1 text-sm">{review.adminNotes}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {review.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(review.id)}
                        disabled={approveMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setSelectedReview(review)}
                        className="flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {review.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibilityMutation.mutate({ 
                        reviewId: review.id, 
                        isVisible: !review.isShowOnWebsite 
                      })}
                      disabled={toggleVisibilityMutation.isPending}
                      className="flex items-center gap-1"
                    >
                      {review.isShowOnWebsite ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {review.isShowOnWebsite ? 'Hide' : 'Show'}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(review.id)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Review Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Review</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this review (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedReview(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                Reject Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}