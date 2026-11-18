"use client";

// Aba 02: ensaio com cliente simulado.
// O vendedor conversa por chat; a IA interpreta o dono da empresa e só revela as dores se for bem perguntada.
// No fim, "Encerrar e avaliar" dá a nota e mostra quais dores ficaram escondidas.

import { useEffect, useRef, useState } from "react";
import { postar } from "@/lib/api";
import type { Avaliacao, Lead, Mensagem } from "@/lib/types";

type Props = { lead: Lead; atualizar: (m: Partial<Lead>) => void; irPara: () => void };

export default function Ensaiar({ lead, atualizar, irPara }: Props) {
  const mensagens = lead.ensaio?.mensagens ?? [];
  const avaliacao = lead.ensaio?.avaliacao;
  const p = lead.persona;

  const [texto, setTexto] = useState("");
  const [esperando, setEsperando] = useState(false);
  const [avaliando, setAvaliando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mensagens.length, esperando]);

  function gravar(novas: Mensagem[], av?: Avaliacao) {
    atualizar({ ensaio: { mensagens: novas, avaliacao: av } });
  }

  async function enviar(fala: string) {
    const limpa = fala.trim();
    if (!limpa || esperando) return;
    const novas: Mensagem[] = [...mensagens, { autor: "vendedor", texto: limpa }];
    gravar(novas); // nova fala invalida avaliação anterior
    setTexto("");
    setErro("");
    setEsperando(true);
    try {
      const r = await postar<{ texto: string }>("/api/ensaio", {
        lead: { entrada: lead.entrada, dossie: lead.dossie, persona: lead.persona },
        mensagens: novas,
      });
      gravar([...novas, { autor: "cliente", texto: r.texto }]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro no ensaio.");
    } finally {
      setEsperando(false);
    }
  }

  async function avaliar() {
    setErro("");
    setAvaliando(true);
    try {
      const av = await postar<Avaliacao>("/api/ensaio/avaliar", {
        lead: { dossie: lead.dossie, roteiro: lead.roteiro, persona: lead.persona },
        mensagens,
      });
      gravar(mensagens, av);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro na avaliação.");
    } finally {
      setAvaliando(false);
    }
  }

  /** Leva a conversa do ensaio para a aba de proposta como anotação. */
  function usarNaProposta() {
    const resumo = mensagens
      .filter((m) => m.autor === "cliente")
      .map((m) => `- ${m.texto}`)
      .join("\n");
    atualizar({ anotacoes: `O que o cliente falou no ensaio:\n${resumo}` });
    irPara();
  }

  const proximas = lead.roteiro.perguntas.filter((_, i) => !(lead.perguntasFeitas ?? []).includes(i)).slice(0, 4);

  return (
    <div className="ensaio">
      <div className="chat">
        <div className="chat-cab">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <b style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 22 }}>{p.nome}</b>
            <span className="pequeno texto-suave">{p.cargo} · {p.personalidade}</span>
          </div>
          {mensagens.length > 0 && (
            <button className="link-texto" onClick={() => gravar([])} disabled={esperando}>recomeçar</button>
          )}
        </div>

        <div className="chat-msgs">
          {mensagens.length === 0 && (
            <div className="chat-vazio">
              <span className="titulo-secao">Treine antes da reunião de verdade.</span>
              <span className="pequeno">
                {p.nome} tem problemas que só conta se você perguntar bem. Comece pela abertura do roteiro.
              </span>
            </div>
          )}
          {mensagens.map((m, i) => (
            <div key={i} className={`msg msg-${m.autor}`}>
              <span className="rotulo">{m.autor === "vendedor" ? "você" : p.nome}</span>
              <div className="msg-balao">{m.texto}</div>
            </div>
          ))}
          {esperando && (
            <div className="msg msg-cliente">
              <span className="rotulo">{p.nome}</span>
              <div className="msg-balao texto-suave">pensando…</div>
            </div>
          )}
          <div ref={fimRef} />
        </div>

        {erro && <div className="erro" style={{ margin: "0 12px 12px" }}>{erro}</div>}

        <form className="chat-form" onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={`Fale com ${p.nome}…`} disabled={esperando} />
          <button className="botao" type="submit" disabled={esperando || !texto.trim()}>Enviar</button>
        </form>
      </div>

      <div className="lateral">
        {!avaliacao && (
          <>
            <div className="cola">
              <span className="rotulo">Cola do roteiro · clique para usar</span>
              {mensagens.length === 0 && (
                <button onClick={() => setTexto(`${lead.roteiro.abertura.rapport[0] ?? ""} ${lead.roteiro.abertura.agenda}`.trim())}>
                  ↳ Abertura: {lead.roteiro.abertura.rapport[0]}
                </button>
              )}
              {proximas.map((q) => (
                <button key={q.pergunta} onClick={() => setTexto(q.pergunta)}>↳ <b>{q.tipo[0]}</b> {q.pergunta}</button>
              ))}
            </div>
            <button className="botao" onClick={avaliar} disabled={avaliando || mensagens.length < 4}>
              {avaliando ? "Avaliando…" : "Encerrar e avaliar"}
            </button>
            {mensagens.length < 4 && <span className="pequeno texto-suave">Troque pelo menos duas falas para pedir a avaliação.</span>}
          </>
        )}

        {avaliacao && (
          <div className="avaliacao">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <span className="nota-grande">{avaliacao.nota}</span>
              <span className="rotulo" style={{ paddingBottom: 8 }}>de 10</span>
            </div>
            <p style={{ margin: 0 }}>{avaliacao.resumo}</p>

            <div className="dores-reveladas">
              <div className="achou">
                <span className="rotulo">Você descobriu</span>
                {avaliacao.dores_descobertas.length ? avaliacao.dores_descobertas.map((x) => <span key={x} className="pequeno">{x}</span>) : <span className="pequeno">nenhuma dor</span>}
              </div>
              <div className="escondida">
                <span className="rotulo">Ficou escondido</span>
                {avaliacao.dores_nao_descobertas.length ? avaliacao.dores_nao_descobertas.map((x) => <span key={x} className="pequeno">{x}</span>) : <span className="pequeno">nada, mandou bem</span>}
              </div>
            </div>

            <div className="bloco">
              <span className="rotulo">Pontos fortes</span>
              <ul className="lista-limpa pequeno">{avaliacao.pontos_fortes.map((x) => <li key={x} className="item-ponto">{x}</li>)}</ul>
            </div>
            <div className="bloco">
              <span className="rotulo">Faltou</span>
              <ul className="lista-limpa pequeno">{avaliacao.faltou.map((x) => <li key={x} className="item-ponto">{x}</li>)}</ul>
            </div>
            <div className="bloco">
              <span className="rotulo">Na próxima, pergunte</span>
              {avaliacao.proxima_vez.map((x) => <p key={x} className="fala" style={{ margin: 0, fontSize: 18 }}>{x}</p>)}
            </div>

            <div className="acoes">
              <button className="botao botao-claro botao-mini" onClick={() => gravar(mensagens)}>Continuar conversa</button>
              <button className="botao botao-claro botao-mini" onClick={() => gravar([])}>Ensaiar de novo</button>
              <button className="botao botao-mini" onClick={usarNaProposta}>Levar para a proposta →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
