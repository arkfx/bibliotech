import { searchBooks } from "../api/livro.js";
import { renderBooks, renderSkeletons } from "../utils/renderBooks.js";
import {
  carregarListaDesejos,
  configurarBotoesFavoritos,
} from "../utils/wishlist-utils.js";
import { carregarGeneros } from "./genero.js"; // ajuste o caminho se necessário

const searchInput = document.querySelector(".main-nav-list input");
const searchButton = document.querySelector(".main-nav-list button");
const genreFilter = document.querySelector(".filter-genres");
const gridContainer = document.querySelector(".grid--4-cols");
const sectionTitle = document.querySelector(".heading-secondary");
const modal = document.getElementById("cadastroModal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

function fecharModal() {
  modal.style.display = "none";
}

if (searchButton) {
  searchButton.addEventListener("click", () => {
    showPriceFilter();
    buscarLivros();
  });
} else {
  console.warn("Elemento 'searchButton' não encontrado no DOM.");
}

if (modalClose) {
  modalClose.addEventListener("click", fecharModal);
} else {
  console.warn("Elemento 'modalClose' não encontrado no DOM.");
}

window.addEventListener("click", (e) => {
  if (e.target === modal) fecharModal();
});

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

async function buscarLivros() {
  const query = searchInput.value.trim();
  const generoId = genreFilter.value ? parseInt(genreFilter.value) : null;

  atualizarTitulo(query, generoId);
  renderSkeletons(gridContainer);

  try {
    const response = await searchBooks({
      query,
      genero_id: generoId,
    });

    if (response.status === "success") {
      const livros = response.data;
      renderBooks(gridContainer, livros);

      const favoritos = await carregarListaDesejos();
      configurarBotoesFavoritos(favoritos, ".btn-favorito");
    } else {
      gridContainer.innerHTML = `<p>${response.message}</p>`;
    }
  } catch (error) {
    console.error("Erro ao buscar os livros:", error);
    gridContainer.innerHTML =
      "<p>Erro ao buscar os livros. Tente novamente mais tarde.</p>";
  }
}

function setupPriceSlider() {
  const minSlider = document.getElementById("price-min");
  const maxSlider = document.getElementById("price-max");
  const minValue = document.getElementById("min-value");
  const maxValue = document.getElementById("max-value");

  function atualizarSlider(slider, outroSlider, valorElemento, isMin) {
    slider.addEventListener("input", () => {
      const valor = parseInt(slider.value);
      const outroValor = parseInt(outroSlider.value);

      if ((isMin && valor > outroValor) || (!isMin && valor < outroValor)) {
        slider.value = outroValor;
        valorElemento.textContent = outroValor;
      } else {
        valorElemento.textContent = valor;
      }
    });
  }

  atualizarSlider(minSlider, maxSlider, minValue, true);
  atualizarSlider(maxSlider, minSlider, maxValue, false);
}

function aplicarFiltroDePreco(reset = false) {
  const minSlider = document.getElementById("price-min");
  const maxSlider = document.getElementById("price-max");
  const minValue = document.getElementById("min-value");
  const maxValue = document.getElementById("max-value");

  const minPrice = reset ? 0 : parseInt(minSlider.value);
  const maxPrice = reset ? 200 : parseInt(maxSlider.value);

  if (reset) {
    minSlider.value = 0;
    maxSlider.value = 200;
  }
  minValue.textContent = minPrice;
  maxValue.textContent = maxPrice;

  const bookCards = document.querySelectorAll(".book-card");
  bookCards.forEach((card) => {
    const priceText = card
      .querySelector("strong")
      .textContent.replace("R$", "")
      .trim();
    const price = parseFloat(priceText.replace(",", "."));

    card.style.display =
      price >= minPrice && price <= maxPrice ? "flex" : reset ? "flex" : "none";
  });
}

function showPriceFilter() {
  if (genreFilter.value === "" && searchInput.value.trim() === "") {
    const existingSidebar = document.querySelector(".price-filter-sidebar");
    if (existingSidebar) {
      existingSidebar.remove();
      const container = document.querySelector(".container");
      container.classList.remove("with-sidebar");
    }
    return;
  }

  if (document.querySelector(".price-filter-sidebar")) return;

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
  if (container) {
    container.classList.add("with-sidebar");
    container.insertBefore(
      sidebar,
      container.querySelector(".heading-secondary")?.nextSibling || null
    );
  }

  setupPriceSlider();

  document
    .getElementById("apply-price-filter")
    .addEventListener("click", () => aplicarFiltroDePreco());
  document
    .getElementById("reset-price-filter")
    .addEventListener("click", () => aplicarFiltroDePreco(true));
}

document.addEventListener("DOMContentLoaded", async () => {
  await carregarGeneros("filter-genres");

  const params = new URLSearchParams(window.location.search);
  const termoBusca = params.get("search");
  const generoId = params.get("genero_id")
    ? parseInt(params.get("genero_id"))
    : null;

  if (termoBusca) {
    searchInput.value = termoBusca;
  }

  if (
    generoId !== null &&
    genreFilter.querySelector(`option[value="${generoId}"]`)
  ) {
    genreFilter.value = generoId;
  }

  if (termoBusca || generoId) {
    showPriceFilter();
    buscarLivros();
  }

  searchButton.addEventListener("click", () => {
    const termo = searchInput.value.trim();
    const genero = genreFilter.value;
    const path = window.location.pathname;

    if (path.includes("home.html")) {
      const url = new URL(window.location.href);
      if (termo) url.searchParams.set("search", termo);
      else url.searchParams.delete("search");

      if (genero) url.searchParams.set("genero_id", genero);
      else url.searchParams.delete("genero_id");

      window.history.pushState({}, "", url.toString());

      showPriceFilter();
      buscarLivros();
    } else {
      const basePath = path.substring(0, path.lastIndexOf("/") + 1);
      const url = new URL(basePath + "home.html", window.location.origin);
      if (termo) url.searchParams.set("search", termo);
      if (genero) url.searchParams.set("genero_id", genero);

      document.querySelector("main")?.classList.add("blur-loading");

      const overlay = document.createElement("div");
      overlay.className = "loading-overlay";
      overlay.innerHTML = `<div>Carregando...</div>`;
      document.body.appendChild(overlay);

      setTimeout(() => {
        window.location.replace(url.toString());
      }, 100);
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchButton.click();
    }
  });
});
