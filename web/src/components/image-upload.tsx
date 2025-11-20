"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
  currentImageUrl?: string;
  label?: string;
  accept?: string;
  maxSize?: number; // Em bytes
}

export function ImageUpload({
  onUploadComplete,
  onUpload,
  currentImageUrl,
  label = "Upload de Imagem",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB padrão
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      showError("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validar tamanho
    if (file.size > maxSize) {
      showError(
        `O arquivo é muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      );
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      
      // Resetar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Se houver um callback de upload, chamá-lo
      if (onUpload) {
        setIsUploading(true);
        onUpload(file)
          .then((url) => {
            onUploadComplete(url);
            showSuccess("Imagem enviada com sucesso!");
          })
          .catch((error) => {
            console.error("Erro ao fazer upload da imagem:", error);
            showError("Erro ao fazer upload da imagem. Tente novamente.");
            setPreview(null);
          })
          .finally(() => {
            setIsUploading(false);
          });
      } else {
        onUploadComplete(reader.result as string);
      }
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      showError("Por favor, selecione um arquivo");
      return;
    }

    setIsUploading(true);

    try {
      if (onUpload) {
        // Usar função de upload personalizada se fornecida
        const url = await onUpload(file);
        onUploadComplete(url);
        showSuccess("Imagem carregada com sucesso!");
      } else {
        // Fallback: usar data URL como preview
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          onUploadComplete(dataUrl);
          showSuccess("Imagem carregada com sucesso!");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Erro ao fazer upload da imagem",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">{label}</label>

      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Arraste uma imagem aqui ou clique para selecionar
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Imagem
          </Button>
        </div>
      )}

      {preview && !currentImageUrl && (
        <Button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Fazendo upload...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Confirmar Upload
            </>
          )}
        </Button>
      )}
    </div>
  );
}

