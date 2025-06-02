import {
  getLivrosDaBiblioteca,
  getLinkDoLivroNaBiblioteca,
} from "../api/biblioteca.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const livroId = params.get("id");

  if (!livroId) {
    alert("ID do livro não encontrado.");
    return;
  }

  try {
    const livrosData = await getLivrosDaBiblioteca();

    const livro = livrosData.data.find((l) => l.id == livroId);
    if (!livro) throw new Error("Livro não encontrado na sua biblioteca.");

    document.getElementById("tituloLivro").textContent = livro.titulo;
    document.getElementById("autorLivro").textContent = livro.autor;
    document.getElementById("capaLivro").src = livro.imagem_url;

    const pdfUrl = await getLinkDoLivroNaBiblioteca(livroId);
    document.getElementById("pdf-frame").src = pdfUrl;
  } catch (err) {
    console.error("Erro ao carregar leitor:", err);
    alert("Erro ao abrir o livro.");
  }
});
