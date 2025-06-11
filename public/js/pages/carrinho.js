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
      
      let tipo = "fisico"; 
      const opcoesCompraContainer = document.querySelector(".opcoes-compra");
      if (opcoesCompraContainer) {
        const opcaoAtiva = opcoesCompraContainer.querySelector(".opcao.ativo");
        if (opcaoAtiva && opcaoAtiva.dataset.tipo) {
          tipo = opcaoAtiva.dataset.tipo; 
        }
      }
      
      if (btn.dataset.tipo) { 
          tipo = btn.dataset.tipo;
      }

      console.log("Tipo selecionado para o carrinho:", tipo);

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
        await addBookToCart(livroId, 1, tipo); 
        mostrarModalPadrao(
          "✅🛒",
          "Sucesso!",
          `O livro "${titulo}" (${tipo === 'ebook' ? 'E-book' : 'Físico'}) foi adicionado ao carrinho.`,
          "carrinho.html",
          "Ir para o carrinho"
        );
      } catch (err) {
        console.error("Erro ao adicionar ao carrinho:", err);
        let mensagemErroApi = "Erro ao adicionar ao carrinho."; // Mensagem padrão
        
        if (err && err.response && err.response.data && err.response.data.message) {
            // Exemplo para erros vindos de uma resposta HTTP com JSON (como com Axios)
            mensagemErroApi = err.response.data.message;
        } else if (err && err.message) {
            // Caso o erro seja mais simples e tenha apenas uma propriedade 'message'
            mensagemErroApi = err.message;
        }

        mostrarModalPadrao(
          "⚠️", // Ícone de aviso
          "Atenção",
          mensagemErroApi // Exibe a mensagem específica da API
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
