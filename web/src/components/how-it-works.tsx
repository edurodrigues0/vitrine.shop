import { CheckCircle2, MapPin, MessageCircle, Package, Search, ShoppingCart, Zap } from "lucide-react";
import { Card } from "./ui/card";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative py-24 md:py-32 px-4 bg-gradient-to-br from-blue-50 via-cyan-50/50 to-blue-50 dark:from-blue-950/20 dark:via-cyan-950/10 dark:to-blue-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.05),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.08),transparent)] dark:bg-[radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.05),transparent)]"></div>
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Processo Simples
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-foreground">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em poucos passos você descobre lojas locais e compra diretamente, ou cria sua própria vitrine digital
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Step 1 */}
          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute -top-4 left-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
            </div>
            <div className="mt-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <MapPin className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Escolha sua cidade</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Selecione a cidade onde você está ou quer comprar. A plataforma mostra todas as lojas disponíveis na região.
              </p>
            </div>
          </Card>

          {/* Step 2 */}
          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute -top-4 left-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                2
              </div>
            </div>
            <div className="mt-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Search className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Encontre lojas próximas</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Explore o catálogo de lojas da sua cidade. Veja produtos, preços e informações de cada estabelecimento.
              </p>
            </div>
          </Card>

          {/* Step 3 */}
          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-orange-200/50 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute -top-4 left-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                3
              </div>
            </div>
            <div className="mt-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Package className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Veja produtos</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Navegue pelos produtos de cada loja. Fotos, descrições detalhadas e preços transparentes.
              </p>
            </div>
          </Card>

          {/* Step 4 */}
          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute -top-4 left-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                4
              </div>
            </div>
            <div className="mt-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <ShoppingCart className="h-10 w-10 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Adicione ao carrinho</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Selecione os produtos desejados. O carrinho inteligente separa automaticamente itens de lojas diferentes.
              </p>
            </div>
          </Card>

          {/* Step 5 */}
          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute -top-4 left-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                5
              </div>
            </div>
            <div className="mt-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <CheckCircle2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Finalize o pedido</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Confirme seus pedidos. O sistema gera uma mensagem automática pronta para enviar no WhatsApp da loja.
              </p>
            </div>
          </Card>

          {/* Step 6 */}
          <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 hover:-translate-y-2 bg-white/80 dark:bg-card/80 backdrop-blur-sm">
            <div className="absolute -top-4 left-8">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                6
              </div>
            </div>
            <div className="mt-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/30 w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <MessageCircle className="h-10 w-10 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-foreground">Compre via WhatsApp</h3>
              <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
                Receba a mensagem formatada com todos os produtos. Envie para a loja e feche a venda diretamente.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}