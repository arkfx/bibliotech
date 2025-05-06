import { searchBooks } from "../api/livro.js";
import { renderBooks, renderSkeletons } from "../utils/renderBooks.js";

const searchInput = document.querySelector(".main-nav-list input");
const searchButton = document.querySelector(".main-nav-list button");
const genreFilter = document.querySelector(".filter-genres");
const gridContainer = document.querySelector(".grid--4-cols");
const sectionTitle = document.querySelector(".heading-secondary");
const modal = document.getElementById("cadastroModal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

function abrirModal(titulo, mensagem) {
  modalTitle.textContent = titulo;
  modalMessage.textContent = mensagem;
  modal.style.display = "flex";
}

// Função para fechar o modal
function fecharModal() {
  modal.style.display = "none";
}

// Eventos para fechar o modal
modalClose.addEventListener("click", fecharModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) fecharModal();
});

// Atualiza o título da seção com base na busca
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

// Função para buscar livros
async function buscarLivros() {
  const query = searchInput.value.trim();
  const generoId = genreFilter.value;

  atualizarTitulo(query, generoId);
  renderSkeletons(gridContainer);

  try {
    const response = await searchBooks(query, generoId);
    if (response.status === "success") {
      renderBooks(gridContainer, response.data, (tituloLivro) => {
        abrirModal(
          "Aviso de Compra",
          `O livro "${tituloLivro}" ainda não pode ser comprado. Esta funcionalidade está em desenvolvimento.`
        );
      });
    } else {
      gridContainer.innerHTML = `<p>${response.message}</p>`;
    }
  } catch (error) {
    console.error("Erro ao buscar os livros:", error);
    gridContainer.innerHTML =
      "<p>Erro ao buscar os livros. Tente novamente mais tarde.</p>";
  }
}

// Configura os eventos do slider de preço
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

// Aplica ou reseta o filtro de preço
function aplicarFiltroDePreco(reset = false) {
  const minPrice = reset ? 0 : parseInt(document.getElementById("price-min").value);
  const maxPrice = reset ? 200 : parseInt(document.getElementById("price-max").value);

  document.getElementById("min-value").textContent = minPrice;
  document.getElementById("max-value").textContent = maxPrice;

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

// cria e mostra o filtro de preço
function showPriceFilter() {
  // Verifica se o gênero selecionado é "Todos os Gêneros"
  if (genreFilter.value === "" && searchInput.value.trim() === "") {
    // Remove o filtro de preço se ele já estiver visível
    const existingSidebar = document.querySelector(".price-filter-sidebar");
    if (existingSidebar) {
      existingSidebar.remove();
      const container = document.querySelector(".container");
      container.classList.remove("with-sidebar");
    }
    return; // Não exibe o filtro de preço
  }

  // Verifica se o filtro já foi criado
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
  container.classList.add("with-sidebar");
  container.insertBefore(
    sidebar,
    container.querySelector(".heading-secondary").nextSibling
  );

  setupPriceSlider();

  document
    .getElementById("apply-price-filter")
    .addEventListener("click", () => aplicarFiltroDePreco());
  document
    .getElementById("reset-price-filter")
    .addEventListener("click", () => aplicarFiltroDePreco(true));
}

document.addEventListener("DOMContentLoaded", () => {
  searchButton.addEventListener("click", () => {
    showPriceFilter();
    buscarLivros();
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      showPriceFilter();
      buscarLivros();
    }
  });
});