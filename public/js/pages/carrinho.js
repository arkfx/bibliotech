import { addBookToCart } from "../api/carrinho.js";
import { obterUserId } from "../utils/auth-utils.js";
import { removerDoCarrinho } from "../api/carrinho.js";
import { atualizarResumoCarrinho } from "./carrinho-view.js";

let userId = null;

function abrirModal(emoji, titulo, mensagem) {
  const modal = document.getElementById("cadastroModal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalIcon = modal.querySelector(".modal-icon");

  modalIcon.textContent = emoji;
  modalTitle.textContent = titulo;
  modalMessage.textContent = mensagem;
  modal.style.display = "flex";

  const modalClose = modal.querySelector("#modal-close");
  if (modalClose) {
    modalClose.onclick = () => {
      window.location.href = "carrinho.html";
    };
  }
}

async function prepararEventosCarrinho() {
  const userId = await obterUserId();
  const botoesComprar = document.querySelectorAll(".btn-comprar");

  botoesComprar.forEach((button) => {
    button.removeEventListener("click", button.__carrinhoHandler);

    const handler = async (e) => {
      const btn = e.currentTarget;
      const titulo = btn.dataset.titulo;

      if (!userId) {
        abrirModal(
          "🔒",
          "Login necessário",
          "Você precisa estar logado para comprar."
        );
        return;
      }

      btn.disabled = false;
      const textoOriginal = btn.innerHTML;
      btn.innerHTML = `
  <span class="loading-spinner"></span>
`;

      try {
        await addBookToCart(titulo, userId, 1);
        abrirModal(
          "✅🛒",
          "Sucesso",
          `O livro "${titulo}" foi adicionado ao carrinho.`
        );
      } catch (err) {
        console.error("Erro ao adicionar ao carrinho:", err);
        abrirModal(
          "❌",
          "Erro",
          `Não foi possível adicionar o livro "${titulo}".`
        );
      } finally {
        btn.classList.remove("btn-loading");
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
      }
    };

    button.__carrinhoHandler = handler;
    button.addEventListener("click", handler);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await prepararEventosCarrinho();
});

document.addEventListener("livrosRenderizados", async () => {
  await prepararEventosCarrinho();
});
