document.addEventListener("DOMContentLoaded", function () {
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  dropdownToggle.addEventListener("click", function (e) {
    e.stopPropagation(); // Impede que o clique feche imediatamente
    console.log("Clique no botão de perfil");
    dropdownMenu.classList.toggle("show");
  });

  // Fecha o menu se clicar fora
  document.addEventListener("click", function () {
    dropdownMenu.classList.remove("show");
  });
});
