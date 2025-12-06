"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { toast } from "sonner";
import { FaGoogle } from "react-icons/fa";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { login, isLoggingIn, googleLogin } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      login(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao fazer login. Tente novamente.",
      );
    }
  };

  const handleGoogleLogin = () => {
    // Remover ?from=google do callbackURL
    // O Better Auth vai redirecionar para /dashboard após autenticação
    const callbackURL = `${window.location.origin}/dashboard`;
    googleLogin(callbackURL);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup className="space-y-5">
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
            <p className="text-sm text-destructive mt-1.5">
              {errors.email.message}
            </p>
          )}
        </Field>
        
        <Field>
          <div className="flex items-center justify-between mb-1.5">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <a
              href="#"
              className="text-sm text-primary hover:underline font-medium"
            >
              Esqueceu sua senha?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
            className="transition-all focus:ring-2 focus:ring-primary/50"
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1.5">
              {errors.password.message}
            </p>
          )}
        </Field>
        
        <Field>
          <Button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group font-semibold"
          >
            <span className="relative z-10">
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Button>
        </Field>
        
        <FieldSeparator>Ou continue com</FieldSeparator>
        
        <Field>
          <Button 
            onClick={handleGoogleLogin}
            variant="outline" 
            type="button"
            className="w-full border-2 hover:bg-muted/50 transition-all"
          >
            <FaGoogle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Entrar com Google
          </Button>
          <FieldDescription className="text-center mt-4">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
