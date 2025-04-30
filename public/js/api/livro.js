import { API_BASE } from "../config.js";

export async function createBook(
  titulo,
  autor,
  genero_id,
  preco,
  editora,
  descricao,
  imagem_url
) {
  const response = await fetch(API_BASE + "/livro.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ titulo, autor, genero_id, preco, editora, descricao, imagem_url }),
  });

  if (!response.ok) {
    throw new Error("Falha no Cadastro do Livro");
  }

  return response.json();
}

export async function getBooks() {
  const response = await fetch(API_BASE + "/livro.php", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("Response received:", response);

  if (!response.ok) {
    throw new Error("Erro ao buscar os livros.");
  }

  return response.json();
}

export async function getBookById(id) {
  const response = await fetch(API_BASE + `/livro.php?id=${id}`, {
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

export async function searchBooks(query = "", genero_id = null, ordem = "DESC") {
  const url = new URL(API_BASE + "/livro.php");

  if (query) url.searchParams.append("q", query);
  if (genero_id) url.searchParams.append("genero_id", genero_id);
  if (ordem && (ordem === "ASC" || ordem === "DESC")) {
    url.searchParams.append("ordem", ordem);
  }

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
  const response = await fetch(API_BASE + `/livro.php?id=${id}`, {
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

export async function updateBook(
  id,
  titulo,
  autor,
  genero_id,
  preco,
  editora,
  descricao,
  imagem_url
) {
  const response = await fetch(API_BASE + "/livro.php", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      titulo,
      autor,
      genero_id,
      preco,
      editora,
      descricao,
      imagem_url,
    }),
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
