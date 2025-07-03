import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Play, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExperienceSection {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  video1Url?: string;
  video2Url?: string;
  text1En: string;
  text1Ar: string;
  text2En: string;
  text2Ar: string;
  isActive: boolean;
}

export function ExperienceSectionManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<ExperienceSection>>({
    titleEn: "EXPERIENCE TRUE LUXURY",
    titleAr: "اختبر الفخامة الحقيقية",
    descriptionEn: "Discover premium vehicle protection services that exceed expectations",
    descriptionAr: "اكتشف خدمات حماية المركبات المتميزة التي تتجاوز التوقعات",
    video1Url: "",
    video2Url: "",
    text1En: "YOUR CAR IS SPECIAL WITH US",
    text1Ar: "سيارتك متميزة معانا",
    text2En: "SUPERIOR PROTECTION FOR LUXURY CARS",
    text2Ar: "حماية فائقة للسيارات الفاخرة",
    isActive: true
  });

  // Fetch experience section data
  const { data: experienceSection, isLoading } = useQuery({
    queryKey: ["/api/experience-section"],
  });

  useEffect(() => {
    if (experienceSection) {
      setFormData(experienceSection);
    }
  }, [experienceSection]);

  // Update experience section mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ExperienceSection>) => {
      return await apiRequest(`/api/admin/experience-section`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Experience section updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/experience-section"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update experience section",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    console.log("Frontend: Form data being sent:", formData);
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-6">Loading experience section...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Experience Section Management</h2>
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Header Content */}
        <Card>
          <CardHeader>
            <CardTitle>Section Header</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title (English)</Label>
                <Input
                  value={formData.titleEn || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                  placeholder="EXPERIENCE TRUE LUXURY"
                />
              </div>
              <div>
                <Label>Title (Arabic)</Label>
                <Input
                  value={formData.titleAr || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                  placeholder="اختبر الفخامة الحقيقية"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Description (English)</Label>
                <Textarea
                  value={formData.descriptionEn || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                  placeholder="Discover premium vehicle protection services that exceed expectations"
                  rows={4}
                />
              </div>
              <div>
                <Label>Description (Arabic)</Label>
                <Textarea
                  value={formData.descriptionAr || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                  placeholder="اكتشف خدمات حماية المركبات المتميزة التي تتجاوز التوقعات"
                  dir="rtl"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Video Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>First Video URL</Label>
              <Input
                value={formData.video1Url || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, video1Url: e.target.value }))}
                placeholder="/assets/video1.mp4"
              />
              {formData.video1Url && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <video
                    src={formData.video1Url}
                    className="w-full h-32 object-cover rounded"
                    controls
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Second Video URL</Label>
              <Input
                value={formData.video2Url || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, video2Url: e.target.value }))}
                placeholder="/assets/video2.mp4"
              />
              {formData.video2Url && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <video
                    src={formData.video2Url}
                    className="w-full h-32 object-cover rounded"
                    controls
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Text Messages for Video 1 */}
        <Card>
          <CardHeader>
            <CardTitle>First Video Text Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Text 1 (English)</Label>
              <Input
                value={formData.text1En || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, text1En: e.target.value }))}
                placeholder="YOUR CAR IS SPECIAL WITH US"
              />
            </div>
            <div>
              <Label>Text 1 (Arabic)</Label>
              <Input
                value={formData.text1Ar || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, text1Ar: e.target.value }))}
                placeholder="سيارتك متميزة معانا"
                dir="rtl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Text Messages for Video 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Second Video Text Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Text 2 (English)</Label>
              <Input
                value={formData.text2En || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, text2En: e.target.value }))}
                placeholder="SUPERIOR PROTECTION FOR LUXURY CARS"
              />
            </div>
            <div>
              <Label>Text 2 (Arabic)</Label>
              <Input
                value={formData.text2Ar || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, text2Ar: e.target.value }))}
                placeholder="حماية فائقة للسيارات الفاخرة"
                dir="rtl"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">{formData.titleEn}</h3>
              <p className="text-gray-600 dark:text-gray-300">{formData.descriptionEn}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold mb-2">Video 1</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Text: {formData.text1En}
                </div>
                {formData.video1Url && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ Video configured
                  </div>
                )}
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold mb-2">Video 2</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Text: {formData.text2En}
                </div>
                {formData.video2Url && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ Video configured
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}