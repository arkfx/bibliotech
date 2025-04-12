import { login } from "../api/auth.js";

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const loginButton = document.getElementById("btn-login");
const loadingSpinner = document.getElementById("loading-spinner"); //bola de carregamento

const errorMessage = document.getElementById("error-message");

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede o envio padrão do formulário

  const emailValue = email.value;
  const senhaValue = senha.value;

  // Mostra a bola de carregamento e esconde o botão
  loginButton.disabled = true; // Desativa o botão de login
  loadingSpinner.style.display = "inline-block"; // Mostra a bola de carregamento

  try {
    const response = await login(emailValue, senhaValue);
    console.log(response);
    if (response.status === 'success') {
        localStorage.setItem("isLoggedIn", "true"); // Marca que o admin está logado
        window.location.href = "../../../bibliotech/view/";
    }
  } catch (error) {
    errorMessage.textContent = "Email ou senha inválidos.";
    errorMessage.style.display = "block";
  } finally {
    loginButton.disabled = false;
    loadingSpinner.style.display = "none";
  }
});
