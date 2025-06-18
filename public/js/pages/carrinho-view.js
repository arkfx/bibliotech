import { obterUserId } from "../utils/auth-utils.js";
import {
  getCarrinhoDoUsuario,
  removerDoCarrinho,
  atualizarQuantidadeNoServidor,
} from "../api/carrinho.js";
import { mostrarModalPadrao } from "../utils/modal-utils.js";


document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("cart-items-container");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const freteEl = document.getElementById("frete");

  if (!container || !subtotalEl || !totalEl || !freteEl) {
    console.warn("Elementos do carrinho não encontrados. Script encerrado.");
    return;
  }

  const userId = await obterUserId();
  console.log("User ID:", userId);

  if (!userId) {
    container.innerHTML =
      "<p class='error-msg'>Você precisa estar logado para ver o carrinho.</p>";
    subtotalEl.textContent = "0,00";
    freteEl.textContent = "R$ 0,00";
    totalEl.textContent = "0,00";
    return;
  }

  try {
    console.log("Buscando carrinho...");
    const data = await getCarrinhoDoUsuario(); 

    if (data.status !== "success") {
      throw new Error(data.message);
    }

    const livros = data.data;

    if (!livros || livros.length === 0) {
      container.innerHTML =
        "<p class='empty-cart'>Seu carrinho está vazio.</p>";
      subtotalEl.textContent = "0,00";
      freteEl.textContent = "R$ 0,00";
      totalEl.textContent = "0,00";
      return;
    }

    container.innerHTML = "";

    livros.forEach((livro) => {
      const item = document.createElement("div");
      item.classList.add("cart-item");
      item.dataset.livroId = livro.livro_id;
      item.dataset.livroTipo = livro.tipo; 
      const precoFormatado = parseFloat(livro.preco).toFixed(2).replace('.', ',');

      item.innerHTML = `
        <div class="livro-info">
          <img src="${livro.imagem_url}" alt="${livro.titulo}">
          <div class="livro-detalhes">
            <h3 class="livro-titulo">
              <a class="book-cover-link" href="detalhes-livro.html?id=${livro.livro_id}">
                ${livro.titulo}
              </a>
            </h3>
            <p class="livro-autor">por ${livro.autor || "Autor desconhecido"}</p>
            <p class="livro-preco">R$ ${precoFormatado}</p>
            <p class="livro-tipo">Tipo: ${livro.tipo === 'ebook' ? 'E-book' : 'Físico'}</p> 
          </div>
        </div>
        <div class="cart-actions">
          <button class="btn-menor">-</button>
          <span>${livro.quantidade}</span>
          <button class="btn-maior">+</button>
          <button class="btn-remover" data-livro-id="${livro.livro_id}" data-livro-tipo="${livro.tipo}">🗑️</button>
        </div>
      `;

      const btnMenor = item.querySelector(".btn-menor");
      const btnMaior = item.querySelector(".btn-maior");
      const quantidadeSpan = item.querySelector(".cart-actions span");

      if (livro.tipo === 'ebook') {
        btnMaior.disabled = true;
        btnMenor.disabled = true; // E-books geralmente não podem ter quantidade < 1 no carrinho
      }

      const removerBtn = item.querySelector(".btn-remover");
      removerBtn.addEventListener("click", async () => {
        const livroId = removerBtn.getAttribute("data-livro-id");
        const tipoLivro = removerBtn.getAttribute("data-livro-tipo"); 

        if (!confirm("Deseja remover este item do carrinho?")) return;

        try {
          await removerDoCarrinho(livroId, tipoLivro); // Passa o tipo correto
          item.remove();
          atualizarResumoCarrinho();
        } catch (err) {
          console.error("Erro ao remover item:", err);
          alert("Erro ao remover item do carrinho.");
        }
      });

      btnMaior.addEventListener("click", async () => {
        let quantidade = parseInt(quantidadeSpan.textContent);
        quantidade++;
        quantidadeSpan.textContent = quantidade;

        await atualizarQuantidadeNoServidor(livro.livro_id, quantidade, livro.tipo); 
        atualizarResumoCarrinho();
      });

      btnMenor.addEventListener("click", async () => {
        let quantidade = parseInt(quantidadeSpan.textContent);

        if (quantidade > 1) {
          quantidade--;
          quantidadeSpan.textContent = quantidade;

          await atualizarQuantidadeNoServidor(livro.livro_id, quantidade, livro.tipo); 
          atualizarResumoCarrinho();
        } else {
          if (!confirm("Deseja remover este item do carrinho?")) return;

          try {
            await removerDoCarrinho(livro.livro_id, livro.tipo); 
            item.remove();
            atualizarResumoCarrinho();
          } catch (err) {
            console.error("Erro ao remover item:", err);
            alert("Erro ao remover item do carrinho.");
          }
        }
      });

      container.appendChild(item);
    });

    atualizarResumoCarrinho();
  } catch (error) {
    console.error("Erro ao carregar carrinho:", error);
    container.innerHTML =
      "<p class='error-msg'>Erro ao carregar os itens do carrinho.</p>";
  }
});

export function atualizarResumoCarrinho() {
  const container = document.getElementById("cart-items-container");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const freteEl = document.getElementById("frete");

  let subtotal = 0;
  let frete = 0;
  let textoFrete = "";
  let contemItemFisico = false; 


  const itens = container.querySelectorAll(".cart-item");

  if (itens.length === 0) {
    subtotalEl.textContent = "0,00";
    freteEl.textContent = "R$ 0,00";
    totalEl.textContent = "0,00";
    return;
  }

  itens.forEach((item) => {
    const precoTexto =
      item.querySelector(".livro-preco")?.textContent || "R$ 0";
    const preco = parseFloat(precoTexto.replace("R$", "").replace(",", "."));

    const quantidade = parseInt(
      item.querySelector(".cart-actions span")?.textContent || "1"
    );

    const tipoLivro = item.dataset.livroTipo;

    if (tipoLivro === 'fisico') {
      contemItemFisico = true;
    }

    subtotal += preco * quantidade;
  });
  
  if (subtotal > 0 && contemItemFisico) {
    frete = 24.99; 
    textoFrete = `R$ ${frete.toFixed(2).replace(".", ",")}`;
  } else {
    frete = 0;
    textoFrete = "R$ 0,00";
  }

  const total = subtotal + frete;

  subtotalEl.textContent = subtotal.toFixed(2).replace(".", ",");
  freteEl.textContent = textoFrete;
  totalEl.textContent = total.toFixed(2).replace(".", ",");
}

const btnFinalizar = document.getElementById("btnFinalizar");

if (btnFinalizar) {
  btnFinalizar.addEventListener("click", async () => {
    const container = document.getElementById("cart-items-container");
    let itemCount = 0;
    if (container) {
        const items = container.querySelectorAll(".cart-item");
        itemCount = items.length;
    }

    if (itemCount === 0) {
      mostrarModalPadrao(
        "⚠️",
        "Carrinho Vazio",
        "Seu carrinho está vazio. Adicione itens antes de finalizar.",
        null,
        "OK" 
      );
      return; 
    }
    window.location.href = "finalizar.html"; 
  });
}
