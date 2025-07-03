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
import type { HeroSection, InsertHeroSection } from "@shared/schema";

interface TypingWord {
  en: string;
  ar: string;
}

export function HeroSectionManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<HeroSection>>({
    backgroundImages: [],
    logoImage: "",
    typingWords: [],
    mainTitleEn: "Action Protection",
    mainTitleAr: "أكشن بروتكشن",
    subtitleEn: "Premium Vehicle Protection Services",
    subtitleAr: "خدمات حماية المركبات المتميزة",
    isActive: true
  });

  const [newWord, setNewWord] = useState<TypingWord>({ en: "", ar: "" });
  const [newBackgroundImage, setNewBackgroundImage] = useState("");

  // Fetch hero section data
  const { data: heroSection, isLoading } = useQuery({
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
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hero section updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-section"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update hero section. Please try again.",
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

  const handleAddBackgroundImage = () => {
    if (newBackgroundImage.trim()) {
      const currentImages = Array.isArray(formData.backgroundImages) ? formData.backgroundImages : [];
      setFormData(prev => ({
        ...prev,
        backgroundImages: [...currentImages, newBackgroundImage]
      }));
      setNewBackgroundImage("");
    }
  };

  const handleRemoveBackgroundImage = (index: number) => {
    const currentImages = Array.isArray(formData.backgroundImages) ? formData.backgroundImages : [];
    setFormData(prev => ({
      ...prev,
      backgroundImages: currentImages.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-6">Loading hero section...</div>;
  }

  const currentTypingWords = Array.isArray(formData.typingWords) ? formData.typingWords : [];
  const currentBackgroundImages = Array.isArray(formData.backgroundImages) ? formData.backgroundImages : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Hero Section Management</h2>
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Background Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Background Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Add New Background Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={newBackgroundImage}
                  onChange={(e) => setNewBackgroundImage(e.target.value)}
                  placeholder="/assets/g-class-cinematic-bg.png"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddBackgroundImage}
                  disabled={!newBackgroundImage.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Image
                </Button>
              </div>
            </div>
          </div>
          
          {/* Display Current Background Images */}
          <div className="space-y-2">
            <Label>Current Background Images ({currentBackgroundImages.length})</Label>
            {currentBackgroundImages.length === 0 ? (
              <p className="text-muted-foreground">No background images added yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {currentBackgroundImages.map((imageUrl: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Image className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Image {index + 1}</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{imageUrl}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveBackgroundImage(index)}
                      className="flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logo Image Section */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Logo Image URL</Label>
            <Input
              value={formData.logoImage || ""}
              onChange={(e) => handleInputChange("logoImage", e.target.value)}
              placeholder="/assets/action-protection-logo-dark.png"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Titles Section */}
      <Card>
        <CardHeader>
          <CardTitle>Main Titles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>English Title</Label>
              <Input
                value={formData.mainTitleEn || ""}
                onChange={(e) => handleInputChange("mainTitleEn", e.target.value)}
                placeholder="Action Protection"
              />
            </div>
            <div>
              <Label>Arabic Title</Label>
              <Input
                value={formData.mainTitleAr || ""}
                onChange={(e) => handleInputChange("mainTitleAr", e.target.value)}
                placeholder="أكشن بروتكشن"
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtitles Section */}
      <Card>
        <CardHeader>
          <CardTitle>Subtitles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>English Subtitle</Label>
              <Textarea
                value={formData.subtitleEn || ""}
                onChange={(e) => handleInputChange("subtitleEn", e.target.value)}
                placeholder="Premium Vehicle Protection Services"
                rows={3}
              />
            </div>
            <div>
              <Label>Arabic Subtitle</Label>
              <Textarea
                value={formData.subtitleAr || ""}
                onChange={(e) => handleInputChange("subtitleAr", e.target.value)}
                placeholder="خدمات حماية المركبات المتميزة"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typing Words Animation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Typing Words Animation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>English Word</Label>
              <Input
                value={newWord.en}
                onChange={(e) => setNewWord(prev => ({ ...prev, en: e.target.value }))}
                placeholder="YOUR CAR PROTECTION GUARANTEED"
              />
            </div>
            <div>
              <Label>Arabic Word</Label>
              <Input
                value={newWord.ar}
                onChange={(e) => setNewWord(prev => ({ ...prev, ar: e.target.value }))}
                placeholder="حماية سيارتك مضمونة"
                dir="rtl"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleAddTypingWord}
            disabled={!newWord.en.trim() || !newWord.ar.trim()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Typing Word
          </Button>
          
          {/* Display Current Typing Words */}
          <div className="space-y-2">
            <Label>Current Typing Words ({currentTypingWords.length})</Label>
            {currentTypingWords.length === 0 ? (
              <p className="text-muted-foreground">No typing words added yet.</p>
            ) : (
              <div className="space-y-2">
                {currentTypingWords.map((word: TypingWord, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <span className="text-sm"><strong>EN:</strong> {word.en}</span>
                      <span className="text-sm text-right" dir="rtl"><strong>AR:</strong> {word.ar}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveTypingWord(index)}
                      className="ml-2"
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