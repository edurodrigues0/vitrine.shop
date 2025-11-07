"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import type { ProductImage as ProductImageType } from "@/dtos/product-image";

interface ProductGalleryProps {
  images: ProductImageType[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <Card className="aspect-square relative overflow-hidden rounded-xl border-2 bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Sem imagens</p>
        </div>
      </Card>
    );
  }

  const currentImage = images[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <Card className="aspect-square relative overflow-hidden rounded-xl border-2 bg-muted group">
          <Image
            src={currentImage.url}
            alt={`${productName} - Imagem ${selectedIndex + 1}`}
            fill
            className="object-cover"
            priority={selectedIndex === 0}
            loading={selectedIndex === 0 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'hsl(var(--background))' }}
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'hsl(var(--background))' }}
                onClick={handleNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Zoom Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 bg-background hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'hsl(var(--background))' }}
            onClick={() => setIsZoomed(true)}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div 
              className="absolute bottom-2 left-2 bg-background px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: 'hsl(var(--background))' }}
            >
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </Card>

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card
                key={image.id}
                className={`aspect-square relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                  index === selectedIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <Image
                  src={image.url}
                  alt={`${productName} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <>
          <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
            onClick={() => setIsZoomed(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="relative max-w-7xl max-h-[90vh] w-full h-full pointer-events-auto"
              style={{ backgroundColor: 'transparent' }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-background hover:bg-background"
                style={{ backgroundColor: 'hsl(var(--background))' }}
                onClick={() => setIsZoomed(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background hover:bg-background"
                    style={{ backgroundColor: 'hsl(var(--background))' }}
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background hover:bg-background"
                    style={{ backgroundColor: 'hsl(var(--background))' }}
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={currentImage.url}
                  alt={`${productName} - Zoom`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              {images.length > 1 && (
                <div 
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background px-4 py-2 rounded text-sm font-medium"
                  style={{ backgroundColor: 'hsl(var(--background))' }}
                >
                  {selectedIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

