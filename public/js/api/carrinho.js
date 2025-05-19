import { API_BASE } from "../config.js";
import { searchBooks } from "./livro.js";

export async function addBookToCart(livroId, quantidade) {
  try {
    const response = await fetch(API_BASE + "/carrinho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: livroId, quantidade }),
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType?.includes("application/json")) {
      const erroTexto = await response.text();
      throw new Error("Erro do servidor: " + erroTexto.slice(0, 100));
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    throw error;
  }
}

export async function getCarrinhoDoUsuario() {
  try {
    const response = await fetch(`${API_BASE}/carrinho`);

    if (!response.ok) {
      throw new Error("Erro ao buscar o carrinho.");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao obter carrinho:", error);
    throw error;
  }
}

export async function removerDoCarrinho(livroId) {
  try {
    const res = await fetch(API_BASE + "/carrinho", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: livroId }), // 🔥 Removido userId
    });

    const contentType = res.headers.get("content-type");

    if (!res.ok || !contentType || !contentType.includes("application/json")) {
      throw new Error("Resposta inesperada do servidor.");
    }

    const data = await res.json();

    if (data.status === "success") {
      console.log("Item removido com sucesso!");
    } else {
      alert("Erro ao remover: " + data.message);
    }
  } catch (error) {
    console.error("Erro ao remover item:", error);
    alert("Erro inesperado.");
  }
}

export async function atualizarQuantidadeNoServidor(livroId, novaQuantidade) {
  try {
    const res = await fetch(API_BASE + "/carrinho", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: livroId, quantidade: novaQuantidade }),
    });

    const contentType = res.headers.get("content-type");

    if (!res.ok || !contentType || !contentType.includes("application/json")) {
      throw new Error("Resposta inesperada do servidor.");
    }

    const data = await res.json();

    if (data.status !== "success") {
      alert("Erro ao atualizar: " + data.message);
      throw new Error(data.message);
    }

    console.log("Quantidade atualizada com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error);
    alert("Erro ao atualizar quantidade no servidor.");
  }
}
