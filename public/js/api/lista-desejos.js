import { obterUserId } from "../utils/auth-utils.js";
import { API_BASE } from "../config.js";

export async function getListaDesejos(usuarioId) {
  const response = await fetch(`${API_BASE}/desejos?usuario_id=${usuarioId}`);
  return response.json();
}

export async function adicionarLivroListaDesejos(livroId) {
  const response = await fetch(`${API_BASE}/desejos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ livro_id: livroId }),
    credentials: "include",
  });

  return response.json();
}

export async function removerLivroListaDesejos(livroId) {
  const response = await fetch(`${API_BASE}/desejos/${livroId}`, {
    method: "DELETE",
    credentials: "include",
  });

  return response.json();
}

export async function verificarLivroNaListaDesejos(usuarioId, livroId) {
  const response = await fetch(
    `${API_BASE}/desejos?usuario_id=${usuarioId}&livro_id=${livroId}`
  );
  const data = await response.json();

  if (data.status === "success") {
    return data.exists;
  }

  throw new Error("Falha ao verificar lista de desejos.");
}
