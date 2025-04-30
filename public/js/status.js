document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const isAdmin = localStorage.getItem("isAdmin");

  const btnLogin = document.getElementById("btnLogin");
  const btnCadastro = document.getElementById("btnCadastro");
  const btnCadastrarLivro = document.getElementById("btnCadastrarLivro");
  const btnPerfil = document.getElementById("btnPerfil");
  const icart = document.getElementById("icart");
  const btnLogout = document.getElementById("btnLogout");

  if (isLoggedIn === "true") {
    btnLogin.style.display = "none";
    btnCadastro.style.display = "none";
    btnCadastrarLivro.style.display = "block";
    btnPerfil.style.display = "block";

    if (isAdmin === "true") {
      icart.style.display = "none";
    }
  } else {
    btnLogin.style.display = "block";
    btnCadastro.style.display = "block";
    btnCadastrarLivro.style.display = "none";
    btnPerfil.style.display = "none";
  }

  btnLogout.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    window.location.href = "../../../bibliotech/view/home.html";
  });
});
