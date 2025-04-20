import { API_BASE } from "../config.js";

export async function createBook(
  titulo,
  autor,
  genero,
  preco,
  editora,
  descricao
) {
  const response = await fetch(API_BASE + "/livro.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ titulo, autor, genero, preco, editora, descricao }),
  });

  if (!response.ok) {
    throw new Error("Falha no Cadastro do Livro");
  }

  return response.json();
}
