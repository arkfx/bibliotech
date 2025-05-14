import { API_BASE } from "../config.js";

/**
 * Fetch all publishers
 * @returns {Promise} Promise with publishers data
 */
export async function getAllEditoras() {
  const response = await fetch(API_BASE + "/editora.php", {
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

/**
 * Get a publisher by ID
 * @param {number} id - Publisher ID
 * @returns {Promise} Promise with publisher data
 */
export async function getEditoraById(id) {
  const response = await fetch(API_BASE + `/editora.php?id=${id}`, {
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

/**
 * Create a new publisher
 * @param {string} nome - Publisher name
 * @returns {Promise} Promise with creation result
 */
export async function createEditora(nome) {
  const response = await fetch(API_BASE + "/editora.php", {
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

/**
 * Update a publisher
 * @param {number} id - Publisher ID
 * @param {string} nome - New publisher name
 * @returns {Promise} Promise with update result
 */
export async function updateEditora(id, nome) {
  const response = await fetch(API_BASE + "/editora.php", {
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

/**
 * Delete a publisher
 * @param {number} id - Publisher ID to delete
 * @returns {Promise} Promise with deletion result
 */
export async function deleteEditora(id) {
  const response = await fetch(API_BASE + "/editora.php", {
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