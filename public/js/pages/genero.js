import { API_BASE } from "../config.js";

export async function carregarGeneros(selectId) {
  try {
    const response = await fetch(`${API_BASE}/genero.php`);
    const data = await response.json();

    if (data.status === "success") {
      const generoSelect = document.getElementById(selectId);
      if (!generoSelect) {
        console.error(`Elemento com ID "${selectId}" não encontrado.`);
        return;
      }

      data.data.forEach((genero) => {
        const option = document.createElement("option");
        option.value = genero.id;
        option.textContent = genero.nome;
        generoSelect.appendChild(option);
      });
    } else {
      console.error("Erro ao carregar gêneros:", data.message);
    }
  } catch (error) {
    console.error("Erro ao buscar gêneros:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarGeneros("genero"); // ID do <select> de gêneros
  });
