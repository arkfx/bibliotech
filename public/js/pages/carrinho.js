import { addBookToCart } from "../api/carrinho.js";
import { API_BASE } from "../config.js";

let userId = null;

async function obterUserId() {
  if (userId !== null) return userId;

  try {
    const res = await fetch(API_BASE + "/session-status.php");
    const data = await res.json();
    if (data.status === "success") {
      userId = data.userId;
    }
  } catch (err) {
    console.error("Erro ao verificar sessão:", err);
  }

  return userId;
}

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
  await obterUserId();

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
