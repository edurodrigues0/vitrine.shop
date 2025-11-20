"use client";

import { useState } from "react";
import { ImageUpload } from "./image-upload";
import { uploadService } from "@/services/upload-service";
import { Loader2 } from "lucide-react";

interface StoreImageUploadProps {
  storeId: string;
  type: "logo" | "banner";
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: Error) => void;
}

export function StoreImageUpload({
  storeId,
  type,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
}: StoreImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      let url: string;

      if (type === "logo") {
        url = await uploadService.uploadStoreLogo(storeId, file);
      } else {
        url = await uploadService.uploadStoreBanner(storeId, file);
      }

      onUploadSuccess(url);
      return url;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      if (onUploadError) {
        onUploadError(error as Error);
      }
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const aspectRatio = type === "logo" ? "aspect-square" : "aspect-video";
  const label = type === "logo" ? "Logo da Loja" : "Banner da Loja";
  const accept = "image/jpeg,image/png,image/webp";

  return (
    <div className="space-y-2">
      <ImageUpload
        label=""
        accept="image/*"
        currentImageUrl={currentImageUrl}
        onUpload={handleUpload}
        onUploadComplete={onUploadSuccess}
      />
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Enviando {type === 'logo' ? 'logo' : 'banner'}...</span>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Formatos suportados: JPG, PNG, WebP. Tamanho máximo: 5MB
      </p>
    </div>
  );
}
