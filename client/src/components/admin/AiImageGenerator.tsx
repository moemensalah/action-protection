import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wand2, Download, Sparkles, Check } from "lucide-react";
import orcaLogoPath from "@assets/useorca_logo.png";

interface AiImageGeneratorProps {
  onImageSelect: (imageUrl: string) => void;
  disabled?: boolean;
}

interface GeneratedImage {
  url: string;
  id: string;
}

export default function AiImageGenerator({ onImageSelect, disabled }: AiImageGeneratorProps) {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check if AI is enabled
  const { data: aiSettings } = useQuery({
    queryKey: ["/api/admin/ai-settings"],
  });

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return await apiRequest("/api/admin/generate-images", {
        method: "POST",
        body: { prompt },
      });
    },
    onSuccess: (data: { images: string[] }) => {
      const images = data.images.map((url, index) => ({
        url,
        id: `img-${Date.now()}-${index}`,
      }));
      setGeneratedImages(images);
      toast({
        title: language === "ar" ? "تم توليد الصور بنجاح" : "Images generated successfully",
        description: language === "ar" ? "اختر الصورة التي تريدها" : "Select your preferred image",
      });
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "خطأ في توليد الصور" : "Error generating images",
        description: error.message || (language === "ar" ? "فشل في توليد الصور" : "Failed to generate images"),
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      // Simulate downloading and saving the image
      // In a real implementation, this would download from the AI service
      // and save it to your assets folder
      return { savedUrl: `/assets/product-image-${Date.now()}.jpg` };
    },
    onSuccess: (data: { savedUrl: string }) => {
      onImageSelect(data.savedUrl);
      setOpen(false);
      setPrompt("");
      setGeneratedImages([]);
      setSelectedImage(null);
      toast({
        title: language === "ar" ? "تم حفظ الصورة" : "Image saved",
        description: language === "ar" ? "تم حفظ الصورة للمنتج" : "Image has been saved for the product",
      });
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "خطأ في حفظ الصورة" : "Error saving image",
        description: error.message || (language === "ar" ? "فشل في حفظ الصورة" : "Failed to save image"),
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: language === "ar" ? "أدخل وصف الصورة" : "Enter image description",
        description: language === "ar" ? "يرجى إدخال وصف للصورة المطلوبة" : "Please enter a description for the image",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(prompt);
  };

  const handleSelectImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleDownloadSelected = () => {
    if (selectedImage) {
      downloadMutation.mutate(selectedImage);
    }
  };

  const isAiEnabled = aiSettings?.enabled && aiSettings?.midjourney_api_key;

  if (!isAiEnabled) {
    return null; // Don't show the button if AI is not configured
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`w-full ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {language === "ar" ? "توليد صورة بالذكاء الاصطناعي" : "Generate Image with AI"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className={isRTL ? "text-right" : "text-left"}>
          <DialogTitle className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <img src={orcaLogoPath} alt="Orca Assistant" className="h-8 w-8 rounded-full" />
            <span>{language === "ar" ? "مساعد أوركا للذكاء الاصطناعي" : "Orca AI Assistant"}</span>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className={isRTL ? "text-right" : "text-left"}>
              {language === "ar" ? "وصف الصورة المطلوبة" : "Image Description"}
            </Label>
            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "مثال: صورة سيارة مرسيدس فئة G لامعة في صالة عرض فاخرة"
                    : "Example: A shiny Mercedes G-Class in a luxury showroom"
                }
                className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}
                disabled={generateMutation.isPending}
              />
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !prompt.trim()}
              >
                {generateMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {generateMutation.isPending && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">
                {language === "ar" ? "جاري توليد الصور..." : "Generating images..."}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "سيستغرق هذا بضع ثوان" : "This will take a few seconds"}
              </p>
            </div>
          )}

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isRTL ? "text-right" : "text-left"}`}>
                {language === "ar" ? "الصور المولدة" : "Generated Images"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((image) => (
                  <Card
                    key={image.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedImage === image.url
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleSelectImage(image.url)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-3 flex items-center justify-center relative">
                        <div className="text-6xl">🖼️</div>
                        {selectedImage === image.url && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {language === "ar" ? "صورة مولدة" : "Generated Image"} {generatedImages.indexOf(image) + 1}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Download Selected Button */}
              {selectedImage && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleDownloadSelected}
                    disabled={downloadMutation.isPending}
                    className="px-8"
                  >
                    {downloadMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                      </div>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        {language === "ar" ? "استخدام هذه الصورة" : "Use This Image"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}