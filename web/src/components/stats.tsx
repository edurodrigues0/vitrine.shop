import { Card } from "./ui/card";

export function Stats() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-16">
      <Card className="p-8 text-center border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1">
        <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">500+</div>
        <div className="text-lg text-muted-foreground dark:text-muted-foreground">Lojas cadastradas</div>
      </Card>
      <Card className="p-8 text-center border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1">
        <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent mb-2">10.000+</div>
        <div className="text-lg text-muted-foreground dark:text-muted-foreground">Vendas realizadas</div>
      </Card>
      <Card className="p-8 text-center border-2 border-pink-200/50 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-600 transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1">
        <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 dark:from-pink-400 dark:to-pink-300 bg-clip-text text-transparent mb-2">50+</div>
        <div className="text-lg text-muted-foreground dark:text-muted-foreground">Cidades atendidas</div>
      </Card>
    </div>
  )
}