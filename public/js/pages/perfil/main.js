import { initPersonalInfo } from './dados-pessoais/index.js';
import { setupMenuToggle } from './shared/menu-toggle.js';
import { verificarSessao } from '../../api/session.js';

// Ponto de entrada principal
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const sessao = await verificarSessao();
    if (!sessao.isLoggedIn) {
      window.location.href = "login.html";
      return;
    }

    setupMenuToggle();
    initPersonalInfo();

  } catch (error) {
    console.error("Falha na inicialização:", error);
    alert("Erro ao carregar a página");
  }
});