import { getGeneros } from "../api/genero.js";
import { searchBooks } from "../api/livro.js";
import { renderBooks, renderSkeletons } from "../utils/renderBooks.js";
import {
  carregarListaDesejos,
  configurarBotoesFavoritos,
} from "../utils/wishlist-utils.js";

export async function carregarGeneros(selectClass) {
  console.log("Carregando gêneros...");
  try {
    const generoSelect = document.querySelector(`.${selectClass}`);
    if (!generoSelect) {
      console.error(`Elemento com a classe "${selectClass}" não encontrado.`);
      return;
    }

    generoSelect.innerHTML = '<option value="">Todos os Gêneros</option>';

    const response = await getGeneros();
    console.log("Resposta da API de gêneros:", response);

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

async function carregarLivrosPorGenero() {
  const container = document.getElementById("generos-container");

  try {
    const generosResponse = await getGeneros();
    if (generosResponse.status !== "success") {
      throw new Error("Erro ao carregar gêneros.");
    }

    const generos = generosResponse.data;
    const favoritos = await carregarListaDesejos();

    for (const genero of generos) {
      const generoSection = document.createElement("section");
      generoSection.classList.add("genero-section");

      const generoTitulo = document.createElement("h2");
      generoTitulo.textContent = genero.nome;
      generoTitulo.classList.add("heading-secondary");

      const livrosGrid = document.createElement("div");
      livrosGrid.classList.add("grid", "grid--4-cols");

      renderSkeletons(livrosGrid, 4);

      generoSection.appendChild(generoTitulo);
      generoSection.appendChild(livrosGrid);
      container.appendChild(generoSection);

      const livrosResponse = await searchBooks({ genero_id: genero.id });
      if (livrosResponse.status === "success") {
        const livros = livrosResponse.data;

        if (livros.length > 0) {
          livrosGrid.innerHTML = "";
          renderBooks(livrosGrid, livros);
          configurarBotoesFavoritos(favoritos, ".btn-favorito");
        } else {
          container.removeChild(generoSection);
        }
      } else {
        container.removeChild(generoSection);
        console.warn(
          `Erro ao carregar livros para o gênero ${genero.nome}: ${livrosResponse.message}`
        );
      }
    }
  } catch (error) {
    console.error("Erro ao carregar livros por gênero:", error);
    container.innerHTML =
      "<p>Erro ao carregar os livros. Tente novamente mais tarde.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const generoSelect = document.querySelector(".genero");
  if (generoSelect) {
    carregarGeneros("genero");
  }

  const container = document.getElementById("generos-container");
  const modal = document.getElementById("cadastroModal");

  if (modal) {
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  if (container) {
    carregarLivrosPorGenero();

    window.addEventListener("pageshow", async (event) => {
      if (
        event.persisted ||
        performance.getEntriesByType("navigation")[0].type === "back_forward"
      ) {
        try {
          const favoritos = await carregarListaDesejos();
          configurarBotoesFavoritos(favoritos, ".btn-favorito");
        } catch (error) {
          console.error(
            "Erro ao atualizar a lista de desejos ao voltar:",
            error
          );
        }
      }
    });
  }
});
