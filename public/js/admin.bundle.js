import "./navigation.js";
import "./status.js";
import "./profile-menu.js";

import { verificarSessao } from "./api/session.js";

async function verificarAcessoAdmin() {
  try {
    const data = await verificarSessao();

    if (data.status !== "success" || !data.isAdmin) {
      // Redireciona para a página inicial se não for administrador
      window.location.href = "home.html";
    }
  } catch (error) {
    console.error("Erro ao verificar acesso do administrador:", error);
    // Redireciona para a página inicial em caso de erro
    window.location.href = "home.html";
  }
}

// Verifica o acesso ao carregar a página
document.addEventListener("DOMContentLoaded", verificarAcessoAdmin);