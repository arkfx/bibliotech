import { verificarSessao } from "../api/session.js";

/**
 * Retorna o ID do usuário logado, buscando da sessão apenas uma vez.
 * Se o usuário não estiver logado, retorna null.
 */
export async function obterUserId() {
  if (window.userId) {
    return window.userId;
  }

  try {
    const data = await verificarSessao();
    if (data.status === "success") {
      window.userId = data.userId;
      return data.userId;
    } else {
      window.userId = null;
      return null;
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    window.userId = null;
    return null;
  }
}

/**
 * Verifica se o usuário está logado.
 * @returns {Promise<boolean>}
 */
export async function usuarioLogado() {
  const id = await obterUserId();
  return !!id;
}
