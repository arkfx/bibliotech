import {
  getListaDesejos,
  adicionarLivroListaDesejos,
  removerLivroListaDesejos,
} from "../api/lista-desejos.js";
import { obterUserId } from "./auth-utils.js";
import { mostrarModalPadrao } from "./modal-utils.js";
import { showToast } from "./toast.js";

// Armazena os favoritos atuais do usuário para referência
let favoritosGlobais = new Set();

/**
 * Carrega a lista de desejos do usuário autenticado
 */
export async function carregarListaDesejos() {
  const userId = await obterUserId();
  if (!userId) return new Set();

  try {
    const resposta = await getListaDesejos(userId);

    // Aqui pode vir um array de objetos ou de IDs
    const lista = Array.isArray(resposta.data)
      ? resposta.data.map((l) =>
          typeof l === "object" ? parseInt(l.livro_id || l.id) : parseInt(l)
        )
      : [];

    favoritosGlobais = new Set(lista);
    return favoritosGlobais;
  } catch (error) {
    console.error("Erro ao carregar lista de desejos:", error);
    return new Set();
  }
}

/**
 * Atualiza visualmente os botões já presentes no DOM
 * @param {Set} favoritos - Conjunto de IDs dos livros na lista de desejos
 * @param {string} botaoSelector - Seletor CSS para os botões
 * @param {boolean} atualizarVisual - Se deve atualizar a aparência dos botões
 */
export function configurarBotoesFavoritos(
  favoritos,
  botaoSelector = ".btn-favorito",
  atualizarVisual = true
) {
  favoritosGlobais = favoritos;

  const botoes = document.querySelectorAll(botaoSelector);

  botoes.forEach((btn) => {
    const livroId = parseInt(btn.dataset.id);
    if (isNaN(livroId)) {
      console.warn("❌ Botão sem data-id válido:", btn);
      return;
    }

    // Só atualiza o visual se for explicitamente solicitado
    if (atualizarVisual) {
      if (favoritosGlobais.has(livroId)) {
        btn.classList.add("salvo");
        btn.textContent = "❌";
        btn.title = "Remover da Lista de Desejos";
      } else {
        btn.classList.remove("salvo");
        btn.textContent = "💙";
        btn.title = "Salvar na Lista de Desejos";
      }
    }
  });
}

/**
 * Ativa a lógica de clique nos botões, usando delegação de eventos
 */
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-favorito");
  if (!btn) return;

  const livroId = parseInt(btn.dataset.id);
  if (isNaN(livroId)) {
    console.warn("❌ Clique em botão inválido (sem data-id):", btn);
    return;
  }

  const userId = await obterUserId();
  if (!userId) {
    mostrarModalPadrao(
      "🔒",
      "Login necessário",
      "Você precisa estar logado para salvar livros na lista de desejos.",
      "login.html",
      "Ir para o login"
    );
    return;
  }

  const atualizarBotao = () => {
    if (favoritosGlobais.has(livroId)) {
      btn.classList.add("salvo");
      btn.textContent = "❌";
      btn.title = "Remover da Lista de Desejos";
    } else {
      btn.classList.remove("salvo");
      btn.textContent = "💙";
      btn.title = "Salvar na Lista de Desejos";
    }
  };

  try {
    if (favoritosGlobais.has(livroId)) {
      const res = await removerLivroListaDesejos(livroId);
      if (res.status === "success") {
        favoritosGlobais.delete(livroId);
        atualizarBotao();
        showToast("Removido da lista de desejos", "info");
      }
    } else {
      const res = await adicionarLivroListaDesejos(livroId);
      if (res.status === "success") {
        favoritosGlobais.add(livroId);
        atualizarBotao();
        showToast("Adicionado à lista de desejos!", "success");
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar lista de desejos:", error);
    showToast("Erro ao salvar/remover o livro", "error");
  }
});
