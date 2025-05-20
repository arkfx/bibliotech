import { updateUsuario } from '../../../api/usuario.js';
import { formatCPF, handleDateInput } from './utils.js';
import { obterUserId } from '../../../utils/auth-utils.js';
import { mostrarModalPadrao } from '../../../utils/modal-utils.js';

const form = document.querySelector(".profile-form");
const userNameDisplay = document.querySelector(".user-name");

export function initForm() {
  if (!form) return;

  // Configurar máscaras
  const cpfInput = document.getElementById("cpf");
  if (cpfInput) {
    cpfInput.addEventListener("input", formatCPF);
  }

  const dateInput = document.getElementById("data_nascimento");
  if (dateInput) {
    handleDateInput(dateInput);
  }

  // Evento de submit
  form.addEventListener("submit", handleFormSubmit);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const btnSalvar = form.querySelector("button[type='submit']");
  const textoOriginal = btnSalvar.textContent;
  btnSalvar.classList.add("loading");

  try {
    const formData = getFormData();
    
    const userId = await obterUserId();
    if (!userId) {
      window.location.href = "login.html";
      return;
    }
    const response = await updateUsuario(userId, formData);

    if (response.status === "success") {
      updateUIOnSuccess(formData.nome);
      mostrarModalPadrao(
        "✅", 
        "Sucesso", 
        "Dados atualizados com sucesso!",
        "perfil.html"
      );
    } else {
      mostrarModalPadrao(
        "❌",
        "Erro",
        response.message || "Erro ao atualizar"
      );
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao salvar dados");
  } finally {
    btnSalvar.classList.remove("loading");
    btnSalvar.textContent = textoOriginal;
  }
}

function getFormData() {
  return {
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    data_nascimento: document.getElementById("data_nascimento").value,
    cpf: document.getElementById("cpf").value.replace(/\D/g, '') || null
  };
}

function updateUIOnSuccess(nome) {
  if (userNameDisplay) {
    userNameDisplay.textContent = `Olá, ${nome.split(' ')[0]}`;
  }
}