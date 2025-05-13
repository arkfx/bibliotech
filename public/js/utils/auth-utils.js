import { API_BASE } from "../config.js";

let userId = null;

/**
 * Retorna o ID do usuário logado, buscando da sessão apenas uma vez.
 * Se o usuário não estiver logado, retorna null.
 */
export async function obterUserId() {
  if (userId !== null) return userId;

  try {
    const res = await fetch(API_BASE + "/session-status.php");
    const data = await res.json();

    if (data.status === "success") {
      userId = data.userId;
      return userId;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Erro ao verificar sessão:", err);
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
