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
