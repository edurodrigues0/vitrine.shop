"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  MapPin,
  ShoppingBag,
  MessageCircle,
  Store,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Users,
  BarChart3,
  Clock,
  Smartphone,
  Globe,
  Heart,
  Star,
  ChevronDown,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Building2,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Preciso pagar comissão?",
      answer:
        "Não! A Vitrine.shop não cobra comissões sobre suas vendas. Você paga apenas uma mensalidade fixa e transparente, sem surpresas. Todo o valor da venda é seu.",
    },
    {
      question: "É fácil configurar a loja?",
      answer:
        "Sim! Em poucos minutos você cadastra sua loja, adiciona produtos com fotos e descrições, e já está pronto para vender. Interface simples e intuitiva, sem necessidade de conhecimento técnico.",
    },
    {
      question: "Posso vender qualquer tipo de produto?",
      answer:
        "Sim, desde que sejam produtos legais e permitidos. Você pode cadastrar produtos de qualquer categoria: roupas, eletrônicos, alimentos, artesanato, serviços e muito mais.",
    },
    {
      question: "A plataforma funciona em qualquer cidade?",
      answer:
        "Sim! A Vitrine.shop funciona em qualquer cidade do Brasil. Basta escolher sua cidade e começar a vender. A plataforma é multi-loja por região, então cada cidade tem sua própria vitrine de lojas.",
    },
    {
      question: "Como funciona o pagamento?",
      answer:
        "O pagamento é feito diretamente entre você e o cliente via WhatsApp. A Vitrine.shop apenas conecta vocês e facilita o processo de pedido. Você recebe o pagamento da forma que combinar com o cliente.",
    },
    {
      question: "Preciso instalar algum app?",
      answer:
        "Não! A Vitrine.shop funciona direto no navegador, tanto no computador quanto no celular. Não precisa baixar apps pesados ou fazer cadastros complicados. Acesse e use quando quiser.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden pt-16">
      {/* Hero Section */}
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

      {/* Divider Colorido */}
      <div className="section-divider-colorful"></div>

      {/* Sobre Section */}
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

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* Como Funciona Section */}
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

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* Benefícios para Consumidores */}
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

      {/* Divider colorido */}
      <div className="section-divider-colorful"></div>

      {/* Benefícios para Lojistas */}
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

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* Prova Social */}
      <section id="lojas-parceiras" className="relative py-24 md:py-32 px-4 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-purple-50/50 dark:from-purple-950/20 dark:via-blue-950/10 dark:to-purple-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.08),transparent)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.05),transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.08),transparent)] dark:bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent)]"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
              <Star className="h-4 w-4" />
              Resultados Reais
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-foreground">
              Confiança e resultados
            </h2>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
              Lojistas e consumidores que já transformaram suas vendas e compras
            </p>
          </div>

          {/* Stats */}
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

          {/* Depoimentos */}
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
        </div>
      </section>

      {/* Divider colorido */}
      <div className="section-divider-colorful"></div>

      {/* Diferenciais Competitivos */}
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

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* Planos e Preços */}
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

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* FAQ */}
      <section id="faq" className="relative py-24 md:py-32 px-4 bg-gradient-to-b from-background via-purple-50/20 to-background dark:from-background dark:via-purple-950/10 dark:to-background">
        <div className="absolute inset-0 pattern-grid opacity-20 dark:opacity-10"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
              <MessageCircle className="h-4 w-4" />
              Dúvidas Frequentes
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground dark:text-foreground">
              Perguntas frequentes
            </h2>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground">
              Tire suas dúvidas sobre a plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2 border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 transition-all bg-white/80 dark:bg-card/80 backdrop-blur-sm overflow-hidden">
                <button
                  className="w-full py-3 px-4 text-left flex items-start justify-between gap-4 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-colors rounded-lg group"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span className="font-semibold text-base text-foreground dark:text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors pr-2">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 transition-all duration-300 mt-0.5 ${
                      openFaq === index ? "transform rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Divider colorido */}
      <div className="section-divider-colorful"></div>

      {/* CTA Final */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed">
            Crie sua vitrine digital agora e comece a vender em minutos. Sem complicação, sem burocracia.
          </p>
          <Button
            size="lg"
            asChild
            className="shadow-2xl text-lg px-10 py-6 h-auto bg-white text-purple-600 hover:bg-white/95 hover:scale-105 transition-all duration-300 font-semibold border-0"
          >
            <Link href="/register" className="flex items-center gap-2 justify-center text-purple-600">
              Criar minha loja agora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
