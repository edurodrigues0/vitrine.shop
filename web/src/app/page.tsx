"use client";

import { CTA } from "@/components/cta";
import { FAQ } from "@/components/faq";
import { Plans } from "@/components/plans";
import { CompetitiveAdvantages } from "@/components/competitive-advantages";
import { Stats } from "@/components/stats";
import { Testimonials } from "@/components/testimonials";
import { StoreBenefits } from "@/components/store-benefits";
import { ConsumerBenefits } from "@/components/consumer-benefits";
import { HowItWorks } from "@/components/how-it-works";
import { About } from "@/components/about";
import { HeroSection } from "@/components/hero-section";
import { Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden pt-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Divider Colorido */}
      <div className="section-divider-colorful"></div>

      {/* Sobre Section */}
      <About />

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* Como Funciona Section */}
      <HowItWorks />

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* Benefícios para Consumidores */}
      <ConsumerBenefits />

      {/* Divider colorido */}
      <div className="section-divider-colorful"></div>

      {/* Benefícios para Lojistas */}
      <StoreBenefits />

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
          <Stats />

          {/* Depoimentos */}
          <Testimonials />
        </div>
      </section>

      {/* Divider colorido */}
      <div className="section-divider-colorful"></div>

      {/* Diferenciais Competitivos */}
      <CompetitiveAdvantages />

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* Planos e Preços */}
      <Plans />

      {/* Divider com gradiente */}
      <div className="section-divider-gradient"></div>

      {/* FAQ */}
      <FAQ />

      {/* Divider colorido */}
      <div className="section-divider-colorful"></div>

      {/* CTA Final */}
      <CTA />
    </div>
  );
}
