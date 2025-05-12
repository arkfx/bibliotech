import { addBookToCart } from "../api/carrinho.js";
import { obterUserId } from "../utils/auth-utils.js";

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
      modal.style.display = "none";
    };
  }
}

async function prepararEventosCarrinho() {
  userId = await obterUserId();

  const botoes = document.querySelectorAll(".btn-comprar");
  botoes.forEach((button) => {
    button.removeEventListener("click", button.__carrinhoHandler); // Remove antigo, se houver

    const handler = async (e) => {
      const titulo = e.currentTarget.dataset.titulo;

      if (!userId) {
        abrirModal(
          "🔒",
          "Login necessário",
          "Você precisa estar logado para adicionar livros ao carrinho."
        );
        return;
      }

      try {
        await addBookToCart(titulo, userId, 1);
        abrirModal(
          "✅🛒",
          "Sucesso",
          `O livro "${titulo}" foi adicionado ao carrinho.`
        );
      } catch (error) {
        console.error("Erro ao adicionar ao carrinho:", error);
        abrirModal(
          "❌",
          "Erro",
          `Não foi possível adicionar o livro "${titulo}" ao carrinho.`
        );
      }
    };

    button.__carrinhoHandler = handler; // Guarda para poder remover depois
    button.addEventListener("click", handler);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await prepararEventosCarrinho();
});

document.addEventListener("livrosRenderizados", async () => {
  await prepararEventosCarrinho();
});

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-remover")) {
    const livroId = e.target.getAttribute("data-livro-id");

    // 1. Confirmação opcional
    if (!confirm("Deseja remover este item do carrinho?")) return;

    try {
      // 2. Chamada ao backend (AJAX ou fetch)
      await fetch(`/api/carrinho/${livroId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 3. Remove item do DOM
      const itemElement = e.target.closest(".cart-item");
      if (itemElement) itemElement.remove();

      // 4. Atualiza totais
      atualizarResumoCarrinho();
    } catch (error) {
      console.error("Erro ao remover item:", error);
      alert("Falha ao remover item. Tente novamente.");
    }
  }
});
