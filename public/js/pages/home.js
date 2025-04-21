import { getBooks } from "../api/livro.js";

document.addEventListener("DOMContentLoaded", async () => {
  const gridContainer = document.querySelector(".grid--4-cols");
  const searchInput = document.querySelector(".main-nav-list input");
  const modal = document.getElementById("cadastroModal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalClose = document.getElementById("modal-close");

  // Função para abrir o modal
  function abrirModal(titulo, mensagem) {
    modalTitle.textContent = titulo;
    modalMessage.textContent = mensagem;
    modal.style.display = "flex";
  }

  // Fechar o modal ao clicar no botão "Entendi"
  modalClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fechar o modal ao clicar fora dele
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Mostrar estado de carregamento ao carregar os livros
  mostrarCarregamento(gridContainer);

  // Verificar se o campo de busca está vazio antes de carregar todos os livros
  if (!searchInput || searchInput.value.trim() === "") {
    try {
      const response = await getBooks();
      if (response.status === "success") {
        const livros = response.data;

        // Limpa o container antes de adicionar os livros
        gridContainer.innerHTML = "";

        // Adiciona os livros ao grid
        livros.forEach((livro) => {
          const bookCard = `
            <div class="book-card">
              <div class="book-cover">
                <img src="${livro.capa}" alt="Capa do livro ${livro.titulo}" />
              </div>
              <div class="book-info">
                <h3>${livro.titulo}</h3>
                <p>${livro.autor}</p>
                <strong>R$ ${livro.preco}</strong>
                <br />
                <button class="btn-comprar" data-titulo="${livro.titulo}">Comprar</button>
              </div>
            </div>
          `;
          gridContainer.insertAdjacentHTML("beforeend", bookCard);
        });

        // Adiciona evento de clique aos botões "Comprar"
        const comprarButtons = document.querySelectorAll(".btn-comprar");
        comprarButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            abrirModal(
              "Aviso de Compra",
              `O livro ainda não pode ser comprado. Esta funcionalidade está em desenvolvimento.`
            );
          });
        });
      } else {
        console.error("Erro ao carregar os livros:", response.message);
        mostrarMensagemErro(gridContainer, "Não foi possível carregar os livros. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Erro ao buscar os livros:", error);
      mostrarMensagemErro(gridContainer, "Erro ao conectar ao servidor, tente novamente mais tarde.");
    }
  }
});

// Função para mostrar estado de carregamento
function mostrarCarregamento(container) {
  container.innerHTML = "";

  // Cria 8 skeleton cards para simular o carregamento
  for (let i = 0; i < 8; i++) {
    const skeletonCard = `
      <div class="book-card skeleton-card">
        <div class="book-cover skeleton-cover"></div>
        <div class="book-info">
          <div class="skeleton-title"></div>
          <div class="skeleton-author"></div>
          <div class="skeleton-price"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", skeletonCard);
  }
}

// Função para mostrar mensagem de erro
function mostrarMensagemErro(container, mensagem) {
  container.innerHTML = `
    <div class="error-message">
      <p>${mensagem}</p>
    </div>
  `;
}