import { searchBooks } from "../api/livro.js";

const searchInput = document.querySelector(".main-nav-list input");
const searchButton = document.querySelector(".main-nav-list button");
const genreFilter = document.querySelector(".filter-genres");
const gridContainer = document.querySelector(".grid--4-cols");
const sectionTitle = document.querySelector(".heading-secondary");

function exibirLivros(livros) {
  gridContainer.innerHTML = "";

  if (livros.length === 0) {
    gridContainer.innerHTML = "<p>Nenhum livro encontrado.</p>";
    return;
  }

  livros.forEach((livro) => {
    const bookCard = `
      <div class="book-card">
        <div class="book-cover">
          <img src="${livro.imagem_url}" alt="Capa do livro ${livro.titulo}" />
        </div>
        <div class="book-info">
          <h3>${livro.titulo}</h3>
          <p>${livro.autor}</p>
          <strong>R$ ${livro.preco}</strong>
          <br />
          <button class="btn-comprar" data-titulo="${livro.titulo}">Comprar</button>
        </div>
      </div>
    `;
    gridContainer.insertAdjacentHTML("beforeend", bookCard);
  });

  // Reatribuir eventos de clique aos botões "Comprar"
  const comprarButtons = document.querySelectorAll(".btn-comprar");
  comprarButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const tituloLivro = e.target.getAttribute("data-titulo");
      abrirModal(
        "Aviso de Compra",
        `O livro "${tituloLivro}" ainda não pode ser comprado. Esta funcionalidade está em desenvolvimento.`
      );
    });
  });
}
// Função para mostrar skeletons enquanto a busca é realizada
function mostrarCarregamento(container) {
  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const skeletonCard = `
        <div class="book-card skeleton-card">
          <div class="book-cover skeleton-cover"></div>
          <div class="book-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-author"></div>
            <div class="skeleton-price"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      `;
    container.insertAdjacentHTML("beforeend", skeletonCard);
  }
}

// Função para buscar livros
async function buscarLivros() {
  const query = searchInput.value.trim();
  const genero = genreFilter.value;

  //verifica se o valor do filtro de gênero é diferente de "todos"
  if (query && genero) {
    sectionTitle.textContent = `Resultados para "${query}" - Gênero: ${genero}`;
  } else if (genero) {
    sectionTitle.textContent = `Gênero: ${genero}`;
  } else if (query) {
    sectionTitle.textContent = `Resultados para "${query}"`;
  } else {
    sectionTitle.textContent = "Livros em destaque";
  }

  mostrarCarregamento(gridContainer);

  try {
    const response = await searchBooks(query, genero);
    if (response.status === "success") {
      exibirLivros(response.data);
    } else {
      gridContainer.innerHTML = `<p>${response.message}</p>`;
    }
  } catch (error) {
    console.error("Erro ao buscar os livros:", error);
    gridContainer.innerHTML =
      "<p>Erro ao buscar os livros. Tente novamente mais tarde.</p>";
  }
}

// Adicionar eventos de busca
searchButton.addEventListener("click", buscarLivros);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    buscarLivros();
  }
});

const comprarButtons = document.querySelectorAll(".btn-comprar");
comprarButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    abrirModal(
      "Aviso de Compra",
      `O livro ainda não pode ser comprado. Esta funcionalidade está em desenvolvimento.`
    );
  });
});

const modal = document.getElementById("cadastroModal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

// Função para abrir o modal
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
