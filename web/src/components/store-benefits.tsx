import { Building2, Filter, Globe, MapPin, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Card } from "./ui/card";

export function StoreBenefits() {
  return (
    <section className="relative py-24 md:py-32 px-4 bg-gradient-to-br from-orange-50 via-pink-50/30 to-orange-50 dark:from-orange-950/20 dark:via-pink-950/10 dark:to-orange-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.08),transparent)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.05),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.08),transparent)] dark:bg-[radial-gradient(circle_at_70%_50%,rgba(236,72,153,0.05),transparent)]"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium mb-4">
            <Building2 className="h-4 w-4" />
            Para Lojistas
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-foreground">
            Vantagens para seu negócio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para vender online de forma simples e eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-orange-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <MapPin className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Sua loja aparece para pessoas da sua cidade</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Quando alguém busca lojas na sua cidade, você aparece. Visibilidade garantida para clientes locais.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-pink-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Globe className="h-10 w-10 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Catálogo digital próprio sem precisar de site</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Tenha sua vitrine digital profissional sem precisar criar um site completo. Simples, rápido e eficiente.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-blue-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <ShoppingCart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Carrinho automático integrado ao WhatsApp</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Clientes adicionam produtos ao carrinho e recebem mensagem formatada pronta para enviar. Vendas mais fáceis.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-purple-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Filter className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Controle de produtos por categoria</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Organize seus produtos em categorias. Facilite a navegação e aumente as chances de venda.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-orange-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <TrendingUp className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Sem comissões abusivas</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Pague apenas uma mensalidade fixa. Sem comissões por venda. Todo o lucro da venda é seu.
              </p>
            </div>
          </Card>

          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-pink-900/20"></div>
            <div className="relative z-10">
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Users className="h-10 w-10 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Venda direto para seus clientes</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Relacionamento direto com o cliente via WhatsApp. Negocie, tire dúvidas e feche vendas pessoalmente.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}