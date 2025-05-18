import { API_BASE } from "../config.js";

export async function login(email, senha) {
  const response = await fetch(API_BASE + "/login", {
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
  const response = await fetch(API_BASE + "/usuario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nome, email, senha }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || "Erro desconhecido no cadastro");
  }

  return responseData;
}
