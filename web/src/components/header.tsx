"use client";

import { Store, Menu, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Cart } from "./cart";
import { CitySelector } from "./city-selector";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "#sobre", label: "Sobre" },
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#precos", label: "Preços" },
    { href: "#lojas-parceiras", label: "Lojas Parceiras" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/98 backdrop-blur-xl border-b border-border/60 shadow-lg shadow-primary/5"
          : "bg-background/90 backdrop-blur-lg"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-xl group relative"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/30 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 animate-pulse" />
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-500/40 to-pink-500/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              {/* Icon container */}
              <div className="relative z-10 p-1.5 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all duration-300">
                <Store className="h-5 w-5 text-primary group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 group-hover:scale-110 transform" />
              </div>
              {/* Sparkle effect */}
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            </div>
            <span className="font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent bg-[length:200%_auto] group-hover:bg-[length:100%_auto] transition-all duration-500">
              Vitrine.shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-md hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="relative z-10">{link.label}</span>
                {/* Underline animation */}
                <span className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 group-hover:w-3/4 group-hover:left-[12.5%] transition-all duration-300 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2.5">
            <CitySelector className="hidden md:block" />
            <Cart citySlug={undefined} />
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex hover:scale-105 transition-transform duration-200 font-medium"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="hidden sm:flex hover:scale-105 transition-transform duration-200 font-medium"
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex hover:scale-105 transition-transform duration-200 font-medium"
                >
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 relative overflow-hidden group font-semibold"
                >
                  <Link href="/register" className="relative z-10">
                    <span className="relative z-10">Criar minha loja</span>
                    {/* Shine effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:scale-110 transition-transform duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative">
                {isMenuOpen ? (
                  <X className="h-5 w-5 animate-in spin-in duration-300" />
                ) : (
                  <Menu className="h-5 w-5 animate-in fade-in duration-300" />
                )}
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-2 animate-in slide-in-from-top-2 duration-300 bg-background/98 backdrop-blur-xl">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5 rounded-md transition-all duration-200 hover:translate-x-1"
                onClick={() => setIsMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-2 border-t border-border/50">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5"
              >
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Entrar
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
