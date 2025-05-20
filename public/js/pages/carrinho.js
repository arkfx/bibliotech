import { addBookToCart } from "../api/carrinho.js";
import { obterUserId } from "../utils/auth-utils.js";
import { mostrarModalPadrao } from "../utils/modal-utils.js";
import { removerDoCarrinho } from "../api/carrinho.js";
import { atualizarResumoCarrinho } from "./carrinho-view.js";

async function prepararEventosCarrinho() {
  const userId = await obterUserId();
  const botoesComprar = document.querySelectorAll(".btn-comprar");

  botoesComprar.forEach((button) => {
    button.removeEventListener("click", button.__carrinhoHandler);

    const handler = async (e) => {
      const btn = e.currentTarget;
      const titulo = btn.dataset.titulo;
      const livroId = parseInt(btn.dataset.id);

      if (!userId) {
        mostrarModalPadrao(
          "🔒",
          "Login necessário",
          "Você precisa estar logado para comprar.",
          "login.html",
          "Fazer login"
        );
        return;
      }

      btn.disabled = true;
      btn.classList.add("loading");
      try {
        await addBookToCart(livroId, 1); // ✅ Removido userId
        //modal 
        mostrarModalPadrao(
          "✅🛒",
          "Sucesso",
          `O livro "${titulo}" foi adicionado ao carrinho.`,
          "carrinho.html",
          "Ir para o carrinho"
        );
      } catch (err) {
        console.error("Erro ao adicionar ao carrinho:", err);
        mostrarModalPadrao(
          "❌",
          "Erro",
          "Erro ao adicionar ao carrinho."
        );
      } finally {
        btn.disabled = false;
        btn.classList.remove("loading");
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
("");
