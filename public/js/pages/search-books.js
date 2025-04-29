import { searchBooks } from "../api/livro.js";
import { renderBooks, renderSkeletons } from "../utils/renderBooks.js";

const searchInput = document.querySelector(".main-nav-list input");
const searchButton = document.querySelector(".main-nav-list button");
const genreFilter = document.querySelector(".filter-genres");
const gridContainer = document.querySelector(".grid--4-cols");
const sectionTitle = document.querySelector(".heading-secondary");
const modal = document.getElementById("cadastroModal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

function abrirModal(titulo, mensagem) {
  modalTitle.textContent = titulo;
  modalMessage.textContent = mensagem;
  modal.style.display = "flex";
}

// Fechar o modal ao clicar no botão "Entendi"
modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fechar o modal ao clicar fora dele
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Atualiza o título da seção com base na busca
function atualizarTitulo(query, generoId) {
  if (query && generoId) {
    const generoNome = genreFilter.options[genreFilter.selectedIndex].text;
    sectionTitle.textContent = `Resultados para "${query}" - Gênero: ${generoNome}`;
  } else if (generoId) {
    const generoNome = genreFilter.options[genreFilter.selectedIndex].text;
    sectionTitle.textContent = `Gênero: ${generoNome}`;
  } else if (query) {
    sectionTitle.textContent = `Resultados para "${query}"`;
  } else {
    sectionTitle.textContent = "Livros em destaque";
  }
}

// Função para buscar livros
async function buscarLivros() {
  const query = searchInput.value.trim();
  const generoId = genreFilter.value;

  atualizarTitulo(query, generoId);

  //exibir skeletons enquanto os livros são carregados
  renderSkeletons(gridContainer);

  try {
    const response = await searchBooks(query, generoId);
    if (response.status === "success") {
      renderBooks(gridContainer, response.data, (tituloLivro) => {
        abrirModal(
          "Aviso de Compra",
          `O livro "${tituloLivro}" ainda não pode ser comprado. Esta funcionalidade está em desenvolvimento.`
        );
      });
    } else {
      gridContainer.innerHTML = `<p>${response.message}</p>`;
    }
  } catch (error) {
    console.error("Erro ao buscar os livros:", error);
    gridContainer.innerHTML =
      "<p>Erro ao buscar os livros. Tente novamente mais tarde.</p>";
  }
}

searchButton.addEventListener("click", buscarLivros);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    buscarLivros();
  }
});