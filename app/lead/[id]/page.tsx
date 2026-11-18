"use client";

// Página de um lead: cabeçalho com o encaixe no ICP e as três abas (Preparar, Ensaiar, Propor).
// O lead mora no localStorage; cada aba recebe o lead e uma função para atualizá-lo.

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Ensaiar from "@/components/Ensaiar";
import Preparar from "@/components/Preparar";
import Propor from "@/components/Propor";
import { apagarLead, buscarLead, salvarLead } from "@/lib/storage";
import type { Lead } from "@/lib/types";

type Aba = "preparar" | "ensaiar" | "propor";

const ABAS: { id: Aba; num: string; nome: string; dica: string }[] = [
  { id: "preparar", num: "01", nome: "Preparar", dica: "dossiê e roteiro" },
  { id: "ensaiar", num: "02", nome: "Ensaiar", dica: "cliente simulado" },
  { id: "propor", num: "03", nome: "Propor", dica: "proposta" },
];

export default function PaginaLead() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null | undefined>(undefined);
  const [aba, setAba] = useState<Aba>("preparar");

  useEffect(() => {
    setLead(buscarLead(id) ?? null);
  }, [id]);

  /** Atualiza o lead na tela e no armazenamento ao mesmo tempo. */
  function atualizar(mudanca: Partial<Lead>) {
    setLead((atual) => {
      if (!atual) return atual;
      const novo = { ...atual, ...mudanca };
      salvarLead(novo);
      return novo;
    });
  }

  if (lead === undefined) return <p className="texto-suave">Abrindo…</p>;
  if (lead === null)
    return (
      <div className="bloco">
        <h1 className="titulo-medio">Lead não encontrado</h1>
        <p className="texto-suave">Os leads ficam salvos no navegador onde foram criados.</p>
        <Link className="botao" href="/">Voltar</Link>
      </div>
    );

  const d = lead.dossie;
  return (
    <>
      <div className="cabeca-lead">
        <div className="cabeca-lead-txt">
          <span className="rotulo">
            <Link href="/">← reuniões</Link> · {d.segmento}
            {lead.exemplo && " · exemplo fictício"}
          </span>
          <h1 className="titulo-grande">{d.empresa}</h1>
          <span className="texto-suave">{d.localizacao} · {d.porte}</span>
        </div>
        <div className="carimbo" title={d.encaixe_icp.justificativa}>
          <span>encaixe</span>
          <b>{d.encaixe_icp.nota}</b>
          <span>de 10</span>
        </div>
      </div>

      <nav className="abas">
        {ABAS.map((a) => (
          <button key={a.id} className={`aba ${aba === a.id ? "atual" : ""}`} onClick={() => setAba(a.id)}>
            <small>{a.num}</small>
            <b>{a.nome}</b>
            <small>{a.dica}</small>
          </button>
        ))}
        {!lead.exemplo && (
          <button
            className="link-texto"
            style={{ marginLeft: "auto" }}
            onClick={() => {
              if (confirm("Apagar este lead?")) {
                apagarLead(lead.id);
                router.push("/");
              }
            }}
          >
            apagar lead
          </button>
        )}
      </nav>

      {aba === "preparar" && <Preparar lead={lead} atualizar={atualizar} />}
      {aba === "ensaiar" && <Ensaiar lead={lead} atualizar={atualizar} irPara={() => setAba("propor")} />}
      {aba === "propor" && <Propor lead={lead} atualizar={atualizar} />}
    </>
  );
}
