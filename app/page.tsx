"use client";

// Tela inicial: formulário para pesquisar uma empresa e lista de leads já preparados.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { postar } from "@/lib/api";
import { OFERTA_PADRAO } from "@/lib/prompts";
import { listarLeads, novoId, salvarLead } from "@/lib/storage";
import type { Entrada, Lead, ResultadoPesquisa } from "@/lib/types";

// Etapas mostradas enquanto a IA trabalha. Avançam por tempo, só para dar noção de progresso.
const ETAPAS = ["Pesquisando a empresa na web", "Cruzando sinais e dores prováveis", "Escrevendo o roteiro SPIN", "Criando o cliente para o ensaio"];

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
    const t = setInterval(() => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)), 6000);
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
    <div className="home">
      <section className="home-esq">
        <span className="rotulo">Para quem vende serviço B2B</span>
        <h1 className="titulo-grande">
          Chegue na reunião sabendo <span className="marcado">o que perguntar</span>.
        </h1>
        <p className="lead-intro">
          Digite o nome de uma empresa. A Pauta pesquisa na web, monta o dossiê e o roteiro de diagnóstico, deixa você
          ensaiar com um cliente simulado e, depois da reunião, escreve a proposta.
        </p>

        <div className="passos-home">
          <div><span className="rotulo">01</span><b>Preparar</b><span className="pequeno texto-suave">Dossiê e roteiro SPIN</span></div>
          <div><span className="rotulo">02</span><b>Ensaiar</b><span className="pequeno texto-suave">Cliente simulado e nota</span></div>
          <div><span className="rotulo">03</span><b>Propor</b><span className="pequeno texto-suave">Anotações viram proposta</span></div>
        </div>

        <form className="form-pesquisa" onSubmit={preparar}>
          <div className="campo">
            <label className="rotulo" htmlFor="empresa">Empresa</label>
            <input id="empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Ex.: nome da empresa que você vai visitar" required disabled={carregando} />
          </div>
          <div className="linha-campos">
            <div className="campo">
              <label className="rotulo" htmlFor="site">Site ou Instagram (opcional)</label>
              <input id="site" value={site} onChange={(e) => setSite(e.target.value)} placeholder="empresa.com.br" disabled={carregando} />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="cidade">Cidade</label>
              <input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={carregando} />
            </div>
          </div>

          {editarOferta ? (
            <div className="campo">
              <label className="rotulo" htmlFor="oferta">O que você vende</label>
              <textarea id="oferta" value={oferta} onChange={(e) => setOferta(e.target.value)} disabled={carregando} />
            </div>
          ) : (
            <p className="pequeno texto-suave" style={{ margin: 0 }}>
              Vendendo como <b>CITi</b> (software sob medida).{" "}
              <button type="button" className="link-texto" onClick={() => setEditarOferta(true)}>mudar</button>
            </p>
          )}

          {erro && <div className="erro">{erro}</div>}

          {carregando ? (
            <div className="carregando" aria-live="polite">
              {ETAPAS.map((t, i) => (
                <div key={t} className={`passo-carga ${i < etapa ? "feito" : i === etapa ? "ativo" : ""}`}>
                  <span className="bolinha" />
                  {t}
                </div>
              ))}
              <span className="pequeno texto-suave">Leva uns 20 a 40 segundos.</span>
            </div>
          ) : (
            <div className="acoes">
              <button className="botao" type="submit">Preparar reunião</button>
            </div>
          )}
        </form>
      </section>

      <aside className="home-dir">
        <span className="rotulo">Reuniões preparadas</span>
        {leads.map((l) => (
          <Link key={l.id} href={`/lead/${l.id}`} className="ficha">
            <div className="ficha-topo">
              <span className="ficha-nome">{l.dossie.empresa}</span>
              {l.exemplo ? <span className="etiqueta">exemplo</span> : <span className="etiqueta">ICP {l.dossie.encaixe_icp.nota}/10</span>}
            </div>
            <span className="pequeno texto-suave">{l.dossie.segmento} · {l.dossie.localizacao}</span>
            <span className="pequeno texto-suave">
              {l.proposta ? "Proposta pronta" : l.ensaio?.avaliacao ? `Ensaio nota ${l.ensaio.avaliacao.nota}` : "Roteiro pronto"}
            </span>
          </Link>
        ))}
        <p className="pequeno texto-suave" style={{ margin: 0 }}>
          Os leads ficam salvos neste navegador. O exemplo é de uma empresa fictícia, para você ver o fluxo completo.
        </p>
      </aside>
    </div>
  );
}
