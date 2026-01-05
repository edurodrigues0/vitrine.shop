import { BarChart3, ShoppingBag, Store, TrendingUp, Users } from "lucide-react";
import { Card } from "./ui/card";

export function About() {
  return (
    <section id="sobre" className="relative py-24 md:py-32 px-4 bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-background dark:via-blue-950/10 dark:to-background">
      <div className="absolute inset-0 pattern-grid opacity-30 dark:opacity-10"></div>
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              <Store className="h-4 w-4" />
              Sobre a Vitrine.shop
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground dark:text-foreground">
              A plataforma que conecta lojas e consumidores
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              A Vitrine.shop nasceu com a missão de fortalecer o comércio local, conectando lojistas e consumidores de forma simples e direta.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Acreditamos que cada cidade tem lojas incríveis que merecem ser descobertas. Por isso, criamos uma plataforma multi-loja por cidade, onde consumidores encontram produtos exclusivos e lojistas ganham visibilidade sem pagar comissões abusivas.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nossa solução é prática, inteligente e pensada para crescer junto com seu negócio. Sem complicação, sem burocracia. Apenas resultados.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl transform rotate-6"></div>
            <Card className="relative p-8 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2 shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-400/5 border-2 border-blue-200/50 dark:border-blue-800/50">
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-muted-foreground">Lojas cadastradas</div>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-400/5 border-2 border-purple-200/50 dark:border-purple-800/50">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">10k+</div>
                  <div className="text-sm text-muted-foreground">Clientes satisfeitos</div>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-400/5 border-2 border-green-200/50 dark:border-green-800/50">
                  <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">50+</div>
                  <div className="text-sm text-muted-foreground">Cidades atendidas</div>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-400/5 border-2 border-orange-200/50 dark:border-orange-800/50">
                  <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400 mb-3" />
                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">300%</div>
                  <div className="text-sm text-muted-foreground">Aumento médio de vendas</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}