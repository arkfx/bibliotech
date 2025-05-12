import { obterUserId } from "../utils/auth-utils.js";
import { getCarrinhoDoUsuario } from "../api/carrinho.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("cart-items-container");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const freteEl = document.getElementById("frete");

  const userId = await obterUserId();
  console.log("User ID:", userId);

  if (!userId) {
    container.innerHTML =
      "<p class='error-msg'>Você precisa estar logado para ver o carrinho.</p>";
    return;
  }

  try {
    console.log("Buscando carrinho...");
    const data = await getCarrinhoDoUsuario(userId);

    if (data.status !== "success") {
      throw new Error(data.message);
    }

    const livros = data.data;

    if (!livros || livros.length === 0) {
      container.innerHTML =
        "<p class='empty-cart'>Seu carrinho está vazio.</p>";
      subtotalEl.textContent = "0,00";
      freteEl.textContent = "0,00";
      totalEl.textContent = "0,00";
      itemCountEl.textContent = "0";
      return;
    }

    container.innerHTML = "";
    let subtotal = 0;
    let itemCount = 0;

    livros.forEach((livro) => {
      const totalItem = livro.preco * livro.quantidade;
      subtotal += totalItem;
      itemCount += livro.quantidade;

      const item = document.createElement("div");
      item.classList.add("cart-item");
      item.innerHTML = `
<div class="cart-item">
  <div class="livro-info">
    <img src="${livro.imagem_url}" alt="${livro.titulo}">
    <div class="livro-detalhes">
      <p class="livro-titulo">${livro.titulo}</p>
      <p class="livro-autor">por ${livro.autor || "Autor desconhecido"}</p>
      <p class="livro-preco">R$ ${livro.preco}</p>
    </div>
  </div>
  <div class="cart-actions">
    <button class="btn-menor">-</button>
    <span>${livro.quantidade}</span>
    <button class="btn-maior">+</button>
    <button class="btn-remover">🗑️</button>
  </div>
</div>

      `;

      container.appendChild(item);
    });

    const frete = 0; // ajustar se necessário
    subtotalEl.textContent = subtotal.toFixed(2);
    freteEl.textContent = frete.toFixed(2);
    totalEl.textContent = (subtotal + frete).toFixed(2);
  } catch (error) {
    console.error("Erro ao carregar carrinho:", error);
    container.innerHTML =
      "<p class='error-msg'>Erro ao carregar os itens do carrinho.</p>";
  }
});
