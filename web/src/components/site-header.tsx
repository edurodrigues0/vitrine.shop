"use client"

import { ArrowLeft, SidebarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { StoreSelector } from "./store-selector"
import { NotificationBell } from "./notifications/notification-bell"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4 bg-black/10 dark:bg-white/10" />
        <div className="container mx-auto">
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
                <StoreSelector />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAuthenticated && <NotificationBell />}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
