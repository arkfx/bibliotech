import { alterarSenhaUsuario } from '../../../api/usuario.js';
import { obterUserId } from '../../../utils/auth-utils.js';
import { mostrarModalPadrao } from '../../../utils/modal-utils.js';

const form = document.querySelector('.security-form');

export function initForm() {
  if (!form) return;

  form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const btnSalvar = form.querySelector("button[type='submit']");
  const textoOriginal = btnSalvar.textContent;
  btnSalvar.classList.add("loading");

  try {
    const senhaAtual = document.getElementById('senha_atual').value;
    const novaSenha = document.getElementById('nova_senha').value;
    const confirmarSenha = document.getElementById('confirmar_senha').value;

    if (novaSenha !== confirmarSenha) {
      mostrarModalPadrao("❌", "Erro", "As senhas não coincidem.");
      return;
    }

    const userId = await obterUserId();
    if (!userId) {
      window.location.href = "login.html";
      return;
    }

    const resp = await alterarSenhaUsuario(userId, senhaAtual, novaSenha);
    console.log("Resposta da API:", resp);

    if (resp.status === 'success') {
      mostrarModalPadrao("✅", "Sucesso", "Senha alterada com sucesso!");
        form.reset();
    } else {
      mostrarModalPadrao("❌", "Erro", resp.message || "Erro ao alterar senha.");
    }
  } catch (error) {
    console.error("Erro:", error);
    mostrarModalPadrao("❌", "Erro", "Erro ao alterar senha.");
  } finally {
    btnSalvar.classList.remove("loading");
    btnSalvar.textContent = textoOriginal;
  }
}