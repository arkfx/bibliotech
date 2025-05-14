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
      if (btnLogin) btnLogin.style.display = "none";
      if (btnCadastro) btnCadastro.style.display = "none";
      if (btnPerfil) btnPerfil.style.display = "block";

      if (data.isAdmin) {
        if (icart) icart.style.display = "none";
        if (btnPainelAdmin) btnPainelAdmin.style.display = "block";
      }
    } else {
      if (btnLogin) btnLogin.style.display = "block";
      if (btnCadastro) btnCadastro.style.display = "block";
      if (btnPainelAdmin) btnPainelAdmin.style.display = "none";
      if (btnPerfil) btnPerfil.style.display = "none";
    }
  } catch (error) {
    console.error("Erro ao verificar o status do usuário:", error);
  }
});
