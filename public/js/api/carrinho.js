import { API_BASE } from "../config.js";

export async function addBookToCart(livroId, quantidade, tipo) {
  try {
    const response = await fetch(API_BASE + "/carrinho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: livroId, quantidade, tipo }),
    });

    let responseData;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      // Se não for JSON, lê como texto para o caso de erro não JSON
      responseData = { message: await response.text() }; 
    }

    if (!response.ok) {
      const errorMessage = responseData.message || `Erro HTTP ${response.status} ao adicionar ao carrinho.`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData; // Anexa todos os dados da resposta
      throw error;
    }

    return responseData; // Retorna os dados em caso de sucesso
  } catch (error) {
    // Se o erro já foi construído e lançado no bloco try (com status, data), relança.
    // Caso contrário, pode ser um erro de rede ou outro erro inesperado.
    if (error.status) {
        console.error(`Erro ${error.status} ao adicionar ao carrinho:`, error.message, error.data);
    } else {
        console.error("Erro de rede ou inesperado ao adicionar ao carrinho:", error);
    }
    throw error; // Relança o erro para ser tratado pelo chamador
  }
}

export async function getCarrinhoDoUsuario() {
  try {
    const response = await fetch(`${API_BASE}/carrinho`);
    let responseData;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage = responseData.message || `Erro HTTP ${response.status} ao buscar o carrinho.`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }
    return responseData;
  } catch (error) {
    if (error.status) {
        console.error(`Erro ${error.status} ao buscar carrinho:`, error.message, error.data);
    } else {
        console.error("Erro de rede ou inesperado ao buscar carrinho:", error);
    }
    throw error;
  }
}

export async function removerDoCarrinho(livroId, tipo) {
  try {
    const response = await fetch(API_BASE + "/carrinho", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: livroId, tipo }),
    });

    let responseData;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage = responseData.message || `Erro HTTP ${response.status} ao remover do carrinho.`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }
    return responseData; 

  } catch (error) {
    if (error.status) {
        console.error(`Erro ${error.status} ao remover do carrinho:`, error.message, error.data);
    } else {
        console.error("Erro de rede ou inesperado ao remover do carrinho:", error);
    }
    throw error;
  }
}

export async function atualizarQuantidadeNoServidor(livroId, novaQuantidade, tipo) {
  try {
    const response = await fetch(API_BASE + "/carrinho", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: livroId, quantidade: novaQuantidade, tipo }),
    });

    let responseData;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage = responseData.message || `Erro HTTP ${response.status} ao atualizar quantidade.`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }
    return responseData;

  } catch (error) {
    if (error.status) {
        console.error(`Erro ${error.status} ao atualizar quantidade:`, error.message, error.data);
    } else {
        console.error("Erro de rede ou inesperado ao atualizar quantidade:", error);
    }
    throw error;
  }
}