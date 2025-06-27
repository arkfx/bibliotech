import {
  getListaDesejos,
  removerLivroListaDesejos,
} from "../../../api/lista-desejos.js";
import { getBookById } from "../../../api/livro.js";
import { obterUserId } from "../../../utils/auth-utils.js";
import { showToast } from "../../../utils/toast.js";

export async function carregarListaDesejos() {
  const container = document.querySelector("#section-favoritos .wishlist-list");
  const emptyState = document.querySelector("#section-favoritos .empty-state");

  if (!container || !emptyState) return;

  renderSkeletonDesejos(container);
  emptyState.classList.add("hidden");

  try {
    const userId = await obterUserId();
    const resposta = await getListaDesejos(userId);

    const livros = [];

    if (resposta.status === "success" && Array.isArray(resposta.data)) {
      const livroIds = resposta.data.map((item) => item.livro_id || item.id);

      const livrosPromises = livroIds.map((id) => getBookById(id));
      const resultados = await Promise.all(livrosPromises);

      resultados.forEach((resLivro) => {
        if (resLivro.status === "success") {
          livros.push(resLivro.data);
        }
      });
    }

    if (livros.length > 0) {
      await renderListaDesejos(container, livros, emptyState);
    } else {
      container.innerHTML = "";
      emptyState.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Erro ao carregar lista de desejos:", error);
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
  }
}

function renderSkeletonDesejos(container) {
  container.innerHTML = `
    <div class="wishlist-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 2rem;">
      ${Array(4)
        .fill(
          `
        <div class="skeleton-card">
          <div class="skeleton-cover"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-author"></div>
          <div class="skeleton-price"></div>
          <div class="skeleton-button"></div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

async function renderListaDesejos(container, livros, emptyState) {
  const gridId = "wishlist-grid";

  container.innerHTML = `
    <div class="wishlist-grid" id="${gridId}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 2rem;">
      ${livros
        .map(
          (livro) => `
        <div class="book-card" data-id="${livro.id}">
          <div class="book-cover">
            <a href="detalhes-livro.html?id=${
              livro.id
            }" class="book-cover-link">
              <img src="${
                livro.imagem_url ||
                "/bibliotech/public/images/placeholder-book.png"
              }" alt="${livro.titulo}">
            </a>
          </div>
          <div class="book-info">
            <h3><a href="detalhes-livro.html?id=${livro.id}">${
            livro.titulo
          }</a></h3>
            <p>${livro.autor}</p>
            <strong>R$ ${Number(livro.preco)
              .toFixed(2)
              .replace(".", ",")}</strong>
            <button class="btn-comprar btn-loading" data-id="${
              livro.id
            }" data-titulo="${livro.titulo}">
              <svg class="icon-cart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Comprar
            </button>
            <button class="btn-favorito salvo" type="button" data-id="${
              livro.id
            }">💙</button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  const event = new Event("livrosRenderizados");
  document.dispatchEvent(event);

  container.querySelectorAll(".btn-favorito").forEach((btn) => {
    btn.classList.add("salvo");
    btn.textContent = "❌";
    btn.title = "Remover da Lista de Desejos";

    btn.setAttribute("data-custom-handler", "true");
  });

  const wishlistGrid = container.querySelector(".wishlist-grid");
  if (wishlistGrid) {
    if (wishlistGrid._clickHandler) {
      wishlistGrid.removeEventListener("click", wishlistGrid._clickHandler);
    }

    wishlistGrid._clickHandler = async function (event) {
      const btn = event.target.closest(
        ".btn-favorito[data-custom-handler='true']"
      );
      if (!btn) return;

      event.stopPropagation();

      const livroId = parseInt(btn.dataset.id);
      if (isNaN(livroId)) return;

      try {
        const resposta = await removerLivroListaDesejos(livroId);
        if (resposta.status === "success") {
          const card = container.querySelector(
            `.book-card[data-id="${livroId}"]`
          );
          if (card) card.remove();

          showToast("Removido da lista de desejos", "info");

          // Se não houver mais cards, mostra o estado vazio
          const restantes = container.querySelectorAll(".book-card");
          if (restantes.length === 0) {
            container.innerHTML = "";
            emptyState.classList.remove("hidden");
          }
        }
      } catch (err) {
        console.error("Erro ao remover da lista:", err);
        showToast("Erro ao remover da lista", "error");
      }
    };

    wishlistGrid.addEventListener("click", wishlistGrid._clickHandler);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
