import { obterUserId } from "../utils/auth-utils.js";
import { verificarSessao } from "../api/session.js";
import { updateUsuario } from "../api/usuario.js";
import { getUsuario } from "../api/usuario.js";
import { mostrarModalPadrao } from "../utils/modal-utils.js";

const formPerfil = document.querySelector(".profile-form");
const nomeInput = document.getElementById("nome");
const emailInput = document.getElementById("email");
const telefoneInput = document.getElementById("telefone");
const dataNascimentoInput = document.getElementById("data_nascimento");
const cpfInput = document.getElementById("cpf");
const userName = document.querySelector(".user-name");

// Função para carregar os dados do usuário
async function carregarDadosUsuario() {
  try {
    const userId = await obterUserId();
    
    if (!userId) {
      window.location.href = "login.html";
      return;
    }
    
    const data = await getUsuario(userId);
    
    if (data.status === "success") {
      const usuario = data.data;
      
      // Preencher os campos do formulário
      nomeInput.value = usuario.nome || "";
      emailInput.value = usuario.email || "";
      telefoneInput.value = usuario.telefone || "";
      dataNascimentoInput.value = usuario.data_nascimento || ""; // Já no formato correto
       // Formatar CPF se existir (12345678901 → 123.456.789-01)
       if (usuario.cpf && usuario.cpf.length === 11) {
        usuario.cpf = usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      }
      cpfInput.value = usuario.cpf || "";
      
      // Atualizar o nome de usuário na sidebar
      userName.textContent = `Olá, ${usuario.nome.split(' ')[0]}`;
    } else {
      console.error("Erro ao carregar dados do usuário:", data.message);
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
  }
}

// Função para salvar alterações dos dados pessoais
async function salvarDadosPessoais(event) {
  event.preventDefault();
  
  const btnSalvar = formPerfil.querySelector("button[type='submit']");
  
  //loading spinner
  const textoOriginal = btnSalvar.textContent;
  btnSalvar.classList.add("loading");

  try {
    const userId = await obterUserId();
    
    if (!userId) {
      window.location.href = "login.html";
      return;
    }
    
    const dadosAtualizados = {
      nome: nomeInput.value.trim(),
      email: emailInput.value.trim(),
      telefone: telefoneInput.value.trim(),
      data_nascimento: formatarDataParaEnvio(dataNascimentoInput.value),
      cpf: cpfInput.value.replace(/\D/g, '') || null // Remove pontos e traço
    };

    console.log("Dados atualizados:", dadosAtualizados);

    const data = await updateUsuario(userId, dadosAtualizados);

    if (data.status === "success") {
      userName.textContent = `Olá, ${dadosAtualizados.nome.split(' ')[0]}`;
      
      mostrarModalPadrao(
        "✅",
        "Sucesso",
        "Dados pessoais atualizados com sucesso!",
        "perfil.html",
        "Voltar para o perfil"
      );
    } else {
      mostrarModalPadrao(
        "❌",
        "Erro",
        data.message || "Erro ao atualizar dados pessoais.",
        "perfil.html",
        "Voltar para o perfil"
      );
    }
  } catch (error) {
    console.error("Erro ao salvar dados pessoais:", error);
    alert("Erro ao salvar dados. Tente novamente.");
  } finally {
    btnSalvar.classList.remove("loading");
    btnSalvar.textContent = textoOriginal;
    btnSalvar.disabled = false;
  }
}

function formatarCPF(cpf) {
  // Remove tudo que não é número
  cpf = cpf.replace(/\D/g, '');

  // Aplica a formatação: XXX.XXX.XXX-XX
  if (cpf.length <= 3) {
    return cpf;
  } else if (cpf.length <= 6) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  } else if (cpf.length <= 9) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  } else {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  }
}

function formatarDataParaExibicao(data) {
  if (!data) return "";
  return data; 
}

function formatarDataParaEnvio(data) {
  if (!data) return null; // Se o campo estiver vazio, retorna null
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return data;
  }
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`; // Formato aceito pelo banco
}

function configurarInputData() {
  // Força o formato de exibição inicial se houver valor
  if (dataNascimentoInput.value) {
    dataNascimentoInput.value = formatarDataParaExibicao(dataNascimentoInput.value);
  }
  
  // Adiciona máscara dinâmica (opcional)
  dataNascimentoInput.addEventListener('input', function(e) {
    if (e.inputType === 'insertText' && !/\d/.test(e.data)) {
      e.target.value = e.target.value.replace(/[^\d\/]/g, '');
    }
  });
}

// Adicionar máscara ao campo CPF enquanto digita
cpfInput.addEventListener("input", function (e) {
  const cursorPosition = e.target.selectionStart; // Mantém a posição do cursor
  const formattedCPF = formatarCPF(e.target.value);
  e.target.value = formattedCPF;

  // Ajusta a posição do cursor para evitar pular
  if (cursorPosition === 3 || cursorPosition === 7) {
    e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
  } else if (cursorPosition === 11) {
    e.target.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
  }
});

document.addEventListener("DOMContentLoaded", async function() {
  // Verificar se o usuário está logado
  const sessao = await verificarSessao();
  if (!sessao.isLoggedIn) {
    window.location.href = "login.html";
    return;
  }

  await carregarDadosUsuario();
  configurarInputData();
  
  // Adicionar event listener para salvar dados pessoais
  if (formPerfil) {
    formPerfil.addEventListener("submit", salvarDadosPessoais);
  }
  
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".profile-content");

  menuItems.forEach((item) => {
    item.addEventListener("click", function() {
      menuItems.forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
      
      const sectionId = `section-${this.dataset.section}`;
      
      sections.forEach((section) => {
        section.classList.add("hidden");
      });
      
      document.getElementById(sectionId).classList.remove("hidden");
    });
  });
});