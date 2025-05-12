export function renderBooks(container, livros) {
  container.innerHTML = "";

  if (livros.length === 0) {
    container.innerHTML = "<p>Nenhum livro encontrado.</p>";
    return;
  }

  livros.forEach((livro) => {
    const bookCard = `
      <div class="book-card">
        <div class="book-cover">
          <a href="detalhes-livro.html?id=${livro.id}" class="book-cover-link">
            <img src="${livro.imagem_url}" alt="Capa do livro ${livro.titulo}" class="book-cover-image" />
          </a>
        </div>
        <div class="book-info">
          <h3>
            <a href="detalhes-livro.html?id=${livro.id}">${livro.titulo}</a>
          </h3>
          <p>${livro.autor}</p>
          <strong>R$ ${livro.preco}</strong>
          <br />
<button class="btn-comprar" data-titulo="${livro.titulo}">
  <svg class="icon-cart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
  Comprar
</button>

        </div>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", bookCard);
  });

  // Notifica carrinho.js que os botões foram renderizados
  document.dispatchEvent(new Event("livrosRenderizados"));
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

export function renderSkeletonDetalhes(container) {
  container.innerHTML = `
    <div class="skeleton-detalhes">
      <div class="skeleton-capa"></div>
      <div class="skeleton-info">
        <div class="skeleton-titulo"></div>
        <div class="skeleton-autor"></div>
        <div class="skeleton-preco"></div>
        <div class="skeleton-descricao"></div>
        <div class="skeleton-editora"></div>
        <div class="skeleton-publicacao"></div>
        <div class="skeleton-idioma"></div>
        <div class="skeleton-genero"></div>
      </div>
    </div>
  `;
}
