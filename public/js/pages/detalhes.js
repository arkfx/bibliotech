import { getBookById } from "../api/livro.js";
import { renderSkeletonDetalhes } from "../utils/renderBooks.js";
import "./carrinho.js"; // Importa a lógica centralizada

function selecionarOpcao(elemento) {
  // Remove a classe ativo de todos os botões
  const botoes = document.querySelectorAll(".opcao");
  botoes.forEach((btn) => btn.classList.remove("ativo"));

  elemento.classList.add("ativo");
}

window.selecionarOpcao = selecionarOpcao;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");

  if (!bookId) {
    alert("Livro não encontrado!");
    return;
  }

  const container = document.querySelector(".livro-container");

  // Renderiza o skeleton enquanto os dados são carregados
  renderSkeletonDetalhes(container);

  try {
    const response = await getBookById(bookId);
    if (response.status === "success") {
      const livro = response.data;
      console.log("Dados do livro:", livro);

      // Atualiza os elementos da página com os detalhes do livro
      container.innerHTML = `
        <div class="capa-container">
          <div class="capa-livro">
            <img src="${livro.imagem_url}" alt="${livro.titulo}" />
          </div>
        </div>
        <div class="detalhes-container">
          <h1 class="titulo-livro">${livro.titulo}</h1>
          <p class="autor">por ${livro.autor}</p>
          
          <div class="opcoes-compra">
            <button class="opcao ativo" onclick="selecionarOpcao(this)">
              E-Book<br>
              Disponível<br>
              instantaneamente
            </button>
            <button class="opcao" onclick="selecionarOpcao(this)">
              Livro Normal<br>
              Envio por Correios
            </button>
          </div>
          
          <div class="preco">R$ ${livro.preco}</div>
          
            <button class="btn-comprar" data-titulo="${livro.titulo}">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path
                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
              ></path>
            </svg>
            Comprar
          </button>
          
          <div class="secao">
            <h2 class="secao-titulo">Descrição</h2>
            <div class="secao-conteudo descricao">${
              livro.descricao || "Descrição não disponível."
            }</div>
          </div>
          <div class="secao">
            <h2 class="secao-titulo">Informações</h2>
            <div class="secao-conteudo">
              <div class="info-item">
                <span class="info-label">Editora:</span> <span class="editora">${
                  livro.editora || "Editora não informada."
                }</span>
              </div>
              <div class="info-item">
               
              </div>
              <div class="info-item">
                <span class="info-label">Gênero:</span> <span class="genero-nome">${
                  livro.genero_nome || "Gênero não informado."
                }</span>
              </div>
              <div class="info-item">
         
              </div>
            </div>
          </div>
        </div>
      `;

      document.dispatchEvent(new Event("livrosRenderizados"));
    } else {
      alert("Erro ao carregar os detalhes do livro.");
    }
  } catch (error) {
    console.error("Erro ao buscar os detalhes do livro:", error);
    container.innerHTML =
      "<p>Erro ao carregar os detalhes do livro. Tente novamente mais tarde.</p>";
  }
});
