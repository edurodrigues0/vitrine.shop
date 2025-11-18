"use client";

import { useState } from "react";
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

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { login, isLoggingIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    login(data, {
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Erro ao fazer login. Tente novamente.";
        setFormError(message);
      },
    });
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
              className="link-text text-sm font-medium"
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
            isLoading={isLoggingIn}
            loadingText="Entrando..."
            className="w-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group font-semibold"
          >
            <span className="relative z-10">Entrar</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Button>
          {formError && (
            <p className="text-sm text-destructive mt-2" role="alert" aria-live="polite">
              {formError}
            </p>
          )}
        </Field>
        
        <FieldSeparator>Ou continue com</FieldSeparator>
        
        <Field>
          <Button 
            variant="outline" 
            type="button"
            className="w-full border-2 hover:bg-muted/50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Entrar com Google
          </Button>
          <FieldDescription className="text-center mt-4">
            Não tem uma conta?{" "}
            <Link href="/register" className="link-text font-medium">
              Cadastre-se
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
