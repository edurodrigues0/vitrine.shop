import { Star } from "lucide-react";
import { Card } from "./ui/card";

export function Testimonials() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <Card className="p-8 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-orange-500 text-orange-500 dark:fill-orange-400 dark:text-orange-400" />
          ))}
        </div>
        <p className="text-muted-foreground dark:text-muted-foreground mb-6 leading-relaxed">
          "Minhas vendas aumentaram 300% desde que criei minha loja na Vitrine.shop. O processo é simples e os clientes adoram a facilidade de comprar via WhatsApp."
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            MC
          </div>
          <div>
            <div className="font-semibold text-foreground dark:text-foreground">Maria Clara</div>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">Loja de Roupas - SP</div>
          </div>
        </div>
      </Card>

      <Card className="p-8 border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-orange-500 text-orange-500 dark:fill-orange-400 dark:text-orange-400" />
          ))}
        </div>
        <p className="text-muted-foreground dark:text-muted-foreground mb-6 leading-relaxed">
          "Encontrei produtos incríveis de lojas locais que eu nem sabia que existiam. A compra pelo WhatsApp é super prática e o atendimento é excelente."
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
            JS
          </div>
          <div>
            <div className="font-semibold text-foreground dark:text-foreground">João Silva</div>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">Consumidor - RJ</div>
          </div>
        </div>
      </Card>

      <Card className="p-8 border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 hover:shadow-xl transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:-translate-y-1">
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-orange-500 text-orange-500 dark:fill-orange-400 dark:text-orange-400" />
          ))}
        </div>
        <p className="text-muted-foreground dark:text-muted-foreground mb-6 leading-relaxed">
          "Em menos de 1 hora minha loja estava no ar. Não preciso de site próprio, a Vitrine.shop resolve tudo. E o melhor: sem comissões por venda!"
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
            AS
          </div>
          <div>
            <div className="font-semibold text-foreground dark:text-foreground">Ana Santos</div>
            <div className="text-sm text-muted-foreground dark:text-muted-foreground">Artigos para Casa - MG</div>
          </div>
        </div>
      </Card>
    </div>
  )
}