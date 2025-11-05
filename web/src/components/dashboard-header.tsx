"use client";

import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/city-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const router = useRouter();

  return (
    <header 
      style={{ backgroundColor: 'hsl(var(--background))' }}
      className="sticky top-0 z-40 w-full border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar ao Início</span>
            </Button>
            <div className="hidden md:block">
              <CitySelector />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

