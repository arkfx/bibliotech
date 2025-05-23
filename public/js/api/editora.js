import { API_BASE } from "../config.js";

export async function getAllEditoras() {
  const response = await fetch(API_BASE + "/editoras", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar editoras.");
  }

  return response.json();
}

export async function getEditoraById(id) {
  const response = await fetch(API_BASE + `/editoras/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar editora.");
  }

  return response.json();
}

export async function createEditora(nome) {
  const response = await fetch(API_BASE + "/editoras", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome }),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar editora.");
  }

  return response.json();
}

export async function updateEditora(id, nome) {
  const response = await fetch(API_BASE + "/editoras", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, nome }),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar editora.");
  }

  return response.json();
}

export async function deleteEditora(id) {
  const response = await fetch(API_BASE + `/editoras/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    let errorMessage = "Erro ao excluir a editora.";
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
