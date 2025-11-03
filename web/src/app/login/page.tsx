import Image from "next/image"
import { LoginForm } from "@/components/login-form"


export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/login-background.png"
          alt="Imagem de um interior de uma loja com roupas"
          width={500}
          height={500}
          className="absolute inset-0 h-full w-full object-cover brightness-[0.5] contrast-[0.8] dark:brightness-[0.8] dark:contrast-[0.8]"
        />
      </div>
    </div>
  )
}
