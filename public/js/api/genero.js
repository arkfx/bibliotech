import { API_BASE } from "../config.js";

export async function getGeneros() {
  const response = await fetch(API_BASE + "/generos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("Response received:", response);

  if (!response.ok) {
    throw new Error("Erro ao buscar os gêneros.");
  }

  return response.json();
}
