"use client";

import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { Store, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background with decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative min-h-screen grid lg:grid-cols-2">
        {/* Left Side - Form */}
        <div className="flex flex-col items-center justify-center p-6 md:p-10 lg:p-12 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 relative z-10">
          <div className="w-full max-w-md space-y-6">
            {/* Logo/Brand */}
            <div className="text-center space-y-3">
              <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-2xl group">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 animate-pulse" />
                  <div className="relative z-10 p-2 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all duration-300">
                    <Store className="h-6 w-6 text-primary group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 group-hover:scale-110 transform" />
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </div>
                <span className="font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent bg-[length:200%_auto] group-hover:bg-[length:100%_auto] transition-all duration-500">
                  Vitrine.shop
                </span>
              </Link>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Bem-vindo de volta!</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl shadow-primary/5 p-8">
              <LoginForm />
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ao continuar, você concorda com nossos{" "}
                <Link href="/termos" className="text-primary hover:underline font-medium">
                  Termos de Uso
                </Link>
                {" "}e{" "}
                <Link href="/privacidade" className="text-primary hover:underline font-medium">
                  Política de Privacidade
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image/Visual */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20">
          <div className="absolute inset-0 bg-[url('/login-background.png')] bg-cover bg-center opacity-20 dark:opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-600/40 to-pink-600/40"></div>
          
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="space-y-6 max-w-md">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Store className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white">
                Sua vitrine digital em minutos
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                Conecte-se com clientes locais, gerencie seus produtos e cresça seu negócio com a plataforma mais completa para lojistas.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></div>
                  <span className="text-sm">Sem comissões</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                  <span className="text-sm">Fácil de usar</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: "1s" }}></div>
                  <span className="text-sm">100% online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
