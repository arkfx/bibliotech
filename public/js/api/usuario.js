
import { API_BASE } from "../config.js";

/**
 * Obtém os dados do usuário pelo ID.
 * @param {number} userId - ID do usuário.
 * @returns {Promise<Object>} - Dados do usuário.
 */
export async function getUsuario(userId) {
  const response = await fetch(`${API_BASE}/usuarios/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro ao buscar os dados do usuário.");
  }

  return response.json();
}

/**
 * Atualiza os dados do usuário pelo ID.
 * @param {number} userId - ID do usuário.
 * @param {Object} usuario - Dados atualizados do usuário.
 * @returns {Promise<Object>} - Resposta do servidor.
 */
export async function updateUsuario(userId, usuario) {
  try {
    const response = await fetch(`${API_BASE}/usuarios/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(usuario),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { 
        status: "error", 
        message: responseData.message || "Erro ao atualizar usuário." 
      };
    }

    return responseData; 

  } catch (error) {
    // Erros de rede
    return { 
      status: "error", 
      message: "Falha na conexão com o servidor." 
    };
  }
}

export async function alterarSenhaUsuario(userId, senhaAtual, novaSenha) {
  try {
    const response = await fetch(`${API_BASE}/usuarios/${userId}/senha`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      }),
    });
    return await response.json();
  } catch (error) {
    return { status: "error", message: "Erro ao conectar ao servidor." };
  }
}