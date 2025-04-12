// Verifica o status de login
window.onload = function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // Se o usuário estiver logado
  if (isLoggedIn === "true") {
    document.getElementById("btnLogin").style.display = "none"; // Esconde o botão de login
    document.getElementById("btnCadastro").style.display = "none"; // Esconde o botão de cadastro
    document.getElementById("btnCadastrarLivro").style.display = "block"; // Exibe o botão de cadastrar livro
    document.getElementById("btnPerfil").style.display = "block"; // Exibe o botão de perfil
  } else {
    // Caso contrário, exibe os botões de login e cadastro
    document.getElementById("btnLogin").style.display = "block";
    document.getElementById("btnCadastro").style.display = "block";
    document.getElementById("btnCadastrarLivro").style.display = "none";
    document.getElementById("btnPerfil").style.display = "none";
  }
};
