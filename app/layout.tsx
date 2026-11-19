import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pauta · diagnóstico comercial",
  description: "Prepare, ensaie e transforme reuniões de diagnóstico em proposta, com IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      </head>
      <body>
        <div className="moldura">
          <header className="topo">
            <Link href="/" className="marca">Pauta<span>.</span></Link>
            <span className="pequeno suave">diagnóstico comercial</span>
          </header>
          <main className="conteudo">{children}</main>
          <footer className="rodape">Feito por Vitor Montenegro para o PS de Inovação do CITi · 2026</footer>
        </div>
      </body>
    </html>
  );
}
