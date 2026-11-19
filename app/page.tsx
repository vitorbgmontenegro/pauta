"use client";

// Tela inicial: formulário para pesquisar uma empresa e lista de reuniões já preparadas.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { postar } from "@/lib/api";
import { OFERTA_PADRAO } from "@/lib/prompts";
import { listarLeads, novoId, salvarLead } from "@/lib/storage";
import type { Entrada, Lead, ResultadoPesquisa } from "@/lib/types";

// Mensagens mostradas enquanto a IA trabalha. Avançam por tempo, só para dar noção de progresso.
const ETAPAS = ["Pesquisando a empresa na web…", "Montando o dossiê…", "Escrevendo o roteiro…", "Quase pronto…"];

function statusDoLead(l: Lead) {
  if (l.proposta) return "Proposta pronta";
  if (l.ensaio?.avaliacao) return `Ensaio: ${l.ensaio.avaliacao.nota}/10`;
  return "Roteiro pronto";
}

export default function Home() {
  const router = useRouter();

  // estado do formulário
  const [empresa, setEmpresa] = useState("");
  const [site, setSite] = useState("");
  const [cidade, setCidade] = useState("Recife, PE");
  const [oferta, setOferta] = useState(OFERTA_PADRAO);
  const [editarOferta, setEditarOferta] = useState(false);

  // estado da requisição
  const [carregando, setCarregando] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [erro, setErro] = useState("");

  // leads salvos (só existem no navegador, então carregamos depois de montar)
  const [leads, setLeads] = useState<Lead[]>([]);
  useEffect(() => {
    setLeads(listarLeads());
  }, []);

  useEffect(() => {
    if (!carregando) return;
    setEtapa(0);
    const t = setInterval(() => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)), 8000);
    return () => clearInterval(t);
  }, [carregando]);

  async function preparar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!empresa.trim()) return;
    setErro("");
    setCarregando(true);
    try {
      const r = await postar<ResultadoPesquisa & { entrada: Entrada }>("/api/pesquisar", { empresa, site, cidade, oferta });
      const lead: Lead = { id: novoId(), criadoEm: new Date().toISOString(), ...r };
      salvarLead(lead);
      router.push(`/lead/${lead.id}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu certo. Tente de novo.");
      setCarregando(false);
    }
  }

  return (
    <>
      <section className="hero">
        <h1 className="titulo">Prepare sua próxima reunião de diagnóstico</h1>
        <p className="suave">
          Digite o nome da empresa. A Pauta pesquisa, monta o roteiro, deixa você ensaiar e depois escreve a proposta.
        </p>
      </section>

      <form className="cartao" onSubmit={preparar}>
        <div className="linha" style={{ alignItems: "flex-end" }}>
          <div className="campo" style={{ flexBasis: 280 }}>
            <label className="rotulo" htmlFor="empresa">Empresa</label>
            <input id="empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Nome da empresa" required disabled={carregando} />
          </div>
          <div className="campo">
            <label className="rotulo" htmlFor="site">Site ou Instagram (opcional)</label>
            <input id="site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="empresa.com.br" disabled={carregando} />
          </div>
          <div className="campo" style={{ flexBasis: 140 }}>
            <label className="rotulo" htmlFor="cidade">Cidade</label>
            <input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={carregando} />
          </div>
        </div>

        {editarOferta && (
          <div className="campo">
            <label className="rotulo" htmlFor="oferta">O que você vende</label>
            <textarea id="oferta" value={oferta} onChange={(e) => setOferta(e.target.value)} disabled={carregando} style={{ minHeight: 80 }} />
          </div>
        )}

        {erro && <div className="erro">{erro}</div>}

        <div className="linha" style={{ justifyContent: "space-between" }}>
          {carregando ? (
            <span className="progresso-texto" aria-live="polite"><span className="girando" />{ETAPAS[etapa]}</span>
          ) : (
            <span className="pequeno suave">
              Vendendo como CITi.{" "}
              {!editarOferta && <button type="button" className="link" onClick={() => setEditarOferta(true)}>Mudar</button>}
            </span>
          )}
          <button className="botao" type="submit" disabled={carregando}>{carregando ? "Preparando…" : "Preparar reunião"}</button>
        </div>
      </form>

      <section className="cartao">
        <h2 className="subtitulo">Suas reuniões</h2>
        <div className="lista-leads">
          {leads.map((l) => (
            <Link key={l.id} href={`/lead/${l.id}`} className="lead-linha">
              <div className="lead-info">
                <span className="lead-nome">{l.dossie.empresa}</span>
                <span className="pequeno suave">{l.dossie.segmento}{l.exemplo ? " · exemplo fictício" : ""}</span>
              </div>
              <span className="selo">{statusDoLead(l)}</span>
              <span className="suave">→</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
