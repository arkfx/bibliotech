import { API_BASE } from "../config.js";

export async function createBook(livro) {
  const response = await fetch(API_BASE + "/livros", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(livro),
  });

  if (!response.ok) {
    throw new Error("Falha no Cadastro do Livro");
  }

  return response.json();
}

export async function updateBook(livro) {
  const response = await fetch(API_BASE + "/livros", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(livro),
  });

  if (!response.ok) {
    let errorMessage = "Erro ao atualizar o livro.";
    try {
      const errorResponse = await response.json();
      if (errorResponse.message) {
        errorMessage = errorResponse.message;
      }
    } catch (e) {
      console.error("Erro ao processar a resposta de erro:", e);
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getBooks({ pagina = 1, limite = 1000 } = {}) {
  const url = new URL(API_BASE + "/livros");
  url.searchParams.append("pagina", pagina);
  url.searchParams.append("limite", limite);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar os livros.");
  }

  return response.json();
}

export async function getBookById(id) {
  const response = await fetch(API_BASE + `/livros/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar o livro.");
  }

  return response.json();
}

export async function searchBooks({
  query = "",
  genero_id = null,
  ordem = "DESC",
  pagina = 1,
  limite = 12,
} = {}) {
  const url = new URL(API_BASE + "/livros");

  if (query) url.searchParams.append("q", query);
  if (genero_id) url.searchParams.append("genero_id", genero_id);
  if (ordem === "ASC" || ordem === "DESC") {
    url.searchParams.append("ordem", ordem);
  }

  url.searchParams.append("pagina", pagina);
  url.searchParams.append("limite", limite);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar os livros.");
  }

  return response.json();
}

export async function deleteBook(id) {
  const response = await fetch(API_BASE + `/livros/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = "Erro ao deletar o livro.";
    try {
      const errorResponse = await response.json();
      if (errorResponse.message) {
        errorMessage = errorResponse.message;
      }
    } catch (e) {
      console.error("Erro ao processar a resposta de erro:", e);
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
