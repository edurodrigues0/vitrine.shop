import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Store, MapPin, ShoppingBag, Shield, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative gradient-hero py-24 md:py-32 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center animate-fade-in">
            {/* Icon with animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary)/0.2)] to-[hsl(var(--primary)/0.05)] backdrop-blur-sm border border-[hsl(var(--primary))]/20 shadow-glow">
                  <Store className="h-16 w-16 text-primary animate-bounce-subtle" />
                </div>
              </div>
            </div>

            {/* Main heading */}
            <h1
              className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold mb-6
                bg-gradient-to-r from-[hsl(var(--primary))]
                via-[hsl(var(--primary)/0.8)] to-[hsl(var(--accent))]
                bg-clip-text text-transparent leading-tight animate-fade-in-delay"
            >
              Descubra Lojas<br className="md:hidden" /> Incríveis
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay-2">
              Conecte-se com as melhores lojas da sua cidade. Compre produtos exclusivos e receba direto via WhatsApp.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-3">
              <Button 
                size="lg" 
                asChild 
                className="gradient-accent shadow-glow text-lg px-8 py-6 h-auto group hover:scale-105 transition-transform duration-300"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Começar Agora
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-lg px-8 py-6 h-auto border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
              >
                <Link href="/cities">Explorar Lojas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 px-4 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--muted))/0.3]">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Por que escolher o Vitrine Shop?
            </div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              Uma experiência única de compra
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para descobrir e comprar dos melhores estabelecimentos locais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 animate-slide-up border-2 hover:border-primary/20 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.2)] to-[hsl(var(--primary)/0.05)] w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-3">Lojas Locais</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Encontre lojas na sua cidade e apoie o comércio local com produtos exclusivos e de qualidade.
                </p>
              </div>
            </Card>

            <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 animate-slide-up border-2 hover:border-accent/20 hover:-translate-y-2 overflow-hidden" style={{ animationDelay: "0.1s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent)/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--accent)/0.2)] to-[hsl(var(--accent)/0.05)] w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="h-10 w-10 text-accent" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-3">Compra Simples</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Adicione ao carrinho e finalize direto pelo WhatsApp. Processo rápido e descomplicado.
                </p>
              </div>
            </Card>

            <Card className="group relative p-8 hover:shadow-xl transition-all duration-300 animate-slide-up border-2 hover:border-success/20 hover:-translate-y-2 overflow-hidden" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--success)/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--success)/0.2)] to-[hsl(var(--success)/0.05)] w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-success" />
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-3">Seguro e Confiável</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Conexão direta com as lojas, sem intermediários. Transações seguras e transparentes.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative gradient-primary py-20 md:py-28 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
            Pronto para começar?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Cadastre-se gratuitamente e descubra produtos exclusivos das melhores lojas da sua região.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            asChild 
            className="shadow-2xl text-lg px-10 py-6 h-auto bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 font-semibold"
          >
            <Link href="/register" className="flex items-center gap-2 justify-center">
              Criar Conta Grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
