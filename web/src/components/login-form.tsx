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
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { toast } from "sonner";
import { FaGoogle, FaExclamationCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { login, isLoggingIn, loginError, resetLoginError } = useAuth();
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [emailValue, setEmailValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    trigger,
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  // Observa mudanças nos campos
  const watchFields = watch(["email", "password"]);
  const watchPassword = watch("password", "");
  const watchEmail = watch("email", "");

  // Efeito para validar os campos em tempo real
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "password") {
        setPasswordValue(value.password || "");
        trigger("password");
      } else if (name === "email") {
        setEmailValue(value.email || "");
        trigger("email");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger]);

  // Efeito para controlar a animação de erro
  useEffect(() => {
    if (errors.password) {
      setShowPasswordError(true);
      const timer = setTimeout(() => setShowPasswordError(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [errors.password]);

  const onSubmit = async (data: LoginFormData) => {
    // Resetar erro anterior, se houver
    if (loginError) {
      resetLoginError();
    }
    login(data);
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
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
              className={cn(
                "transition-all focus:ring-2 pr-10",
                errors.password 
                  ? "border-destructive focus:ring-destructive/50 animate-shake"
                  : "focus:ring-primary/50",
                showPasswordError && "border-destructive"
              )}
            />
            {errors.password && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <FaExclamationCircle className="h-5 w-5 text-destructive" />
              </div>
            )}
          </div>
          <div className="mt-1.5">
            <AnimatePresence mode="wait">
              {loginError ? (
                <motion.p 
                  key="login-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-destructive flex items-center gap-1.5 mb-2"
                >
                  <FaExclamationCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {loginError.userMessage || 'Erro ao fazer login. Tente novamente.'}
                </motion.p>
              ) : errors.password ? (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive flex items-center gap-1.5"
                >
                  <FaExclamationCircle className="h-3.5 w-3.5" />
                  {errors.password.message}
                </motion.p>
              ) : passwordValue ? (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground flex items-center gap-1.5"
                >
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    passwordValue.length >= 8 ? "bg-green-500" : "bg-gray-300"
                  )} />
                  Mínimo de 8 caracteres
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </Field>
        
        <Field>
          <Button 
            type="submit" 
            disabled={isLoggingIn || !isValid || !isDirty || !emailValue || passwordValue.length < 8}
            className={cn(
              "w-full shadow-lg transition-all duration-300 relative overflow-hidden group font-semibold",
              "disabled:opacity-70 disabled:cursor-not-allowed bg-gray-300 text-gray-500",
              {
                "bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white hover:from-primary/90 hover:via-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]": 
                  !isLoggingIn && isValid && isDirty && emailValue && passwordValue.length >= 8
              }
            )}
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
