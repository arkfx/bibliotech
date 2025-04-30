import { API_BASE } from "../config.js";
import { searchBooks } from "./livro.js";

export async function addBookToCart(titulo, quantidade, userId) {
    try {
      $livroCarrinho = searchBooks(titulo);
    } catch (error) {
      console.error("Erro ao buscar o livro:", error);
      throw new Error("Erro ao buscar o livro.");
    }
  
    if ($livroCarrinho.length === 0) {
      throw new Error("Livro não encontrado.");
    } else if ($livroCarrinho.length > 1) {
      throw new Error("Mais de um livro encontrado.");
    }
    const livroId = $livroCarrinho[0].id;
    
    const response = await fetch(API_BASE + "/carrinho.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ livroId, quantidade, userId }),
    });
  
    if (!response.ok) {
      throw new Error("Erro ao adicionar o livro ao carrinho.");
    }
  
    return response.json();
}
  