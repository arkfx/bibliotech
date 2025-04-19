const API_BASE = "/bibliotech/api/livro.php";

export async function createBook(titulo, autor,genero, preco,editora, descricao) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ titulo, autor, genero, preco, editora, descricao })
  });

  if (!response.ok) {
    throw new Error('Falha no Cadastro do Livro');
  }

  return response.json();
}