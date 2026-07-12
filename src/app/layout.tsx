import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DanoneVendas | Gerenciador de Cupons",
  description: "Painel administrativo premium para gerenciamento e criação de cupons de desconto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <body className="bg-[#09090B] text-[#F4F4F5] min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
