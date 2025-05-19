export function mapFormToBook(formData) {
  return {
    id: formData.get("id") ? parseInt(formData.get("id")) : null,
    titulo: formData.get("titulo"),
    autor: formData.get("autor"),
    genero_id: parseInt(formData.get("genero_id")),
    preco: parseFloat(formData.get("preco")),
    editora_id: parseInt(formData.get("editora_id")),
    descricao: formData.get("descricao"),
    imagem_url: formData.get("imagem_url"),
  };
}

export function createEmptyBook() {
  return {
    id: null,
    titulo: "",
    autor: "",
    genero_id: null,
    preco: 0.0,
    editora_id: null,
    descricao: "",
    imagem_url: "",
  };
}

export function validateBook(book) {
  const campos = [
    "titulo",
    "autor",
    "genero_id",
    "preco",
    "editora_id",
    "descricao",
    "imagem_url",
  ];

  return campos.every((campo) => {
    const valor = book[campo];
    return valor !== undefined && valor !== null && valor !== "";
  });
}

export function preencherFormulario(livro) {
  document.getElementById("titulo").value = livro.titulo;
  document.getElementById("autor").value = livro.autor;
  document.getElementById("genero").value = livro.genero_id;
  document.getElementById("preco").value = livro.preco;
  document.getElementById("editora").value = livro.editora_id;
  document.getElementById("descricao").value = livro.descricao;
  document.getElementById("imagem_url").value = livro.imagem_url || "";
}

export function limparFormularioLivro() {
  const form = document.querySelector(".form-livro");
  if (form) form.reset();
}

export function mostrarModalSucesso(id = "modalSucesso") {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("hidden");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 3000);

  modal.addEventListener(
    "click",
    () => {
      modal.classList.add("hidden");
    },
    { once: true }
  );
}
