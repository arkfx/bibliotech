import { createBook } from "../api/livro.js";

const modal = document.getElementById("modalCadastroLivro");
const btnAbrirModal = document.querySelector(".btn-add-livro");
const btnFecharModal = modal.querySelector(".close-btn");
const formLivro = modal.querySelector(".form-livro");
const btnLimpar = formLivro.querySelector(".btn.limpar");
const btnSalvar = document.getElementById("btnSalvarLivro");

function abrirModal() {
  modal.classList.remove("hidden");
}

function fecharModal() {
  modal.classList.add("hidden");
}

function limparFormulario() {
  formLivro.reset();
}

function mostrarModalSucesso() {
  const modalSucesso = document.getElementById("modalSucesso");
  modalSucesso.classList.remove("hidden");

  setTimeout(() => {
    modalSucesso.classList.add("hidden");
  }, 3000);

  modalSucesso.addEventListener("click", () => {
    modalSucesso.classList.add("hidden");
  });
}

btnAbrirModal.addEventListener("click", abrirModal);
btnFecharModal.addEventListener("click", fecharModal);

formLivro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const autor = document.getElementById("autor").value.trim();
  const genero = document.getElementById("genero").value;
  const preco = document.getElementById("preco").value.trim();
  const editora = document.getElementById("editora").value;
  const descricao = document.getElementById("descricao").value.trim();

  if (!titulo || !autor || !genero || !preco || !editora || !descricao) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  btnSalvar.classList.add("loading");
  btnSalvar.textContent = "Salvando...";

  try {
    await createBook(titulo, autor, genero, preco, editora, descricao);
    mostrarModalSucesso();
    limparFormulario();
    fecharModal();
  } catch (error) {
    alert("Erro ao cadastrar o livro: " + error.message);
  } finally {
    btnSalvar.classList.remove("loading");
    btnSalvar.textContent = "SALVAR";
  }
});
btnLimpar.addEventListener("click", limparFormulario);
