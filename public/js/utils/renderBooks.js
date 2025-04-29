export function renderBooks(container, livros, onComprarClick) {
    container.innerHTML = "";
  
    if (livros.length === 0) {
      container.innerHTML = "<p>Nenhum livro encontrado.</p>";
      return;
    }
  
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
      container.insertAdjacentHTML("beforeend", bookCard);
    });
  
    // Adiciona eventos de clique aos botões "Comprar"
    const comprarButtons = container.querySelectorAll(".btn-comprar");
    comprarButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const tituloLivro = e.target.getAttribute("data-titulo");
        if (onComprarClick) {
          onComprarClick(tituloLivro);
        }
      });
    });
  }
  
  export function renderSkeletons(container, count = 8) {
    container.innerHTML = "";
  
    for (let i = 0; i < count; i++) {
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