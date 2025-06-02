import {
  getLivrosDaBiblioteca,
  getLinkDoLivroNaBiblioteca,
} from "../api/biblioteca.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const booksCatalog = document.querySelector(".books-catalog");
    const emptyState = document.getElementById("empty-library");

    const response = await getLivrosDaBiblioteca();
    const livros = response.data || [];

    if (livros.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    } else {
      emptyState.classList.add("hidden");
    }

    // Renderiza o catálogo completo
    renderizarLivros(livros, booksCatalog);
  } catch (error) {
    console.error("Erro ao carregar biblioteca:", error);
    alert(
      "Ocorreu um erro ao carregar sua biblioteca. Por favor, tente novamente mais tarde."
    );
  }
});

function renderizarLivros(livros, container) {
  if (!container) return;

  container.innerHTML = "";

  if (livros.length === 0) {
    container.innerHTML = `<p class="empty-message">Nenhum livro encontrado.</p>`;
    return;
  }

  livros.forEach((livro) => {
    const livroElement = criarElementoLivro(livro);
    container.appendChild(livroElement);
  });
}

function criarElementoLivro(livro) {
  const livroElement = document.createElement("div");
  livroElement.className = "book-card";
  livroElement.dataset.id = livro.id;

  const capaUrl = livro.imagem_url;
  const dataFormatada = formatarData(livro.data_adquirido);
  const nomeGenero = livro.nome_genero || "Gênero não informado";

  livroElement.innerHTML = `
    <div class="book-cover-container">
      <img src="${capaUrl}" alt="Capa do livro ${livro.titulo}" class="book-cover" />
    </div>
    <div class="book-info">
      <h3 class="book-title">${livro.titulo}</h3>
      <p class="book-genre">${nomeGenero}</p>
      <p class="book-author">${livro.autor}</p>
      <div class="book-meta">
        <span class="book-date">Adicionado em ${dataFormatada}</span>
      </div>
      <button class="ler-livro-btn" data-id="${livro.id}">Ler</button>
    </div>
  `;

  // Adiciona evento ao botão
  const botaoLer = livroElement.querySelector(".ler-livro-btn");
  botaoLer.addEventListener("click", () => {
    window.location.href = `/bibliotech/view/leitor.html?id=${livro.id}`;
  });

  return livroElement;
}

function formatarData(dataString) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  const date = new Date(dataString);
  return date.toLocaleDateString("pt-BR", options);
}
