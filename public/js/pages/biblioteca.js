import { getLivrosDaBiblioteca } from "../api/biblioteca.js";
import { carregarGeneros } from "./genero.js";

// Armazenar os livros para não precisar buscar do servidor a cada ordenação
let todosLivros = [];
let livrosVisiveisAtualmente = [];
let filtroAtual = 'todos';
let termoBusca = '';
let generoFiltro = '';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const booksCatalog = document.querySelector(".books-catalog");
    const emptyState = document.getElementById("empty-library");
    const recentesGrid = document.querySelector("#adicionados-recentemente .books-grid");
    const lendoGrid = document.querySelector("#continuar-lendo .livros-lendo");
    
    // Carregar os gêneros para o filtro
    await carregarGeneros("filter-biblioteca-genres");
    
    // Carregar livros da biblioteca
    const response = await getLivrosDaBiblioteca();
    todosLivros = response.data || [];
    
    if (todosLivros.length === 0) {
      emptyState.classList.remove("hidden");
      document.getElementById("adicionados-recentemente").style.display = "none";
      document.getElementById("continuar-lendo").style.display = "none";
      return;
    } else {
      emptyState.classList.add("hidden");
      livrosVisiveisAtualmente = [...todosLivros];
    }

    // Renderiza o catálogo completo com ordenação padrão
    const sortSelect = document.getElementById("sort-books");
    ordenarEExibirLivros(sortSelect.value);
    
    // Renderizar livros recentes (últimos 4 livros adicionados)
    const agora = new Date();
    const tresDiasAtras = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 3);

    const livrosRecentes = todosLivros
      .filter(livro => {
        const dataAdquirido = new Date(livro.data_adquirido);
        return dataAdquirido >= tresDiasAtras;
      })
      .sort((a, b) => new Date(b.data_adquirido) - new Date(a.data_adquirido));

    renderizarLivros(livrosRecentes, recentesGrid);
    
    // Configurar eventos para filtros e tabs
    configurarEventos();

  } catch (error) {
    console.error("Erro ao carregar biblioteca:", error);
    alert(
      "Ocorreu um erro ao carregar sua biblioteca. Por favor, tente novamente mais tarde."
    );
  }
});

function configurarEventos() {
  // Ordenação
  const sortSelect = document.getElementById("sort-books");
  sortSelect.addEventListener("change", () => {
    ordenarEExibirLivros(sortSelect.value);
  });
  
  // Filtro de gênero
  const generoSelect = document.getElementById("filter-biblioteca-genres");
  generoSelect.addEventListener("change", () => {
    generoFiltro = generoSelect.value;
    aplicarFiltrosEExibir();
  });
  
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
        const agora = new Date();
        const tresDiasAtras = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 3);

        const livrosRecentes = todosLivros.filter(livro => {
          const dataAdquirido = new Date(livro.data_adquirido);
          return dataAdquirido >= tresDiasAtras;
        }).sort((a, b) => new Date(b.data_adquirido) - new Date(a.data_adquirido));

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
        const agora = new Date();
        const tresDiasAtras = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 3);

        const livrosRecentes = todosLivros.filter(livro => {
          const dataAdquirido = new Date(livro.data_adquirido);
          return dataAdquirido >= tresDiasAtras;
        }).sort((a, b) => new Date(b.data_adquirido) - new Date(a.data_adquirido));

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
  
  // Exibir mensagem se não houver resultados
  const booksCatalog = document.querySelector(".books-catalog");
  const emptyState = document.getElementById("empty-library");
  
  if (livrosVisiveisAtualmente.length === 0) {
    booksCatalog.innerHTML = "";
    emptyState.classList.remove("hidden");
    emptyState.querySelector("h3").textContent = "Nenhum livro encontrado";
    emptyState.querySelector("p").textContent = "Tente ajustar seus filtros para encontrar livros na sua biblioteca.";
  } else {
    emptyState.classList.add("hidden");
  }
}

function ordenarEExibirLivros(criterio) {
  const booksCatalog = document.querySelector(".books-catalog");
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
