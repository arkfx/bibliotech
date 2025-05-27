import { carregarListaDesejos } from "./desejos-service.js";

export async function initWishlist() {
  await carregarListaDesejos();
}