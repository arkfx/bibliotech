import { getBooks } from "../api/livro.js";
import { renderBooks, renderSkeletons } from "../utils/renderBooks.js";
import { carregarListaDesejos, configurarBotoesFavoritos } from "../utils/wishlist-utils.js";
import { showToast } from "../utils/toast.js";

// TOAST DE BOAS-VINDAS
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    showToast("Bem-vindo à Bibliotech!", "info");
  }, 1000);
});

// MAIN
document.addEventListener("DOMContentLoaded", async () => {
  // 🔄 Recarrega a página se voltar do histórico
  window.addEventListener("pageshow", (event) => {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
      location.reload();
    }
  });

  const gridContainer = document.querySelector(".grid--4-cols");
  const searchInput = document.querySelector(".main-nav-list input");
  const modal = document.getElementById("cadastroModal");
  const modalClose = document.getElementById("modal-close");

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  renderSkeletons(gridContainer);

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarLivros();
      }
    });
  }

  // CARREGAR LIVROS
  if (!searchInput || searchInput.value.trim() === "") {
    try {
      const response = await getBooks();
      if (response.status === "success") {
        const livros = response.data;
        gridContainer.innerHTML = "";

        renderBooks(gridContainer, livros);

        // Carregar lista de desejos
        const favoritos = await carregarListaDesejos();

        // Configurar botões de favoritos
        configurarBotoesFavoritos(favoritos, ".btn-favorito");
      } else {
        mostrarMensagemErro(gridContainer, "Erro ao carregar livros.");
      }
    } catch (error) {
      mostrarMensagemErro(gridContainer, "Erro de conexão.");
    }
  }
});

// FUNÇÕES AUXILIARES
function mostrarMensagemErro(container, mensagem) {
  container.innerHTML = `
    <div class="error-message">
      <p>${mensagem}</p>
    </div>
  `;
}