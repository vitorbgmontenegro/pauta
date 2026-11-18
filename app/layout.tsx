import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pauta · caderno de diagnóstico comercial",
  description: "Prepare, ensaie e transforme reuniões de diagnóstico em proposta, com IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body>
        <div className="moldura">
          <header className="topo">
            <Link href="/" className="marca-nome">
              Pauta<span>.</span>
            </Link>
            <span className="topo-sub">caderno de diagnóstico comercial</span>
          </header>
          <main className="conteudo">{children}</main>
          <footer className="rodape">
            <span>Feito por Vitor Montenegro para o PS de Inovação do CITi · 2026</span>
            <span>pesquisa e geração com Gemini + Google Search</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
