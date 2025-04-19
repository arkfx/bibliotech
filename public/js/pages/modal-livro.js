import { createBook } from "../api/livro.js";

document.addEventListener("DOMContentLoaded", function () {
  const btnCadastrar = document.getElementById("cadastrar-livro");
  const modalBackdrop = document.getElementById("modal-backdrop");
  // Função para carregar o modal

  async function carregarModal() {
    console.log("carregando modal...");
    try {
      // Carregar o HTML do modal
      const response = await fetch("/bibliotech/view/cadastrar-livros.html");
      if (!response.ok) {
        throw new Error("Não foi possível carregar o modal");
      }

      const htmlModal = await response.text();

      // Inserir o HTML do modal no backdrop
      modalBackdrop.innerHTML = htmlModal;

      // Mostrar o modal
      modalBackdrop.style.display = "flex";

      // Configurar os eventos do modal depois que ele for carregado
      configurarEventosModal();
    } catch (error) {
      console.error("Erro ao carregar o modal:", error);
      alert(
        "Não foi possível carregar o formulário de cadastro. Por favor, tente novamente."
      );
    }
  }

  // Função para configurar os eventos do modal
  async function configurarEventosModal() {
    const btnFechar = document.getElementById("fechar-modal");
    const btnLimpar = document.getElementById("limpar-campos");
    const btnSalvar = document.getElementById("salvar");
    const form = document.getElementById("form-cadastro");
    const fileInputs = document.querySelectorAll(".file-input");

    // Evento para fechar o modal
    btnFechar.addEventListener("click", fecharModal);

    // Evento para limpar campos
    btnLimpar.addEventListener("click", function () {
      form.reset();
    });

    // Fechar o modal ao clicar fora dele
    modalBackdrop.addEventListener("click", function (event) {
      if (event.target === modalBackdrop) {
        fecharModal();
      }
    });

    btnSalvar.addEventListener("click", async function () {
      event.preventDefault(); // Impede o envio do formulário

      const titulo = form.titulo.value;
      const autor = form.autor.value;
      const genero = form.genero.value;
      const preco = form.preco.value;
      const editora = form.editora.value;
      const descricao = form.descricao.value;

      try {
        // Chamar a função de criação do livro
        const response = await createBook(
          titulo,
          autor,
          genero,
          preco,
          editora,
          descricao
        );
        console.log("resposta da api:", response.status);
        if (response.status === "success") {
          alert("Livro cadastrado com sucesso!");
        } else {
          alert(
            "Erro ao cadastrar o livro. Por favor, verifique os dados e tente novamente."
          );
        }
      } catch (error) {
        console.error("Erro ao cadastrar livro:", error);
        alert("Erro de conexão com o servidor. Tente novamente mais tarde.");
        loadingSpinner.style.display = "none"; // Esconde a bola de carregamento
      }
      fecharModal();
    });

    // Evitar que o formulário seja enviado
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    // Funcionalidade para os botões de upload de arquivo
    fileInputs.forEach(function (input) {
      input.addEventListener("click", function () {
        alert("Função de upload não implementada nesta demonstração");
      });
    });
  }

  // Função para fechar o modal
  function fecharModal() {
    modalBackdrop.style.display = "none";
  }

  // Adicionar evento para abrir o modal ao clicar no botão
  btnCadastrar.addEventListener("click", carregarModal);
});
