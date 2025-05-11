import { getGeneros } from "../api/genero.js";

export async function carregarGeneros(selectClass) {
  try {
    const generoSelect = document.querySelector(`.${selectClass}`); // Seleciona o elemento pela classe
    if (!generoSelect) {
      console.error(`Elemento com a classe "${selectClass}" não encontrado.`);
      return;
    }

    const response = await getGeneros(); 
    
    if (response.status === "success") {
      console.log("Gêneros carregados com sucesso:", response);
      response.data.forEach((genero) => {
        const option = document.createElement("option");
        option.value = genero.id;
        option.textContent = genero.nome;
        generoSelect.appendChild(option);
      });
    } else {
      console.error("Erro ao carregar gêneros:", response.message);
    }
  } catch (error) {
    console.error("Erro ao buscar gêneros:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarGeneros("genero"); // Classe do <select> de gêneros
});