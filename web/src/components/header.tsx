"use client";

import { Store, Menu, X, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Cart } from "./cart";
import { CitySelector } from "./city-selector";
import { SearchBar } from "./search-bar";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSobreMenuOpen, setIsSobreMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sobreMenuRef = useRef<HTMLDivElement>(null);

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sobreMenuRef.current &&
        !sobreMenuRef.current.contains(event.target as Node)
      ) {
        setIsSobreMenuOpen(false);
      }
    };

    if (isSobreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSobreMenuOpen]);

  const sobreSubmenuItems = [
    { href: "#como-funciona", label: "Como funciona" },
    { href: "#precos", label: "Preços" },
    { href: "#lojas-parceiras", label: "Lojas parceiras" },
  ];

  return (
    <header
      style={{ backgroundColor: 'hsl(var(--background))' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border shadow-lg"
          : ""
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-xl group relative"
          >
            <div className="relative">
              {/* Icon container - maior e mais destacado */}
              <div className="relative z-10 p-2.5 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-105 transform">
                <Store className="h-6 w-6 text-white transition-colors duration-300" />
              </div>
              {/* Sparkle effect */}
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              Vitrine.shop
            </span>
          </Link>

          {/* Desktop Navigation - Only on Home Page */}
          {isHomePage && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-md hover:bg-accent group"
              >
                <span className="relative z-10">Home</span>
                <span className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 group-hover:w-3/4 group-hover:left-[12.5%] transition-all duration-300 rounded-full" />
              </Link>

              {/* Sobre with Submenu */}
              <div className="relative" ref={sobreMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsSobreMenuOpen(!isSobreMenuOpen)}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-md hover:bg-accent group flex items-center gap-1"
                >
                  <span className="relative z-10">Sobre</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isSobreMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu Dropdown */}
                {isSobreMenuOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-48 border border-border rounded-lg shadow-lg py-2 animate-in slide-in-from-top-2 duration-200 z-50 bg-background"
                    style={{ backgroundColor: 'hsl(var(--popover))' }}
                  >
                    {sobreSubmenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        onClick={() => setIsSobreMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-2.5">
            <div className="hidden lg:block">
              <SearchBar />
            </div>
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
                {isHomePage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden sm:flex hover:scale-105 transition-transform duration-200 font-medium"
                  >
                    <Link href="/login">Entrar</Link>
                  </Button>
                )}
                <Button
                  size="sm"
                  asChild
                  className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group font-semibold"
                >
                  <Link href="/register" className="relative z-10">
                    <span className="relative z-10">Criar minha loja</span>
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
          <div 
            className="md:hidden border-t border-border py-4 space-y-2 animate-in slide-in-from-top-2 duration-300 bg-background"
          >
            {isHomePage && (
              <>
                <Link
                  href="/"
                  className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all duration-200 hover:translate-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <div className="px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setIsSobreMenuOpen(!isSobreMenuOpen)}
                    className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <span>Sobre</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isSobreMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isSobreMenuOpen && (
                    <div className="mt-2 ml-4 space-y-1">
                      {sobreSubmenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsSobreMenuOpen(false);
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="px-4 pt-2 border-t border-border">
              {!isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start mb-2"
                >
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Entrar
                  </Link>
                </Button>
              )}
              <Button
                size="sm"
                asChild
                className="w-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary hover:via-purple-700 hover:to-pink-700 text-white"
              >
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  Criar minha loja
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
