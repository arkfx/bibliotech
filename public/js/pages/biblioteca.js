import { getLivrosDaBiblioteca } from "../api/biblioteca.js";
import { carregarGeneros } from "./genero.js";

let todosLivros = [];
let livrosVisiveisAtualmente = [];
let filtroAtual = 'todos';
let termoBusca = '';
let generoFiltro = '';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const booksCatalog = document.querySelector(".books-catalog");
    const recentesGrid = document.querySelector("#adicionados-recentemente .books-grid");
    const lendoGrid = document.querySelector("#continuar-lendo .livros-lendo");
    
    // Carregar os gêneros para o filtro
    await carregarGeneros("filter-biblioteca-genres");
    
    // Carregar livros da biblioteca
    const response = await getLivrosDaBiblioteca();
    todosLivros = response.data || [];
    livrosVisiveisAtualmente = [...todosLivros];

    popularFiltroDeGeneros();
    configurarEventos();

    // Lógica inicial de exibição
    if (todosLivros.length > 0) {
      const sortSelect = document.getElementById("sort-books");
      ordenarEExibirLivros(sortSelect.value);
      
      // Renderizar livros recentes (últimos 4 livros adicionados)
      const livrosRecentes = obterLivrosRecentes();
      renderizarLivros(livrosRecentes, recentesGrid);
    }
    
    atualizarEstadoVazio();

  } catch (error) {
    console.error("Erro ao carregar biblioteca:", error);
    const booksCatalog = document.querySelector(".books-catalog");
    if(booksCatalog) booksCatalog.innerHTML = "<p>Ocorreu um erro ao carregar sua biblioteca. Tente novamente mais tarde.</p>";
  }
});

function configurarEventos() {
  // Listener do campo de busca textual
  const searchInput = document.getElementById("biblioteca-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      termoBusca = e.target.value.toLowerCase();
      aplicarFiltrosEExibir();
    });
  }
  
  // Listener do filtro de gênero
  const generoSelect = document.getElementById("biblioteca-genre-filter");
  if (generoSelect) {
    generoSelect.addEventListener("change", () => {
      generoFiltro = generoSelect.value;
      aplicarFiltrosEExibir();
    });
  }

  // Listener da ordenação
  const sortSelect = document.getElementById("sort-books");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      ordenarEExibirLivros(sortSelect.value);
    });
  }

  // Tabs
  const tabs = document.querySelectorAll(".tab-button");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remover classe 'active' de todos os tabs
      tabs.forEach(t => t.classList.remove("active"));
      
      // Adicionar classe 'active' ao tab clicado
      tab.classList.add("active");
      
      // Atualizar filtro atual
      filtroAtual = tab.getAttribute("data-filter");
      
      // Aplicar filtro
      aplicarFiltrosEExibir();
      
      // Mostrar/esconder seções baseado no tab selecionado
      const catalogo = document.getElementById("catalogo-completo");
      const recentes = document.getElementById("adicionados-recentemente");
      const lendo = document.getElementById("continuar-lendo");
      
      if (filtroAtual === "todos") {
        catalogo.style.display = "block";
        recentes.style.display = "block";
        lendo.style.display = "block";

        // Mostrar apenas livros adicionados nos últimos 3 dias em "Adicionados Recentemente"
        const recentesGrid = document.querySelector("#adicionados-recentemente .books-grid");
        const livrosRecentes = obterLivrosRecentes();
        renderizarLivros(
          livrosRecentes,
          recentesGrid,
          "Nenhum livro encontrado."
        );
      } else if (filtroAtual === "recentes") {
        catalogo.style.display = "none";
        recentes.style.display = "block";
        lendo.style.display = "none";

        // Mostrar apenas livros adicionados nos últimos 3 dias também na aba "Recentes"
        const recentesGrid = document.querySelector("#adicionados-recentemente .books-grid");
        const livrosRecentes = obterLivrosRecentes();
        renderizarLivros(
          livrosRecentes,
          recentesGrid,
          "Nenhum livro encontrado."
        );
      } else if (filtroAtual === "lendo") {
        catalogo.style.display = "none";
        recentes.style.display = "none";
        lendo.style.display = "block";
      }
    });
  });
}

function aplicarFiltrosEExibir() {
  // Filtrar por termo de busca e gênero
  let livrosFiltrados = todosLivros;
  
  // Aplicar filtro de texto
  if (termoBusca) {
    livrosFiltrados = livrosFiltrados.filter(livro => 
      livro.titulo.toLowerCase().includes(termoBusca) || 
      livro.autor.toLowerCase().includes(termoBusca)
    );
  }
  
  // Aplicar filtro de gênero
  if (generoFiltro) {
    livrosFiltrados = livrosFiltrados.filter(livro => 
      livro.genero_id.toString() === generoFiltro
    );
  }
  
  livrosVisiveisAtualmente = livrosFiltrados;
  
  // Ordenar e exibir resultados
  const sortSelect = document.getElementById("sort-books");
  ordenarEExibirLivros(sortSelect.value);
  
  atualizarEstadoVazio();
}

function atualizarEstadoVazio() {
  const emptyState = document.getElementById("empty-library");
  const booksCatalog = document.querySelector(".books-catalog");

  if (!emptyState || !booksCatalog) return;

  // Cenário 1: Biblioteca vazia desde o início.
  if (todosLivros.length === 0) {
    emptyState.classList.remove("hidden");
    booksCatalog.innerHTML = "";
    emptyState.querySelector("h3").textContent = "Sua biblioteca está vazia";
    emptyState.querySelector("p").textContent = "Você ainda não tem livros na sua biblioteca. Explore nosso catálogo e compre seu primeiro livro!";
    const btnExplorar = emptyState.querySelector(".btn-primary");
    if (btnExplorar) btnExplorar.style.display = 'inline-block';
    return;
  }

  // Cenário 2: Biblioteca tem livros, mas o filtro não encontrou nenhum.
  if (livrosVisiveisAtualmente.length === 0) {
    emptyState.classList.remove("hidden");
    booksCatalog.innerHTML = "";
    emptyState.querySelector("h3").textContent = "Nenhum resultado encontrado";
    emptyState.querySelector("p").textContent = "Tente usar outros termos na busca ou limpar os filtros.";
    const btnExplorar = emptyState.querySelector(".btn-primary");
    if (btnExplorar) btnExplorar.style.display = 'none';
  } else {
    // Cenário 3: Existem livros para exibir.
    emptyState.classList.add("hidden");
  }
}

function popularFiltroDeGeneros() {
  const generoSelect = document.getElementById("biblioteca-genre-filter");
  if (!generoSelect) return;

  const generosUnicos = new Map();
  todosLivros.forEach(livro => {
    if (livro.genero_id && livro.nome_genero) {
      generosUnicos.set(livro.genero_id, livro.nome_genero);
    }
  });

  const generosOrdenados = [...generosUnicos.entries()].sort((a, b) => a[1].localeCompare(b[1]));

  generoSelect.innerHTML = "";
  
  const todosOption = document.createElement("option");
  todosOption.value = ""; 
  todosOption.textContent = "Todos os Gêneros";
  generoSelect.appendChild(todosOption);

  generosOrdenados.forEach(([id, nome]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = nome;
    generoSelect.appendChild(option);
  });
}

function ordenarEExibirLivros(criterio) {
  let livrosOrdenados = [...livrosVisiveisAtualmente];
  
  switch (criterio) {
    case "data_adicao_asc":
      livrosOrdenados.sort((a, b) => new Date(a.data_adquirido) - new Date(b.data_adquirido));
      break;
    case "data_adicao_desc":
      livrosOrdenados.sort((a, b) => new Date(b.data_adquirido) - new Date(a.data_adquirido));
      break;
    case "titulo_asc":
      livrosOrdenados.sort((a, b) => a.titulo.localeCompare(b.titulo));
      break;
    case "genero_asc":
      livrosOrdenados.sort((a, b) => (a.nome_genero || "").localeCompare(b.nome_genero || ""));
      break;
    default:
      // Ordenação padrão por data mais recente
      livrosOrdenados.sort((a, b) => new Date(b.data_adquirido) - new Date(a.data_adquirido));
  }
  
  const booksCatalog = document.querySelector(".books-catalog");
  renderizarLivros(livrosOrdenados, booksCatalog);
}

function renderizarLivros(livros, container, mensagemVazio = "Nenhum livro encontrado.") {
  if (!container) return;

  container.innerHTML = "";

  if (livros.length === 0) {
    container.innerHTML = `<p class="empty-message">${mensagemVazio}</p>`;
    return;
  }

  livros.forEach((livro) => {
    const livroElement = criarElementoLivro(livro);
    container.appendChild(livroElement);
  });
}

function criarElementoLivro(livro) {
  const livroElement = document.createElement("div");
  livroElement.className = "book-card";
  livroElement.dataset.id = livro.id;

  const capaUrl = livro.imagem_url || "../public/images/placeholder-book.png";
  const dataFormatada = formatarData(livro.data_adquirido);
  const nomeGenero = livro.nome_genero || "Gênero não informado";

  livroElement.innerHTML = `
    <div class="book-cover-container">
      <a href="leitor.html?id=${livro.id}" class="book-cover-link">
        <img src="${capaUrl}" alt="Capa do livro ${livro.titulo}" class="book-cover" />
      </a>
    </div>
    <div class="book-info">
      <h3 class="book-title">
        <a href="leitor.html?id=${livro.id}">${livro.titulo}</a>
      </h3>
      <p class="book-genre">${nomeGenero}</p>
      <p class="book-author">${livro.autor}</p>
      <div class="book-meta">
        <span class="book-date">Adicionado em ${dataFormatada}</span>
      </div>
      <button class="ler-livro-btn" data-id="${livro.id}">Ler</button>
    </div>
  `;

  // Adiciona evento ao botão
  const botaoLer = livroElement.querySelector(".ler-livro-btn");
  botaoLer.addEventListener("click", () => {
    window.location.href = `leitor.html?id=${livro.id}`;
  });

  return livroElement;
}

function formatarData(dataString) {
  if (!dataString) return "data desconhecida";
  
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function obterLivrosRecentes(dias = 3) {
  const agora = new Date();
  const limite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - dias);
  return todosLivros
    .filter(livro => new Date(livro.data_adquirido) >= limite)
    .sort((a, b) => new Date(b.data_adquirido) - new Date(a.data_adquirido));
}
