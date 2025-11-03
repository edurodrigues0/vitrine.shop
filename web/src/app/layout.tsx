import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const poppins = Poppins({
  variable: "--font-poppins-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vitrine Shop",
  description: "Vitrine Shop - Crie sua loja online. Venda online de forma simples. No vitrinshop.com você cria sua loja, mostra seus produtos e recebe pedidos direto no WhatsApp ou pelo site — rápido e sem burocracia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} ${playfairDisplay.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
