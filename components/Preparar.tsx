"use client";

// Aba 01: dossiê da empresa (esquerda) e roteiro da reunião (direita).
// As perguntas viram checklist: dá para usar a tela durante a reunião real e riscar o que já perguntou.

import type { Lead } from "@/lib/types";

type Props = { lead: Lead; atualizar: (m: Partial<Lead>) => void };

export default function Preparar({ lead, atualizar }: Props) {
  const { dossie: d, roteiro: r } = lead;
  const feitas = new Set(lead.perguntasFeitas ?? []);

  function alternar(i: number) {
    const novo = new Set(feitas);
    if (novo.has(i)) novo.delete(i);
    else novo.add(i);
    atualizar({ perguntasFeitas: [...novo] });
  }

  return (
    <div className="duas-colunas">
      {/* ---------------- DOSSIÊ ---------------- */}
      <div className="coluna col-esq">
        <section className="bloco">
          <div className="bloco-cab"><h2 className="titulo-secao">Dossiê</h2><span className="rotulo">o que a web diz</span></div>
          <p style={{ margin: 0, fontSize: 16 }}>{d.resumo}</p>
          <div className="fatos">
            <div><span className="rotulo">Segmento</span>{d.segmento}</div>
            <div><span className="rotulo">Porte</span>{d.porte}</div>
            <div style={{ flexBasis: "100%" }}><span className="rotulo">Presença digital</span>{d.presenca_digital}</div>
          </div>
        </section>

        <section className="bloco">
          <div className="bloco-cab"><h2 className="titulo-secao">Sinais</h2><span className="rotulo">fatos que abrem porta</span></div>
          <ul className="lista-limpa">
            {d.sinais.map((s) => <li key={s} className="item-ponto">{s}</li>)}
          </ul>
        </section>

        <section className="bloco">
          <div className="bloco-cab"><h2 className="titulo-secao">Dores prováveis</h2><span className="rotulo">hipóteses a confirmar</span></div>
          <ul className="lista-limpa">
            {d.dores_provaveis.map((x) => (
              <li key={x.dor} className="dor"><b>{x.dor}</b><span className="pequeno texto-suave">{x.por_que}</span></li>
            ))}
          </ul>
        </section>

        <section className="bloco">
          <div className="bloco-cab"><h2 className="titulo-secao">Oportunidades</h2><span className="rotulo">o que dá para oferecer</span></div>
          <ul className="lista-limpa">
            {d.oportunidades.map((o) => (
              <li key={o.titulo}><b style={{ fontWeight: 500 }}>{o.titulo}</b><span className="pequeno texto-suave">{o.descricao}</span></li>
            ))}
          </ul>
          <p className="pequeno" style={{ margin: 0 }}><span className="rotulo">Por que encaixa · </span>{d.encaixe_icp.justificativa}</p>
        </section>

        {d.incertezas.length > 0 && (
          <section className="incerteza">
            <span className="rotulo">Não confirmado · pergunte na reunião</span>
            {d.incertezas.map((x) => <span key={x} className="pequeno">{x}</span>)}
          </section>
        )}

        {lead.fontes.length > 0 && (
          <section className="bloco">
            <div className="bloco-cab"><span className="rotulo">Fontes da pesquisa ({lead.fontes.length})</span></div>
            <ul className="lista-limpa pequeno">
              {lead.fontes.slice(0, 10).map((f) => (
                <li key={f.url}><a href={f.url} target="_blank" rel="noreferrer">{f.titulo}</a></li>
              ))}
            </ul>
            {lead.consultas.length > 0 && (
              <span className="pequeno texto-suave">Buscas feitas pela IA: {lead.consultas.join(" · ")}</span>
            )}
          </section>
        )}
      </div>

      {/* ---------------- ROTEIRO ---------------- */}
      <div className="coluna col-dir">
        <section className="bloco">
          <div className="bloco-cab"><h2 className="titulo-secao">Abertura</h2><span className="rotulo">primeiros 5 minutos</span></div>
          <span className="rotulo">Rapport</span>
          {r.abertura.rapport.map((x) => <p key={x} className="fala" style={{ margin: 0 }}>{x}</p>)}
          <span className="rotulo" style={{ marginTop: 6 }}>Alinhar a agenda</span>
          <p className="fala" style={{ margin: 0 }}>{r.abertura.agenda}</p>
        </section>

        <section className="bloco">
          <div className="bloco-cab">
            <h2 className="titulo-secao">Perguntas</h2>
            <span className="rotulo">{feitas.size} de {r.perguntas.length} feitas · clique para riscar</span>
          </div>
          <div className="barra-progresso"><div style={{ width: `${(feitas.size / Math.max(r.perguntas.length, 1)) * 100}%` }} /></div>
          <div>
            {r.perguntas.map((q, i) => (
              <div key={i} className={`pergunta ${feitas.has(i) ? "feita" : ""}`} onClick={() => alternar(i)} role="checkbox" aria-checked={feitas.has(i)} tabIndex={0}
                onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), alternar(i))}>
                <span className={`spin spin-${q.tipo}`} title={q.tipo}>{q.tipo[0]}</span>
                <div className="pergunta-corpo">
                  <span className="pergunta-txt">{q.pergunta}</span>
                  <div className="pergunta-meta">
                    <span><b>objetivo</b>{q.objetivo}</span>
                    <span><b>vira na proposta</b>{q.info_para_proposta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <span className="pequeno texto-suave">S = Situação · P = Problema · I = Implicação · N = Necessidade</span>
        </section>

        <section className="bloco">
          <div className="bloco-cab"><h2 className="titulo-secao">Objeções prováveis</h2></div>
          {r.objecoes.map((o) => (
            <div key={o.objecao} className="objecao">
              <span style={{ fontFamily: "var(--serif)", fontSize: 19 }}>“{o.objecao}”</span>
              <span className="pequeno texto-suave">{o.resposta}</span>
            </div>
          ))}
        </section>

        <section className="bloco">
          <div className="bloco-cab"><h2 className="titulo-secao">Fechamento</h2><span className="rotulo">nunca saia sem próximo passo</span></div>
          <p className="pequeno" style={{ margin: 0 }}><span className="rotulo">Resumo · </span>{r.fechamento.resumo}</p>
          <p className="pequeno" style={{ margin: 0 }}><span className="rotulo">Próximo passo · </span>{r.fechamento.proximo_passo}</p>
          <p className="fala" style={{ margin: 0 }}>{r.fechamento.frase}</p>
        </section>
      </div>
    </div>
  );
}
