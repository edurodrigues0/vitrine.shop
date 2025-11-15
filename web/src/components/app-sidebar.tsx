"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Store, Loader2, type LucideIcon } from "lucide-react";
import type { User, AuthUserResponse } from "@/dtos/user";
import type { Store as StoreType } from "@/dtos/store";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import Link from "next/link";
import Image from "next/image";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User | AuthUserResponse | null;
  selectedStore?: StoreType | null;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
  }[];
  projects?: {
    href: string;
    label: string;
    icon: React.ElementType;
  }[];
  navSecondary?: {
    href: string;
    label: string;
    icon: React.ElementType;
  }[];
}

export function AppSidebar({ user, selectedStore, items, projects, navSecondary, ...props }: AppSidebarProps) {
  // Buscar subscription da loja
  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription", selectedStore?.id],
    queryFn: async () => {
      if (!selectedStore?.id) return null;
      try {
        const response = await api.get<{ subscription: { planName: string } | null }>(
          `/subscriptions/store/${selectedStore.id}`
        );
        return response.subscription;
      } catch {
        return null;
      }
    },
    enabled: !!selectedStore?.id,
  });

  const planName = subscriptionData?.planName || "Gratuito";

  return (
    <Sidebar
      collapsible="icon"
      className="h-screen"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/loja">
                {selectedStore?.logoUrl ? (
                  <div className="relative aspect-square size-8 rounded-lg overflow-hidden">
                    <Image
                      src={selectedStore.logoUrl}
                      alt={selectedStore.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Store className="size-4" />
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {selectedStore?.name || "Carregando..."}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {selectedStore ? planName : "Aguarde"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items.map(item => ({
          title: item.label,
          url: item.href,
          icon: item.icon as LucideIcon,
        }))} />
        {projects && <NavSecondary projects={projects.map(project => ({
          name: project.label,
          url: project.href,
          icon: project.icon as LucideIcon,
        }))} />}
        {navSecondary && <NavSecondary projects={navSecondary.map(item => ({
          name: item.label,
          url: item.href,
          icon: item.icon as LucideIcon,
        }))} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ? {
          name: user.name,
          email: user.email,
          avatar: undefined,
        } : undefined} />
      </SidebarFooter>
    </Sidebar>
  )
}