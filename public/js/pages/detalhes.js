import { getBookById } from "../api/livro.js";

function selecionarOpcao(elemento) {
    // Remove a classe ativo de todos os botões
    const botoes = document.querySelectorAll('.opcao');
    botoes.forEach(btn => btn.classList.remove('ativo'));
    

    elemento.classList.add('ativo');
}

window.selecionarOpcao = selecionarOpcao;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");

  if (!bookId) {
    alert("Livro não encontrado!");
    return;
  }

  try {
    const response = await getBookById(bookId);

    if (response.status === "success") {
      const livro = response.data;

      // Atualiza os elementos da página com os detalhes do livro
      document.querySelector(".titulo-livro").textContent = livro.titulo;
      document.querySelector(".autor").textContent = `por ${livro.autor}`;
      document.querySelector(".preco").textContent = `R$ ${livro.preco}`;
      document.querySelector(".capa-livro").innerHTML = `<img src="${livro.imagem_url}" alt="${livro.titulo}" />`;
      document.querySelector(".secao-conteudo .descricao").textContent = livro.descricao || "Descrição não disponível.";
      document.querySelector(".info-item .editora").textContent = livro.editora || "Editora não informada.";
      document.querySelector(".info-item .publicacao").textContent = livro.data_publicacao || "Data de publicação não disponível.";
      document.querySelector(".info-item .genero").textContent = livro.genero_nome || "Gênero não informado.";
      document.querySelector(".info-item .idioma").textContent = livro.idioma || "Idioma não informado.";
    } else {
      alert("Erro ao carregar os detalhes do livro.");
    }
  } catch (error) {
    console.error("Erro ao buscar os detalhes do livro:", error);
    alert("Erro ao carregar os detalhes do livro.");
  }
});

