import { API_BASE } from "../config.js";

export async function login(email, senha) {
  const response = await fetch(API_BASE + "/auth.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function cadastrarUsuario(nome, email, senha) {
  const response = await fetch(API_BASE + "/cadastro-usuario.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, email, senha }),
  });

    const responseData = await response.json();

  if (!response.ok) {
    // Lança a mensagem de erro retornada pelo backend
    throw new Error(responseData.message || "Erro desconhecido no cadastro");
  }

  return responseData;
}
