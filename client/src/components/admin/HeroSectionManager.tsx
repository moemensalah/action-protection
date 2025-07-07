import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Trash2, Save, Image, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";
import type { HeroSection, InsertHeroSection } from "@shared/schema";
import { AdminLoading } from "@/components/ui/admin-loading";

interface TypingWord {
  en: string;
  ar: string;
}

export function HeroSectionManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language, isRTL, t } = useLanguage();
  
  const [formData, setFormData] = useState<Partial<HeroSection>>({
    backgroundImages: [],
    typingWords: [],
    mainTitleEn: "Action Protection",
    mainTitleAr: "أكشن بروتكشن",
    subtitleEn: "Premium Vehicle Protection Services",
    subtitleAr: "خدمات حماية المركبات المتميزة",
    isActive: true
  });

  const [newWord, setNewWord] = useState<TypingWord>({ en: "", ar: "" });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch hero section data
  const { data: heroSection, isLoading } = useQuery<HeroSection>({
    queryKey: ["/api/hero-section"],
  });

  useEffect(() => {
    if (heroSection) {
      setFormData({
        ...heroSection,
        typingWords: Array.isArray(heroSection.typingWords) ? heroSection.typingWords : [],
        backgroundImages: Array.isArray(heroSection.backgroundImages) ? heroSection.backgroundImages : []
      });
    }
  }, [heroSection]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<HeroSection>) => {
      await apiRequest("/api/admin/hero-section", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("hero.updateSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-section"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("hero.updateError"),
        variant: "destructive",
      });
      console.error("Hero section update error:", error);
    },
  });

  const handleInputChange = (field: keyof HeroSection, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTypingWord = () => {
    if (newWord.en.trim() && newWord.ar.trim()) {
      const currentWords = Array.isArray(formData.typingWords) ? formData.typingWords : [];
      setFormData(prev => ({
        ...prev,
        typingWords: [...currentWords, newWord]
      }));
      setNewWord({ en: "", ar: "" });
    }
  };

  const handleRemoveTypingWord = (index: number) => {
    const currentWords = Array.isArray(formData.typingWords) ? formData.typingWords : [];
    setFormData(prev => ({
      ...prev,
      typingWords: currentWords.filter((_, i) => i !== index)
    }));
  };



  const handleRemoveBackgroundImage = (index: number) => {
    const currentImages = Array.isArray(formData.backgroundImages) ? formData.backgroundImages : [];
    setFormData(prev => ({
      ...prev,
      backgroundImages: currentImages.filter((_, i) => i !== index)
    }));
  };

  // Handle file upload for background images
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          uploadedUrls.push(result.url);
        } else {
          console.error('Upload failed:', response.statusText);
        }
      }
      
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          backgroundImages: [...(Array.isArray(prev.backgroundImages) ? prev.backgroundImages : []), ...uploadedUrls]
        }));
        
        toast({
          title: isRTL ? "نجح" : "Success",
          description: isRTL ? `تم رفع ${uploadedUrls.length} صورة بنجاح` : `${uploadedUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل في رفع الصور" : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleSave = () => {
    // Exclude logoImage from the data sent to API since it's no longer editable
    const { logoImage, ...dataToSave } = formData;
    console.log('Hero Section Data to Save:', dataToSave);
    updateMutation.mutate(dataToSave);
  };

  if (isLoading) {
    return <AdminLoading />;
  }

  const currentTypingWords = Array.isArray(formData.typingWords) ? formData.typingWords : [];
  const currentBackgroundImages = Array.isArray(formData.backgroundImages) ? formData.backgroundImages : [];

  return (
    <div className={`p-6 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* In RTL: Button on left, title on right */}
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? (isRTL ? "جار الحفظ..." : "Saving...") : (isRTL ? "حفظ" : "Save")}
        </Button>
        <h2 className={`text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
          {isRTL ? "إدارة القسم الرئيسي" : "Hero Section Management"}
        </h2>
      </div>

      {/* Background Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>{t("hero.backgroundImages")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className={isRTL ? 'text-right' : 'text-left'}>{t("hero.uploadImage")}</Label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  id="hero-image-upload"
                />
                <label 
                  htmlFor="hero-image-upload" 
                  className={`file-input-button ${isRTL ? 'rtl' : 'ltr'} ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`flex items-center gap-2 justify-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Upload className="h-4 w-4" />
                    <span>
                      {uploadingImage 
                        ? (isRTL ? "جار الرفع..." : "Uploading...") 
                        : (isRTL ? "اختر الملفات" : "Choose Files")
                      }
                    </span>
                  </div>
                </label>
              </div>
              <p className={`text-sm text-muted-foreground mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? "اختر صور متعددة لرفعها كخلفيات. الصيغ المدعومة: JPG، PNG، GIF" : "Select multiple images to upload as background images. Supported formats: JPG, PNG, GIF"}
              </p>
            </div>
          </div>
          
          {/* Display Current Background Images */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right' : 'text-left'}>
              {isRTL ? `الصور الحالية للخلفية (${currentBackgroundImages.length})` : `Current Background Images (${currentBackgroundImages.length})`}
            </Label>
            {currentBackgroundImages.length === 0 ? (
              <p className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? "لم يتم إضافة صور خلفية بعد." : "No background images added yet."}
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentBackgroundImages.map((imageUrl: string, index: number) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-muted">
                      <img 
                        src={imageUrl} 
                        alt={`Background image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect width='100' height='60' fill='%23f3f4f6'/%3E%3Ctext x='50' y='35' text-anchor='middle' fill='%23666' font-size='12'%3EImage not found%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveBackgroundImage(index)}
                        className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <X className="h-3 w-3" />
                        {t("common.remove")}
                      </Button>
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 bg-black/75 text-white text-xs p-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t("common.image")} {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>





      {/* Typing Words Animation Section */}
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>{t("hero.typingWords")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'direction-rtl' : ''}`}>
            <div>
              <Label className={isRTL ? 'text-right' : 'text-left'}>{t("hero.englishWord")}</Label>
              <Input
                value={newWord.en}
                onChange={(e) => setNewWord(prev => ({ ...prev, en: e.target.value }))}
                placeholder="YOUR CAR PROTECTION GUARANTEED"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right' : 'text-left'}>{t("hero.arabicWord")}</Label>
              <Input
                value={newWord.ar}
                onChange={(e) => setNewWord(prev => ({ ...prev, ar: e.target.value }))}
                placeholder="حماية سيارتك مضمونة"
                dir="rtl"
                className={isRTL ? 'text-right' : ''}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddTypingWord}
            disabled={!newWord.en.trim() || !newWord.ar.trim()}
            className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className="h-4 w-4" />
            {t("hero.addWord")}
          </Button>
          
          {/* Display Current Typing Words */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right' : 'text-left'}>{t("hero.currentTypingWords")} ({currentTypingWords.length})</Label>
            {currentTypingWords.length === 0 ? (
              <p className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t("hero.noTypingWords")}</p>
            ) : (
              <div className="space-y-2">
                {currentTypingWords.map((word: TypingWord, index: number) => (
                  <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`grid grid-cols-2 gap-4 flex-1 ${isRTL ? 'direction-rtl' : ''}`}>
                      <span className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}><strong>EN:</strong> {word.en}</span>
                      <span className="text-sm text-right" dir="rtl"><strong>AR:</strong> {word.ar}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveTypingWord(index)}
                      className={isRTL ? 'mr-2' : 'ml-2'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}