/* document.addEventListener("DOMContentLoaded", function () {
  const cadastroButton = document.querySelector(".cadastro");
  const modal = document.getElementById("cadastroModal");
  const closeButton = document.querySelector(".modal-close");

  // Abrir o modal quando clicar no botão de cadastro
  cadastroButton.addEventListener("click", function (e) {
    e.preventDefault();
    modal.style.display = "flex";
  });

  // Fechar o modal quando clicar no botão de fechar
  closeButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // Fechar o modal quando clicar fora dele
  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
 */