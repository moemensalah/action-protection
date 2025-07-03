import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save, Play, Image } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExperienceSection {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  videoUrl: string;
  backgroundImage: string;
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
    videoUrl: "",
    backgroundImage: "",
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
      return await apiRequest("/api/admin/experience-section", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Experience section updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/experience-section"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update experience section",
        variant: "destructive",
      });
    },
  });

  // File upload mutation (for images and videos)
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File, type: 'image' | 'video' }) => {
      const formData = new FormData();
      formData.append(type, file);
      
      const endpoint = type === 'image' ? '/api/upload/image' : '/api/upload/video';
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return await response.json();
    },
    onSuccess: (data, { type }) => {
      const fieldName = type === 'image' ? 'backgroundImage' : 'videoUrl';
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
      toast({
        title: "Success",
        description: `${type === 'image' ? 'Image' : 'Video'} uploaded successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate({ file, type: 'image' });
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate({ file, type: 'video' });
    }
  };

  const handleSave = () => {
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
        {/* Text Content */}
        <Card>
          <CardHeader>
            <CardTitle>Text Content</CardTitle>
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

        {/* Media Files */}
        <Card>
          <CardHeader>
            <CardTitle>Media Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Background Image */}
            <div>
              <Label className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Background Image
              </Label>
              <div className="mt-2 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadMutation.isPending}
                />
                {formData.backgroundImage && (
                  <div className="relative">
                    <img 
                      src={formData.backgroundImage} 
                      alt="Background Preview" 
                      className="w-full h-32 object-cover rounded border"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      Background
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video */}
            <div>
              <Label className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Experience Video
              </Label>
              <div className="mt-2 space-y-2">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploadMutation.isPending}
                />
                <Input
                  value={formData.videoUrl || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="Or enter video URL directly"
                />
                {formData.videoUrl && (
                  <div className="relative">
                    <video 
                      src={formData.videoUrl} 
                      className="w-full h-48 rounded border"
                      controls
                      preload="metadata"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      Experience Video
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {(formData.titleEn || formData.titleAr || formData.descriptionEn || formData.descriptionAr) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-900 text-white p-8 rounded-lg overflow-hidden">
              {/* Background Image */}
              {formData.backgroundImage && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url(${formData.backgroundImage})` }}
                />
              )}
              
              <div className="relative z-10 text-center space-y-4">
                <h2 className="text-4xl font-bold">
                  {formData.titleEn}
                </h2>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                  {formData.descriptionEn}
                </p>
                
                {formData.videoUrl && (
                  <div className="flex justify-center mt-6">
                    <div className="bg-black bg-opacity-50 p-2 rounded">
                      <Play className="h-8 w-8" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Arabic Version */}
            <div className="relative bg-gray-800 text-white p-8 rounded-lg overflow-hidden mt-4" dir="rtl">
              {formData.backgroundImage && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url(${formData.backgroundImage})` }}
                />
              )}
              
              <div className="relative z-10 text-center space-y-4">
                <h2 className="text-4xl font-bold">
                  {formData.titleAr}
                </h2>
                <p className="text-lg opacity-90 max-w-2xl mx-auto">
                  {formData.descriptionAr}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}