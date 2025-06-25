import { API_BASE } from "../config.js";

export async function getGeneros() {
  const response = await fetch(API_BASE + "/generos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("Response received:", response);

  if (!response.ok) {
    throw new Error("Erro ao buscar os gêneros.");
  }

  return response.json();
}

export async function createGenero(nome) {
  const response = await fetch(`${API_BASE}/generos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Erro ao criar gênero." }));
    throw new Error(errorData.message || "Erro ao criar gênero.");
  }
  return response.json();
}

export async function updateGenero(id, nome) {
  const response = await fetch(`${API_BASE}/generos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Erro ao atualizar gênero." }));
    throw new Error(errorData.message || "Erro ao atualizar gênero.");
  }
  return response.json();
}

export async function deleteGenero(id) {
  const response = await fetch(`${API_BASE}/generos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Erro ao excluir gênero." }));
    throw new Error(errorData.message || "Erro ao excluir gênero.");
  }
  return response.json();
}
