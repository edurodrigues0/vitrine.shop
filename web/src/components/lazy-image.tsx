"use client";

import { useState, useEffect, useRef, memo } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

interface LazyImageProps extends Omit<ComponentProps<typeof Image>, "loading"> {
  fallback?: React.ReactNode;
  showLoader?: boolean;
}

function LazyImageComponent({
  src,
  alt,
  className,
  fallback,
  showLoader = true,
  ...props
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Se já estiver na viewport, carregar imediatamente
    if (imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight + 50 && rect.bottom > -50;
      if (isVisible) {
        setIsInView(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Começar a carregar 50px antes de entrar na viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div ref={imgRef} className={`relative ${className || ""}`}>
      {isLoading && showLoader && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {isInView ? (
        <Image
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          {...props}
        />
      ) : (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

// Memoizar o componente para evitar re-renders desnecessários
export const LazyImage = memo(LazyImageComponent);

