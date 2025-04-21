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
              <img src="${livro.capa}" alt="Capa do livro ${livro.titulo}" />
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
