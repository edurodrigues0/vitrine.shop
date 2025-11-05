"use client";

import { AuthLayout } from "@/components/auth-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Store,
  Package,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/loja", label: "Minha Loja", icon: Store },
  { href: "/dashboard/produtos", label: "Produtos", icon: Package },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/dashboard/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // Buscar loja do usuário para mostrar o logo
  const { data: storesData } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () => storesService.findAll(),
    enabled: !!user?.id,
  });

  const userStore = storesData?.stores.find(
    (store) => store.ownerId === user?.id,
  );

  // Estado do sidebar expansível
  // Inicializar sempre como true para evitar mismatch de hidratação
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Carregar preferência do localStorage apenas no cliente após montagem
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("dashboard-sidebar-expanded");
    if (saved !== null) {
      setIsExpanded(saved === "true");
    }
  }, []);

  // Salvar preferência no localStorage quando mudar
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("dashboard-sidebar-expanded", String(isExpanded));
    }
  }, [isExpanded, isMounted]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex">
          {/* Sidebar */}
          <aside
            className={cn(
              "hidden lg:flex flex-col border-r border-border bg-muted transition-all duration-300",
              isExpanded ? "w-64" : "w-16"
            )}
          >
            {/* Logo da Loja e Toggle */}
            <div className="p-6 border-b border-border relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="absolute top-2 right-2 h-6 w-6"
                aria-label={isExpanded ? "Recolher sidebar" : "Expandir sidebar"}
              >
                {isExpanded ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              {isExpanded ? (
                <>
                  {userStore?.logoUrl ? (
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative h-16 w-16">
                        <Image
                          src={userStore.logoUrl}
                          alt={userStore.name}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Store className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  )}
                  <h1 className="text-xl font-bold text-center">Dashboard</h1>
                </>
              ) : (
                <div className="flex items-center justify-center">
                  {userStore?.logoUrl ? (
                    <div className="relative h-10 w-10">
                      <Image
                        src={userStore.logoUrl}
                        alt={userStore.name}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  ) : (
                    <Store className="h-6 w-6 text-primary" />
                  )}
                </div>
              )}
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg transition-colors",
                      isExpanded ? "px-4 py-2" : "px-2 py-2 justify-center",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {isExpanded && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                className={cn(
                  "w-full transition-colors",
                  isExpanded ? "justify-start" : "justify-center px-2"
                )}
                onClick={() => logout()}
                title={!isExpanded ? "Sair" : undefined}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span className="ml-3">Sair</span>}
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="container mx-auto px-4 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthLayout>
  );
}

