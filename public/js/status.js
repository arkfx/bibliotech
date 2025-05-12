import { verificarSessao } from "./api/session.js";

document.addEventListener("DOMContentLoaded", async function () {
  const btnLogin = document.getElementById("btnLogin");
  const btnCadastro = document.getElementById("btnCadastro");
  const btnPainelAdmin = document.getElementById("btnPainelAdmin");
  const btnPerfil = document.getElementById("btnPerfil");
  const icart = document.getElementById("icart");

  try {
    const data = await verificarSessao();

    console.log("Status do usuário:", data);

    if (data.status === "success" && data.isLoggedIn) {
      btnLogin.style.display = "none";
      btnCadastro.style.display = "none";
      btnPerfil.style.display = "block";
      
      if (data.isAdmin) {
        icart.style.display = "none";
        btnPainelAdmin.style.display = "block";
      }
    } else {
      btnLogin.style.display = "block";
      btnCadastro.style.display = "block";
      btnPainelAdmin.style.display = "none";
      btnPerfil.style.display = "none";
    }
  } catch (error) {
    console.error("Erro ao verificar o status do usuário:", error);
  }
});

