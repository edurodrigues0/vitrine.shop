import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/components/providers";
import { PublicLayout } from "@/components/public-layout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vitrine.shop - Sua Vitrine Multi-Loja por Cidade | Descubra e Compre de Lojas Locais",
  description: "Descubra lojas locais da sua cidade, encontre produtos exclusivos e compre direto via WhatsApp. Para lojistas: crie sua vitrine digital em minutos, sem comissões abusivas. Plataforma moderna e inteligente para negócios locais.",
  keywords: "vitrine digital, lojas locais, comércio local, compra online, WhatsApp, e-commerce local, multi-loja, marketplace local",
  openGraph: {
    title: "Vitrine.shop - Sua Vitrine Multi-Loja por Cidade",
    description: "Descubra e compre de lojas locais da sua cidade direto via WhatsApp",
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <PublicLayout>
              {children}
            </PublicLayout>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
