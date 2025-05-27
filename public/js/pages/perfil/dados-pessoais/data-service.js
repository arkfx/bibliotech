import { obterUserId } from "../../../utils/auth-utils.js";
import { getUsuario } from "../../../api/usuario.js";

/**
 * Oculta o formulário enquanto carrega os dados
 */
export function ocultarFormulario() {
  const profileCard = document.querySelector(".profile-card");
  if (!profileCard) return;
  
  // Adicionar classe de loading para ocultar o conteúdo
  profileCard.classList.add("loading");
  
  const loadingIndicator = document.createElement("div");
  loadingIndicator.className = "loading-indicator";
  loadingIndicator.innerHTML = '<div class="spinner"></div>';
  profileCard.appendChild(loadingIndicator);
}

/**
 * Mostra o formulário depois de carregar os dados
 */
export function mostrarFormulario() {
  const profileCard = document.querySelector(".profile-card");
  if (!profileCard) return;
  
  // Remover classe de loading
  profileCard.classList.remove("loading");
  
  // Remover indicador de carregamento se existir
  const loadingIndicator = profileCard.querySelector(".loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

export async function carregarDadosUsuario() {
  // Ocultar formulário durante o carregamento
  ocultarFormulario();
  
  try {
    const userId = await obterUserId();
    const response = await getUsuario(userId);
    console.log("Dados do usuário:", response);

    if (response.status === "success") {
      // Preencher formulário com dados
      preencherFormulario(response.data);
      atualizarNomeSidebar(response.data.nome);
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    // Em caso de erro, mostrar mensagem no lugar do formulário
    const formContainer = document.querySelector(".profile-card");
    if (formContainer) {
      formContainer.innerHTML = `
        <div class="error-state">
          <p>Não foi possível carregar seus dados. Tente novamente mais tarde.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Tentar novamente</button>
        </div>
      `;
    }
  } finally {
    // Sempre mostrar o formulário no final
    mostrarFormulario();
  }
}

function preencherFormulario(userData) {
  document.getElementById("nome").value = userData.nome || "";
  document.getElementById("email").value = userData.email || "";
  document.getElementById("telefone").value = userData.telefone || "";
  document.getElementById("data_nascimento").value = userData.data_nascimento || "";
  
  if (userData.cpf && userData.cpf.length === 11) {
    document.getElementById("cpf").value = 
      userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
}

function atualizarNomeSidebar(nome) {
  const userName = document.querySelector(".user-name");
  if (userName) {
    userName.textContent = `Olá, ${nome.split(' ')[0]}`;
  }
}