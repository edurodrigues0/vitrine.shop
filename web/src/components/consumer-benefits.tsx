import { CreditCard, Heart, Shield, Smartphone, Store, Truck, Zap } from "lucide-react";
import { Card } from "./ui/card";

export function ConsumerBenefits() {
  return (
    <section className="relative py-24 md:py-32 px-4 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-purple-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-purple-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent)]"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            <Heart className="h-4 w-4" />
            Para Consumidores
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-foreground">
            Por que comprar na Vitrine.shop?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma experiência de compra completa, prática e segura
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-blue-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Store className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Mais opções na mesma cidade</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Descubra diversas lojas locais em um só lugar. Compare produtos, preços e escolha a melhor opção sem sair de casa.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-purple-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Zap className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Compras rápidas sem cadastro complicado</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Nada de formulários longos ou apps pesados. Acesse, escolha e compre de forma simples e direta.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-orange-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Truck className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Delivery ou retirada</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Você escolhe como receber: delivery na porta de casa ou retirada na loja. Flexibilidade total.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-pink-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <CreditCard className="h-10 w-10 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Pagamento direto com a loja</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Negocie e pague diretamente com o lojista. Sem intermediários, mais transparência e confiança.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-blue-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Fácil, rápido e seguro</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Interface intuitiva, processo rápido e conexão direta com lojistas de confiança da sua região.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-purple-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Smartphone className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Funciona no celular</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Acesse de qualquer dispositivo. Interface responsiva que funciona perfeitamente no seu celular.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}