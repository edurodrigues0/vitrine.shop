import { ShoppingBag, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function Header() {
  const totalItems = 3;

  return (
    <nav className="sticky mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Store className="h-6 w-6 text-primary" />
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Vitrine Shop
          </span>
        </Link>
    
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="relative">
            <Link href="/login">
              <Store className="size-4 mr-2" />
              Lojista
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="relative">
            <Link href="/cart">
              <ShoppingBag className="size-4 mr-2" />
              Carrinho
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}