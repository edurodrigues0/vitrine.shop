import { ArrowRight, MessageCircle, Package, ShoppingCart, Sparkles, Store } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Card } from "./ui/card";

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50/40 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/20 dark:to-pink-950/20 pattern-dots">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Plataforma Multi-Loja por Cidade</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
                Sua vitrine digital
              </span>
              <br />
              <span className="text-foreground dark:text-foreground">em minutos</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Descubra lojas locais da sua cidade, encontre produtos exclusivos e compre direto via WhatsApp. Para lojistas: crie sua vitrine digital sem complicação.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl text-lg px-8 py-6 h-auto group font-semibold border-0"
              >
                <Link href="/register" className="flex items-center gap-2 text-white">
                  Criar minha loja
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl text-lg px-8 py-6 h-auto group font-semibold border-0"
              >
                <Link href="/lojas" className="flex items-center gap-2 text-white">
                  Ver todas as lojas
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">Lojas cadastradas</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">10k+</div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">Vendas realizadas</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">50+</div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">Cidades atendidas</div>
              </div>
            </div>
          </div>

          {/* Right Content - Mockup */}
          <div className="relative lg:block hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl transform rotate-6"></div>
              <Card className="relative p-8 bg-white/90 dark:bg-card/90 backdrop-blur-sm border-2 border-border/50 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground dark:text-foreground">Loja Exemplo</div>
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground">São Paulo, SP</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <Package className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
                      <div className="text-sm font-medium text-foreground dark:text-foreground">Produtos</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">150+</div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                      <ShoppingCart className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <div className="text-sm font-medium text-foreground dark:text-foreground">Vendas</div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">324</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" size="lg">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Comprar via WhatsApp
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}