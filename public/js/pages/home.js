// home.js
import { getBooks, searchBooks } from "../api/livro.js";
import { renderBooks, renderSkeletons } from "../utils/renderBooks.js";
import {
  carregarListaDesejos,
  configurarBotoesFavoritos,
} from "../utils/wishlist-utils.js";
import { carregarGeneros } from "./genero.js";

const searchInput = document.querySelector(".main-nav-list input");
const searchButton = document.querySelector(".main-nav-list button");
const genreFilter = document.querySelector(".filter-genres");
const gridContainer = document.querySelector(".grid--4-cols");
const sectionTitle = document.querySelector(".heading-secondary");
const modal = document.getElementById("cadastroModal");
const modalClose = document.getElementById("modal-close");

let paginaAtual = 1;
const limite = 12;

// Evento de boas-vindas
setTimeout(() => {
  import("../utils/toast.js").then(({ showToast }) => {
    showToast("Bem-vindo à Bibliotech!", "info");
  });
}, 1000);

function atualizarTitulo(query, generoId) {
  let titulo = "Livros em destaque";

  if (query && generoId) {
    const generoNome = genreFilter.options[genreFilter.selectedIndex].text;
    titulo = `Resultados para "${query}" - Gênero: ${generoNome}`;
  } else if (generoId) {
    const generoNome = genreFilter.options[genreFilter.selectedIndex].text;
    titulo = `Gênero: ${generoNome}`;
  } else if (query) {
    titulo = `Resultados para "${query}"`;
  }

  sectionTitle.textContent = titulo;
}

async function buscarLivros(pagina = 1) {
  paginaAtual = pagina;
  const query = searchInput.value.trim();
  const generoId = genreFilter.value ? parseInt(genreFilter.value) : null;

  atualizarTitulo(query, generoId);
  renderSkeletons(gridContainer);

  const antigaPaginacao = document.querySelector(".pagination");
  if (antigaPaginacao) antigaPaginacao.remove();

  try {
    const response = await searchBooks({
      query,
      genero_id: generoId,
      pagina,
      limite,
    });

    showPriceFilter(); // <-- chama aqui fora do if

    if (response.status === "success") {
      const livros = response.data;
      gridContainer.classList.remove("fade-in");
      void gridContainer.offsetWidth;
      gridContainer.innerHTML = "";
      renderBooks(gridContainer, livros);
      gridContainer.classList.add("fade-in");

      const favoritos = await carregarListaDesejos();
      configurarBotoesFavoritos(favoritos, ".btn-favorito");

      renderPaginacao(response.paginacao);
    }
  } catch (err) {
    gridContainer.innerHTML = `<p>Erro ao buscar livros.</p>`;
  }
}

async function carregarLivros(pagina = 1) {
  paginaAtual = pagina;
  renderSkeletons(gridContainer);
  const antigaPaginacao = document.querySelector(".pagination");
  if (antigaPaginacao) antigaPaginacao.remove();

  try {
    const response = await getBooks({ pagina, limite });

    if (response.status === "success") {
      const livros = response.data;
      gridContainer.classList.remove("fade-in");
      void gridContainer.offsetWidth;
      gridContainer.innerHTML = "";
      renderBooks(gridContainer, livros);
      gridContainer.classList.add("fade-in");

      const favoritos = await carregarListaDesejos();
      configurarBotoesFavoritos(favoritos, ".btn-favorito");
      renderPaginacao(response.paginacao);
    }
  } catch (err) {
    gridContainer.innerHTML = `<p>Erro ao carregar livros.</p>`;
  }
}

function renderPaginacao(paginacao) {
  if (!paginacao || paginacao.totalPaginas <= 1) return;

  const paginacaoDiv = document.createElement("div");
  paginacaoDiv.classList.add("pagination");

  for (let i = 1; i <= paginacao.totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.classList.add("page-btn");
    if (i === paginacao.pagina) btn.classList.add("active");
    btn.textContent = i;
    btn.dataset.pagina = i;

    btn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      query ? buscarLivros(i) : carregarLivros(i);
    });

    paginacaoDiv.appendChild(btn);
  }

  const container = document.querySelector(".container");
  container.appendChild(paginacaoDiv);
}

function showPriceFilter() {
  const query = searchInput.value.trim();
  const genero = genreFilter.value;

  const sidebarExistente = document.querySelector(".price-filter-sidebar");
  if (!query && !genero) {
    if (sidebarExistente) {
      sidebarExistente.remove();
      document.querySelector(".container")?.classList.remove("with-sidebar");
    }
    return;
  }

  if (sidebarExistente) return;

  const sidebar = document.createElement("div");
  sidebar.className = "price-filter-sidebar";
  sidebar.innerHTML = `
    <h3>Filtrar por preço</h3>
    <div class="filter-content">
      <div class="price-slider-container">
        <input type="range" id="price-min" min="0" max="200" value="0" class="price-slider">
        <input type="range" id="price-max" min="0" max="200" value="200" class="price-slider">
        <div class="price-ranges">
          <span>R$ <span id="min-value">0</span></span>
          <span>R$ <span id="max-value">200</span></span>
        </div>
      </div>
      <button id="apply-price-filter" class="btn">Aplicar</button>
      <button id="reset-price-filter" class="btn btn-secondary">Resetar</button>
    </div>
  `;

  const container = document.querySelector(".container");
  container?.classList.add("with-sidebar");
  container?.insertBefore(sidebar, sectionTitle.nextSibling);

  setupPriceSlider();
  document
    .getElementById("apply-price-filter")
    ?.addEventListener("click", () => aplicarFiltroDePreco());
  document
    .getElementById("reset-price-filter")
    ?.addEventListener("click", () => aplicarFiltroDePreco(true));
}

function setupPriceSlider() {
  const minSlider = document.getElementById("price-min");
  const maxSlider = document.getElementById("price-max");
  const minValue = document.getElementById("min-value");
  const maxValue = document.getElementById("max-value");

  minSlider?.addEventListener("input", () => {
    if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
      minSlider.value = maxSlider.value;
    }
    minValue.textContent = minSlider.value;
  });

  maxSlider?.addEventListener("input", () => {
    if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
      maxSlider.value = minSlider.value;
    }
    maxValue.textContent = maxSlider.value;
  });
}

function aplicarFiltroDePreco(reset = false) {
  const minSlider = document.getElementById("price-min");
  const maxSlider = document.getElementById("price-max");
  const minValue = document.getElementById("min-value");
  const maxValue = document.getElementById("max-value");

  const min = reset ? 0 : parseInt(minSlider.value);
  const max = reset ? 200 : parseInt(maxSlider.value);

  if (reset) {
    minSlider.value = "0";
    maxSlider.value = "200";
    minValue.textContent = "0";
    maxValue.textContent = "200";
  }

  document.querySelectorAll(".book-card").forEach((card) => {
    const precoTexto = card.querySelector("strong")?.textContent || "";
    const preco = parseFloat(
      precoTexto.replace("R$", "").replace(",", ".").trim()
    );
    card.style.display = preco >= min && preco <= max ? "flex" : "none";
  });
}

// EVENTOS DOM
modalClose?.addEventListener("click", () => (modal.style.display = "none"));
searchButton?.addEventListener("click", () => buscarLivros(1));
searchInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    buscarLivros(1);
  }
});

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", async () => {
  await carregarGeneros("filter-genres");

  const params = new URLSearchParams(window.location.search);
  const termoBusca = params.get("search");
  const generoId = params.get("genero_id")
    ? parseInt(params.get("genero_id"))
    : null;

  // SETA PRIMEIRO os valores nos inputs
  if (termoBusca) searchInput.value = termoBusca;
  if (generoId) genreFilter.value = generoId;

  // DEPOIS executa a busca com os valores setados
  if (termoBusca || generoId) {
    buscarLivros();
  } else {
    carregarLivros();
  }
});
