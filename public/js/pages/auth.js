import { login, cadastrarUsuario } from "../api/auth.js";

const loginForm = document.getElementById("login-form");
const cadastroForm = document.getElementById("cadastro-form");
const errorMessage = document.querySelector(".form-error");
const loadingSpinner = document.querySelector(".loading-spinner");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.style.display = "none"; // Esconde a mensagem de erro
    errorMessage.textContent = ""; // Limpa o texto da mensagem de erro

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const loginButton = document.getElementById("btn-login");

    loginButton.disabled = true;
    loadingSpinner.style.display = "inline-block";

    try {
      const response = await login(email, senha);
      if (response.status === "success") {
        window.location.href = "../../../bibliotech/view/home.html";
      } else {
        errorMessage.textContent = "Email ou senha incorretos. Tente novamente.";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      errorMessage.textContent =
        "Erro de conexão com o servidor. Tente novamente.";
      errorMessage.style.display = "block";
    } finally {
      loginButton.disabled = false;
      loadingSpinner.style.display = "none";
    }
  });
}

if (cadastroForm) {
  cadastroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorMessage.style.display = "none";
    errorMessage.textContent = "";

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirmarSenha = document.getElementById("confirmar-senha").value.trim();
    const cadastroButton = document.getElementById("btn-cadastrar");

    if (senha !== confirmarSenha) {
      errorMessage.textContent = "As senhas não coincidem.";
      errorMessage.style.display = "block";
      return;
    }

    cadastroButton.disabled = true;
    loadingSpinner.style.display = "inline-block";

    try {
      const response = await cadastrarUsuario(nome, email, senha);
      if (response.status === "success") {
        window.location.href = "../../../bibliotech/view/login.html?cadastro=success";
      } else {
        errorMessage.textContent = response.message;
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      errorMessage.textContent =
        "Erro de conexão com o servidor. Tente novamente.";
      errorMessage.style.display = "block";
    } finally {
      cadastroButton.disabled = false;
      loadingSpinner.style.display = "none";
    }
  });
}