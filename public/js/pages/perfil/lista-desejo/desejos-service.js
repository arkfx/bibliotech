import { getListaDesejos, removerLivroListaDesejos } from "../../../api/lista-desejos.js";
import { getBookById } from "../../../api/livro.js";
import { obterUserId } from "../../../utils/auth-utils.js";
import {
  carregarListaDesejos as carregarFavoritosGlobais,
  configurarBotoesFavoritos,
} from "../../../utils/wishlist-utils.js";
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
    await delay(600);

    const livros = [];

    if (resposta.status === "success" && Array.isArray(resposta.data)) {
      for (const item of resposta.data) {
        const livroId = item.livro_id || item.id;
        const resLivro = await getBookById(livroId);
        if (resLivro.status === "success") {
          livros.push(resLivro.data);
        }
      }
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
      ${Array(4).fill(`
        <div class="skeleton-card">
          <div class="skeleton-cover"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-author"></div>
          <div class="skeleton-price"></div>
          <div class="skeleton-button"></div>
        </div>
      `).join("")}
    </div>
  `;
}

async function renderListaDesejos(container, livros, emptyState) {
  const gridId = "wishlist-grid";

  container.innerHTML = `
    <div class="wishlist-grid" id="${gridId}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 2rem;">
      ${livros.map(livro => `
        <div class="book-card" data-id="${livro.id}">
          <div class="book-cover">
            <a href="livro.html?id=${livro.id}" class="book-cover-link">
              <img src="${livro.imagem_url || '/bibliotech/public/images/placeholder-book.png'}" alt="${livro.titulo}">
            </a>
          </div>
          <div class="book-info">
            <h3><a href="livro.html?id=${livro.id}">${livro.titulo}</a></h3>
            <p>${livro.autor}</p>
            <strong>R$ ${Number(livro.preco).toFixed(2).replace('.', ',')}</strong>
            <button class="btn-comprar">Comprar</button>
            <button class="btn-favorito salvo" type="button" data-id="${livro.id}">💙</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  const favoritos = await carregarFavoritosGlobais();
  configurarBotoesFavoritos(favoritos, "#section-favoritos .btn-favorito");

  // Lógica de remoção imediata
  container.querySelectorAll(".btn-favorito").forEach(btn => {
    btn.addEventListener("click", async () => {
      const livroId = parseInt(btn.dataset.id);
      if (isNaN(livroId)) return;

      try {
        const resposta = await removerLivroListaDesejos(livroId);
        if (resposta.status === "success") {
          const card = container.querySelector(`.book-card[data-id="${livroId}"]`);
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
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
