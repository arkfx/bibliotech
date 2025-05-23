import { obterUserId } from "../../../utils/auth-utils.js";
import { getUsuario } from "../../../api/usuario.js";

export async function carregarDadosUsuario() {
  try {
    const userId = await obterUserId();
    const response = await getUsuario(userId);
    console.log("Dados do usuário:", response);

    if (response.status === "success") {
        preencherFormulario(response.data);
        atualizarNomeSidebar(response.data.nome);
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
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