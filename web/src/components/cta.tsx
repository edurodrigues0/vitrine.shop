"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  const router = useRouter();

  return (
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
          className="
            shadow-2xl text-lg px-10 py-6 h-auto
            bg-white text-purple-600
            transition-all duration-300 font-semibold border-0 hover:cursor-pointer
            hover:bg-white hover:text-purple-700 hover:shadow-3xl hover:scale-105 hover:opacity-100
            active:scale-100 active:opacity-100
            [&:hover]:opacity-100 [&:hover]:bg-white
          "
          onClick={() => router.push('/register')}
        >
          Criar minha loja agora
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}