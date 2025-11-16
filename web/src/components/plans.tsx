import { Check, CreditCard } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";

export function Plans() {
  return (
    <section id="precos" className="relative py-24 md:py-32 px-4 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent)]"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            <CreditCard className="h-4 w-4" />
            Planos e Preços
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-foreground">
            Escolha o plano ideal
          </h2>
          <p className="text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
            Preços transparentes, sem taxas escondidas. Sem comissões por venda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plano Básico */}
          <Card className="p-8 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all relative bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-foreground dark:text-foreground">Básico</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">R$ 49</span>
                <span className="text-muted-foreground dark:text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Ideal para começar</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Até 50 produtos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Catálogo digital</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Carrinho WhatsApp</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Suporte por email</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Sem comissões</span>
              </li>
            </ul>
            <Button className="w-full border-2 border-foreground/20 hover:bg-foreground/5 hover:border-foreground/40 bg-background/80 backdrop-blur-sm" variant="outline" asChild>
              <Link href="/register" className="text-foreground">Começar agora</Link>
            </Button>
          </Card>

          {/* Plano Profissional */}
          <Card className="p-8 border-2 border-purple-400 dark:border-purple-600 shadow-xl hover:shadow-2xl transition-all relative bg-white/90 dark:bg-card/90 backdrop-blur-sm">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-full shadow-lg">
                Mais Popular
              </div>
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-foreground dark:text-foreground">Profissional</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">R$ 99</span>
                <span className="text-muted-foreground dark:text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Para negócios em crescimento</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Produtos ilimitados</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Catálogo digital</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Carrinho WhatsApp</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Suporte prioritário</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Relatórios de vendas</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Sem comissões</span>
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0" asChild>
              <Link href="/register" className="text-white">Começar agora</Link>
            </Button>
          </Card>

          {/* Plano Enterprise */}
          <Card className="p-8 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 hover:shadow-xl transition-all relative bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-foreground dark:text-foreground">Enterprise</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 dark:from-pink-400 dark:to-pink-300 bg-clip-text text-transparent">R$ 199</span>
                <span className="text-muted-foreground dark:text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Para grandes negócios</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Produtos ilimitados</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Múltiplas filiais</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Carrinho WhatsApp</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Suporte dedicado</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">API personalizada</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm text-foreground dark:text-foreground">Sem comissões</span>
              </li>
            </ul>
            <Button className="w-full border-2 border-foreground/20 hover:bg-foreground/5 hover:border-foreground/40 bg-background/80 backdrop-blur-sm" variant="outline" asChild>
              <Link href="/register" className="text-foreground">Falar com vendas</Link>
            </Button>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground dark:text-muted-foreground mb-4">
            Todos os planos incluem: Sem comissões por venda • Setup rápido • Suporte técnico
          </p>
          <Button size="lg" variant="ghost" asChild className="text-foreground hover:bg-foreground/10">
            <Link href="#faq" className="text-foreground">Veja perguntas frequentes</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}