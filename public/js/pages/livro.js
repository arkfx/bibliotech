import {
  createBook,
  deleteBook,
  updateBook,
  getBooks,
  getBookById,
} from "../api/livro.js";

import { getAllEditoras } from "../api/editora.js";
import {
  mapFormToBook,
  validateBook,
  preencherFormulario,
  limparFormularioLivro,
  mostrarModalSucesso,
} from "../utils/livro.js";

const modal = document.getElementById("modalCadastroLivro");
const btnAbrirModal = document.querySelector(".btn-add-livro");
const btnFecharModal = modal.querySelector(".close-btn");
const formLivro = modal.querySelector(".form-livro");
const btnLimpar = formLivro.querySelector(".btn.limpar");
const btnSalvar = document.getElementById("btnSalvarLivro");
const modalTitulo = modal.querySelector("h2");
const tbody = document.querySelector(".admin-table tbody");

const modalConfirmarExclusao = document.getElementById(
  "modalConfirmarExclusao"
);
const btnConfirmarExclusao = document.getElementById("btnConfirmarExclusao");
const btnCancelarExclusao = document.getElementById("btnCancelarExclusao");

let livroEmEdicaoId = null;
let livroParaExcluirId = null;

document.addEventListener("DOMContentLoaded", async () => {
  await carregarLivros();
  await carregarEditoras();
});

function abrirModal() {
  modal.classList.remove("hidden");
}

function fecharModal() {
  modal.classList.add("hidden");
  limparFormularioLivro();
  livroEmEdicaoId = null;
  btnSalvar.textContent = "SALVAR";
  modalTitulo.textContent = "Cadastro de Livros";
}

function abrirModalConfirmacaoExclusao(id) {
  livroParaExcluirId = id;
  modalConfirmarExclusao.classList.remove("hidden");
}

function fecharModalConfirmacaoExclusao() {
  modalConfirmarExclusao.classList.add("hidden");
  livroParaExcluirId = null;
}

btnAbrirModal.addEventListener("click", abrirModal);
btnFecharModal.addEventListener("click", fecharModal);
btnLimpar.addEventListener("click", limparFormulario);

async function carregarEditoras() {
  try {
    const response = await getAllEditoras();

    if (response.success) {
      const editoraSelect = document.getElementById("editora");

      const firstOption = editoraSelect.options[0];
      editoraSelect.innerHTML = "";
      editoraSelect.appendChild(firstOption);

      response.data.forEach((editora) => {
        const option = document.createElement("option");
        option.value = editora.id;
        option.textContent = editora.nome;
        editoraSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar editoras:", error);
  }
}

async function carregarLivros() {
  try {
    const response = await getBooks();
    tbody.innerHTML = "";

    if (response.status === "success") {
      response.data.forEach((livro) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${livro.id}</td>
          <td>${livro.titulo}</td>
          <td>${livro.autor}</td>
          <td>${livro.genero_nome}</td>
          <td>R$ ${livro.preco}</td>
          <td><img src="${livro.imagem_url}" alt="${livro.titulo}" style="height: 50px;" /></td>
          <td>
            <button class="btn visualizar">Visualizar</button>
            <button class="btn editar">Editar</button>
            <button class="btn excluir">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      adicionarEventosTabela();
    }
  } catch (error) {
    alert("Erro ao carregar livros.");
  } finally {
  }
}

function adicionarEventosTabela() {
  console.log("🔧 adicionando eventos de editar/excluir...");
  tbody.querySelectorAll(".btn.excluir").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const btnExcluir = e.target;

      const row = e.target.closest("tr");
      const bookId = row.querySelector("td").textContent.trim();

      abrirModalConfirmacaoExclusao(bookId);
    });
  });

  document.querySelectorAll(".btn.editar").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const btnEditar = e.target;
      const row = btnEditar.closest("tr");
      const bookId = row.querySelector("td").textContent.trim();

      try {
        btnEditar.classList.add("loading");

        const response = await getBookById(bookId);
        if (response.status === "success") {
          const livro = response.data;
          preencherFormulario(livro);

          livroEmEdicaoId = livro.id;
          btnSalvar.textContent = "ATUALIZAR";
          modalTitulo.textContent = "Editar Livro";
          abrirModal();
        } else {
          alert("Livro não encontrado.");
        }
      } catch (error) {
        alert("Erro ao carregar dados do livro.");
      } finally {
        btnEditar.classList.remove("loading");
      }
    });
  });

  tbody.querySelectorAll(".btn.visualizar").forEach((button) => {
    button.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      const bookId = row.querySelector("td").textContent.trim();
      window.location.href = `detalhes-livro.html?id=${bookId}`;
    });
  });
}

formLivro.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(formLivro);
  const livro = mapFormToBook(formData);

  if (livroEmEdicaoId) {
    livro.id = livroEmEdicaoId;
  }
  console.log("📦 Livro montado:", livro);

  if (!validateBook(livro)) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  btnSalvar.classList.add("loading");
  btnSalvar.innerHTML = livro.id ? "Atualizando..." : "Salvando...";

  try {
    if (livro.id) {
      await updateBook(livro);
    } else {
      await createBook(livro);
    }

    await carregarLivros();
    fecharModal();
    mostrarModalSucesso();
  } catch (error) {
    alert("Erro ao salvar livro. Tente novamente!");
    console.error(error);
  } finally {
    btnSalvar.classList.remove("loading");
    btnSalvar.innerHTML = livro.id ? "ATUALIZAR" : "SALVAR";
  }
});

btnConfirmarExclusao.addEventListener("click", async () => {
  if (!livroParaExcluirId) return;

  btnConfirmarExclusao.classList.add("loading");

  try {
    await deleteBook(livroParaExcluirId);
    await carregarLivros();
    mostrarModalSucesso("modalSucessoExclusao");
  } catch (error) {
    alert("Erro ao excluir o livro: " + error.message);
  } finally {
    fecharModalConfirmacaoExclusao();
    btnConfirmarExclusao.classList.remove("loading");
  }
});

btnCancelarExclusao.addEventListener("click", () => {
  fecharModalConfirmacaoExclusao();
});
