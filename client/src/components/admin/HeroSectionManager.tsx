import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Trash2, Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TypingWord {
  en: string;
  ar: string;
}

interface HeroSection {
  id: number;
  backgroundImage: string;
  logoImage: string;
  typingWords: TypingWord[];
  mainTitleEn: string;
  mainTitleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  isActive: boolean;
}

export function HeroSectionManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<HeroSection>>({
    backgroundImage: "",
    logoImage: "",
    typingWords: [],
    mainTitleEn: "Action Protection",
    mainTitleAr: "أكشن بروتكشن",
    subtitleEn: "Premium Vehicle Protection Services",
    subtitleAr: "خدمات حماية المركبات المتميزة",
    isActive: true
  });

  const [newWord, setNewWord] = useState<TypingWord>({ en: "", ar: "" });

  // Fetch hero section data
  const { data: heroSection, isLoading } = useQuery({
    queryKey: ["/api/hero-section"],
  });

  useEffect(() => {
    if (heroSection) {
      setFormData(heroSection);
    }
  }, [heroSection]);

  // Update hero section mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<HeroSection>) => {
      return await apiRequest("/api/admin/hero-section", {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hero section updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hero-section"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hero section",
        variant: "destructive",
      });
    },
  });

  // Image upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return await response.json();
    },
    onSuccess: (data, file, context: any) => {
      const fieldName = context as 'backgroundImage' | 'logoImage';
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, fieldName: 'backgroundImage' | 'logoImage') => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file, { context: fieldName } as any);
    }
  };

  const handleAddTypingWord = () => {
    if (newWord.en.trim() && newWord.ar.trim()) {
      setFormData(prev => ({
        ...prev,
        typingWords: [...(prev.typingWords || []), newWord]
      }));
      setNewWord({ en: "", ar: "" });
    }
  };

  const handleRemoveTypingWord = (index: number) => {
    setFormData(prev => ({
      ...prev,
      typingWords: prev.typingWords?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-6">Loading hero section...</div>;
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Images Section */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Background Image */}
            <div>
              <Label>Background Image</Label>
              <div className="mt-2 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                  disabled={uploadMutation.isPending}
                />
                {formData.backgroundImage && (
                  <div className="relative">
                    <img 
                      src={formData.backgroundImage} 
                      alt="Background Preview" 
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Logo Image */}
            <div>
              <Label>Logo Image</Label>
              <div className="mt-2 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'logoImage')}
                  disabled={uploadMutation.isPending}
                />
                {formData.logoImage && (
                  <div className="relative">
                    <img 
                      src={formData.logoImage} 
                      alt="Logo Preview" 
                      className="w-full h-32 object-contain rounded border bg-gray-100"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Text Content */}
        <Card>
          <CardHeader>
            <CardTitle>Text Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Main Title (English)</Label>
                <Input
                  value={formData.mainTitleEn || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, mainTitleEn: e.target.value }))}
                  placeholder="Action Protection"
                />
              </div>
              <div>
                <Label>Main Title (Arabic)</Label>
                <Input
                  value={formData.mainTitleAr || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, mainTitleAr: e.target.value }))}
                  placeholder="أكشن بروتكشن"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subtitle (English)</Label>
                <Textarea
                  value={formData.subtitleEn || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitleEn: e.target.value }))}
                  placeholder="Premium Vehicle Protection Services"
                />
              </div>
              <div>
                <Label>Subtitle (Arabic)</Label>
                <Textarea
                  value={formData.subtitleAr || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitleAr: e.target.value }))}
                  placeholder="خدمات حماية المركبات المتميزة"
                  dir="rtl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Typing Words Section */}
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
                placeholder="PROTECTION"
              />
            </div>
            <div>
              <Label>Arabic Word</Label>
              <Input
                value={newWord.ar}
                onChange={(e) => setNewWord(prev => ({ ...prev, ar: e.target.value }))}
                placeholder="الحماية"
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
            Add Word
          </Button>

          {/* Current Words */}
          <div className="space-y-2">
            <Label>Current Typing Words:</Label>
            {formData.typingWords?.map((word, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex gap-4">
                  <span className="font-medium">{word.en}</span>
                  <span className="text-gray-600" dir="rtl">{word.ar}</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveTypingWord(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(!formData.typingWords || formData.typingWords.length === 0) && (
              <p className="text-gray-500 text-sm">No typing words added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}