"use client";

import { AuthLayout } from "@/components/auth-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/use-auth";
import { useSelectedStore, SelectedStoreProvider } from "@/hooks/use-selected-store";
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
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/loja", label: "Minha Loja", icon: Store },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/estatisticas", label: "Estatísticas e Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { selectedStore } = useSelectedStore();

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
    <div className="flex h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar user={user} selectedStore={selectedStore} items={menuItems} />
        <SidebarInset className="flex flex-col h-screen">
          <SiteHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 page-transition">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )

  // Backup
  // return (
  //   <>
  //     <DashboardHeader />
  //     <div className="min-h-screen bg-background">
  //       <div className="flex">
  //         {/* Sidebar */}
  //         <aside
  //           className={cn(
  //             "hidden lg:flex flex-col border-r border-border bg-muted transition-all duration-300",
  //             isExpanded ? "w-64" : "w-16"
  //           )}
  //         >
  //           {/* Logo da Loja e Toggle */}
  //           <div className="p-6 border-b border-border relative">
  //             <Button
  //               variant="ghost"
  //               size="icon"
  //               onClick={toggleSidebar}
  //               className="absolute top-2 right-2 h-6 w-6"
  //               aria-label={isExpanded ? "Recolher sidebar" : "Expandir sidebar"}
  //             >
  //               {isExpanded ? (
  //                 <ChevronLeft className="h-4 w-4" />
  //               ) : (
  //                 <ChevronRight className="h-4 w-4" />
  //               )}
  //             </Button>
  //             {isExpanded ? (
  //               <>
  //                 {selectedStore?.logoUrl ? (
  //                   <div className="flex items-center justify-center mb-4">
  //                     <div className="relative h-16 w-16">
  //                       <Image
  //                         src={selectedStore.logoUrl}
  //                         alt={selectedStore.name}
  //                         fill
  //                         className="object-contain rounded"
  //                         unoptimized
  //                       />
  //                     </div>
  //                   </div>
  //                 ) : (
  //                   <div className="flex items-center justify-center mb-4">
  //                     <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
  //                       <Store className="h-8 w-8 text-primary" />
  //                     </div>
  //                   </div>
  //                 )}
  //                 <h1 className="text-xl font-bold text-center">Dashboard</h1>
  //               </>
  //             ) : (
  //               <div className="flex items-center justify-center">
  //                 {selectedStore?.logoUrl ? (
  //                   <div className="relative h-10 w-10">
  //                     <Image
  //                       src={selectedStore.logoUrl}
  //                       alt={selectedStore.name}
  //                       fill
  //                       className="object-contain rounded"
  //                       unoptimized
  //                     />
  //                   </div>
  //                 ) : (
  //                   <Store className="h-6 w-6 text-primary" />
  //                 )}
  //               </div>
  //             )}
  //           </div>
  //           <nav className="flex-1 p-4 space-y-2">
  //             {menuItems.map((item) => {
  //               const Icon = item.icon;
  //               const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  //               return (
  //                 <Link
  //                   key={item.href}
  //                   href={item.href}
  //                   className={cn(
  //                     "flex items-center gap-3 rounded-lg transition-colors",
  //                     isExpanded ? "px-4 py-2" : "px-2 py-2 justify-center",
  //                     isActive
  //                       ? "bg-primary text-primary-foreground"
  //                       : "hover:bg-accent hover:text-accent-foreground",
  //                   )}
  //                   title={!isExpanded ? item.label : undefined}
  //                 >
  //                   <Icon className="h-5 w-5 flex-shrink-0" />
  //                   {isExpanded && <span>{item.label}</span>}
  //                 </Link>
  //               );
  //             })}
  //           </nav>
  //           <div className="p-4 border-t border-border">
  //             <Button
  //               variant="ghost"
  //               className={cn(
  //                 "w-full transition-colors",
  //                 isExpanded ? "justify-start" : "justify-center px-2"
  //               )}
  //               onClick={() => logout()}
  //               title={!isExpanded ? "Sair" : undefined}
  //             >
  //               <LogOut className="h-5 w-5 flex-shrink-0" />
  //               {isExpanded && <span className="ml-3">Sair</span>}
  //             </Button>
  //           </div>
  //         </aside>

  //         {/* Main Content */}
  //         <main className="flex-1">
  //           <div className="container mx-auto px-4 py-8">
  //             {children}
  //           </div>
  //         </main>
  //       </div>
  //     </div>
  //   </>
  // );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayout>
      <SelectedStoreProvider>
        <DashboardContent>{children}</DashboardContent>
      </SelectedStoreProvider>
    </AuthLayout>
  );
}

