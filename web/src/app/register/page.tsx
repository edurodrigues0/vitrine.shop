"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usersService } from "@/services/users-service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Store, Sparkles, Check } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]).default("OWNER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "OWNER",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: Omit<RegisterFormData, "confirmPassword">) =>
      usersService.create(data),
    onSuccess: () => {
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erro ao criar conta. Tente novamente.",
      );
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  const benefits = [
    "Sem comissões sobre vendas",
    "Configuração em minutos",
    "Suporte completo",
    "Gestão de produtos fácil",
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background with decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      </div>

      <div className="relative min-h-screen grid lg:grid-cols-2">
        {/* Left Side - Form */}
        <div className="flex flex-col items-center justify-center p-6 md:p-10 lg:p-12 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 relative z-10">
          <div className="w-full max-w-md space-y-8">
            {/* Logo/Brand */}
            <div className="text-center space-y-4">
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
                <span>Comece sua jornada hoje</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-background/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl shadow-primary/5 p-8 space-y-6">
              <div className="flex flex-col items-center gap-1 text-center mb-2">
                <h1 className="text-2xl font-bold">Criar conta</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Preencha os dados abaixo para criar sua conta
                </p>
              </div>

              <form
                className="flex flex-col gap-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="João Silva"
                      {...register("name")}
                      aria-invalid={errors.name ? "true" : "false"}
                      className="transition-all focus:ring-2 focus:ring-primary/50"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">E-mail</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...register("email")}
                      aria-invalid={errors.email ? "true" : "false"}
                      className="transition-all focus:ring-2 focus:ring-primary/50"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      {...register("password")}
                      aria-invalid={errors.password ? "true" : "false"}
                      className="transition-all focus:ring-2 focus:ring-primary/50"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirmar senha
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Digite a senha novamente"
                      {...register("confirmPassword")}
                      aria-invalid={errors.confirmPassword ? "true" : "false"}
                      className="transition-all focus:ring-2 focus:ring-primary/50"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="w-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group font-semibold"
                    >
                      <span className="relative z-10">
                        {registerMutation.isPending ? "Criando conta..." : "Criar conta"}
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    Já tem uma conta?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Faça login
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </div>

            {/* Additional Info */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Ao criar uma conta, você concorda com nossos{" "}
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

        {/* Right Side - Benefits/Visual */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-600/40 to-pink-600/40"></div>
          
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
            <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.7s" }}></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="space-y-8 max-w-md">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                <Store className="h-10 w-10 text-white" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white">
                  Junte-se a milhares de lojistas
                </h2>
                <p className="text-lg text-white/90 leading-relaxed">
                  Crie sua vitrine digital e comece a vender hoje mesmo. Plataforma completa, sem complicações.
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-4 pt-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-white/90 text-left animate-in fade-in slide-in-from-left"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-base">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">0%</div>
                  <div className="text-sm text-white/70">Comissão</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">5min</div>
                  <div className="text-sm text-white/70">Configuração</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-white/70">Suporte</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
