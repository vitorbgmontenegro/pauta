// Chamada às rotas internas a partir do navegador, com erro legível.
export async function postar<T>(url: string, corpo: unknown): Promise<T> {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error((dados as { erro?: string }).erro || `Erro ${resp.status}`);
  return dados as T;
}
