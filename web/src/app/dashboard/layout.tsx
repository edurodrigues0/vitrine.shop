"use client";

import { AuthLayout } from "@/components/auth-layout";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  Package,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/loja", label: "Minha Loja", icon: Store },
  { href: "/dashboard/produtos", label: "Produtos", icon: Package },
  { href: "/dashboard/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <AuthLayout>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-muted/30">
            <div className="p-6 border-b border-border">
              <h1 className="text-xl font-bold">Dashboard</h1>
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
                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => logout()}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
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

