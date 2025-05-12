import { API_BASE } from "../config.js";
import { searchBooks } from "./livro.js";

export async function addBookToCart(titulo, userId, quantidade) {
    try { 
      const livros = (await searchBooks(titulo)).data;
      console.log(livros);

      if (!livros || livros.length === 0) {
        throw new Error("Livro não encontrado.");
      } else if (livros.length > 1) {
        throw new Error("Mais de um livro encontrado.");
      }
      
      const livroId = livros[0].id;
      const response = await fetch(API_BASE + "/carrinho.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: livroId, userId, quantidade }),
      });
      if (!response.ok) {
        throw new Error("Erro ao adicionar o livro ao carrinho.");
      }
      return response.json();
    } catch (error) {
      console.error("Erro ao buscar o livro ou adicionar ao carrinho:", error);
      throw error;
    }
}
  