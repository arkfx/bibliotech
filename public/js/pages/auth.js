import { login } from "../api/auth.js";

const email = document.getElementById("email");
const senha = document.getElementById("senha");
const loginButton = document.getElementById("btn-login");
const loadingSpinner = document.getElementById("loading-spinner"); //bola de carregamento
const errorMessage = document.getElementById("error-message");
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  errorMessage.style.display = "none"; // Esconde a mensagem de erro
  errorMessage.textContent = ""; // Limpa o texto da mensagem de erro

  const emailValue = email.value;
  const senhaValue = senha.value;

  loginButton.disabled = true;
  loadingSpinner.style.display = "inline-block";
  try {
    const response = await login(emailValue, senhaValue);
    console.log("resposta da api:", response);
    if (response.status === "success") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", response.is_admin ? "true" : "false");
      window.location.href = "../../../bibliotech/view/";
    } else {
      errorMessage.textContent = "Email ou senha incorretos. Tente novamente."; //exibe a mensagem de erro retornada pela API
      errorMessage.style.display = "block"; // Mostra a mensagem de erro
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    errorMessage.textContent =
      "Erro de conexão com o servidor. Tente novamente"; //mensagem de erro genérica
    errorMessage.style.display = "block";
  } finally {
    loginButton.disabled = false;
    loadingSpinner.style.display = "none";
  }
});
