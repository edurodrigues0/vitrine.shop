import { BarChart3, Clock, Globe, ShoppingCart, Sparkles, Store, Zap } from "lucide-react";
import { Card } from "./ui/card";

export function CompetitiveAdvantages() {
  return (
    <section className="relative py-24 md:py-32 px-4 bg-gradient-to-b from-background via-blue-50/20 to-background dark:from-background dark:via-blue-950/10 dark:to-background">
      <div className="absolute inset-0 pattern-grid opacity-20 dark:opacity-10"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            O que nos diferencia
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-foreground">
            Por que escolher a Vitrine.shop?
          </h2>
          <p className="text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
            Vantagens exclusivas que fazem a diferença
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-8 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 shadow-md">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground dark:text-foreground">Funciona em qualquer cidade</h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Não importa onde você está. A plataforma funciona em qualquer cidade do Brasil.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 shadow-md">
                <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground dark:text-foreground">Multi-loja por região</h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Cada cidade tem sua própria vitrine de lojas. Organização e navegação intuitiva.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/30 shadow-md">
                <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground dark:text-foreground">Carrinho inteligente</h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Não mistura produtos de lojas diferentes. Cada pedido é separado automaticamente.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/30 shadow-md">
                <Zap className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground dark:text-foreground">Nada de apps pesados</h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Funciona direto no navegador. Sem downloads, sem cadastros burocráticos.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 shadow-md">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground dark:text-foreground">Loja funcionando em minutos</h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Cadastre sua loja, adicione produtos e comece a vender. Tudo em poucos minutos.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 shadow-md">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-foreground dark:text-foreground">Escalável e moderno</h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Plataforma pensada para crescer junto com seu negócio. Sem limites de produtos ou vendas.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}