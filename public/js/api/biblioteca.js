import { API_BASE } from "../config.js";

/**
 * Busca os livros da biblioteca do usuário autenticado.
 * @returns {Promise<Object>} Uma promessa que resolve com os dados da resposta da API.
 *                           Espera-se que data.data contenha um array de livros.
 * @throws {Error} Se a requisição falhar ou a resposta não for bem-sucedida.
 */
export async function getLivrosDaBiblioteca() {
  try {
    const response = await fetch(`${API_BASE}/biblioteca`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      let errorData;
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = await response.text();
      }
      console.error("Erro na resposta da API:", response.status, errorData);
      throw new Error(
        errorData?.message ||
          `Erro ao buscar livros da biblioteca: ${response.status}`
      );
    }

    if (!contentType || !contentType.includes("application/json")) {
      console.error("Resposta não é JSON:", await response.text());
      throw new Error("A resposta do servidor não está no formato JSON esperado.");
    }

    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Erro ao processar a solicitação no servidor.");
    }

    return data; 
  } catch (error) {
    console.error("Erro ao buscar livros da biblioteca:", error);
    throw error;
  }
}