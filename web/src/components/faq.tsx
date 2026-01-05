"use client";

import { ChevronDown, MessageCircle } from "lucide-react";
import { Card } from "./ui/card";
import { useState } from "react";

export function FAQ() {
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
                className="w-full py-3 px-4 text-left flex items-start justify-between gap-4 transition-colors rounded-lg group"
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
  )
}