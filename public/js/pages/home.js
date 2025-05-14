import { getBooks } from "../api/livro.js";
import { renderBooks, renderSkeletons } from "../utils/renderBooks.js";
import {
  getListaDesejos,
  adicionarLivroListaDesejos,
  removerLivroListaDesejos
} from "../api/lista-desejos.js";
import { obterUserId } from "../utils/auth-utils.js";
import { API_BASE } from "../config.js";

// TOAST DE BOAS-VINDAS
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    showToast("Bem-vindo à Bibliotech!", "info");
  }, 1000);
});

// MAIN
document.addEventListener("DOMContentLoaded", async () => {
    // 🔄 Recarrega a página se voltar do histórico
    window.addEventListener("pageshow", (event) => {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        location.reload();
    }
    });


  const gridContainer = document.querySelector(".grid--4-cols");
  const searchInput = document.querySelector(".main-nav-list input");
  const modal = document.getElementById("cadastroModal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalClose = document.getElementById("modal-close");
  const modalIcon = modal.querySelector(".modal-icon");

  let userId = null;
  try {
    const sessionRes = await fetch(API_BASE + "/session-status.php");
    const sessionData = await sessionRes.json();
    if (sessionData.status === "success" && sessionData.userId) {
      userId = sessionData.userId;
    }
  } catch (err) {
    console.error("Erro ao buscar status da sessão:", err);
  }

  function abrirModal(emoji, titulo, mensagem) {
    modalIcon.textContent = emoji;
    modalTitle.textContent = titulo;
    modalMessage.textContent = mensagem;
    modal.style.display = "flex";
  }

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  renderSkeletons(gridContainer);

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarLivros();
      }
    });
  }

  // CARREGAR LIVROS
  if (!searchInput || searchInput.value.trim() === "") {
    try {
      const response = await getBooks();
      if (response.status === "success") {
        const livros = response.data;
        gridContainer.innerHTML = "";

        renderBooks(gridContainer, livros);

        document.dispatchEvent(
          new CustomEvent("livrosRenderizados", {
            detail: { userId },
          })
        );

        if (userId) {
          try {
            const resposta = await getListaDesejos(userId);
            const lista = resposta.data || [];
            const favoritos = new Set(lista.map(id => parseInt(id)));

            document.querySelectorAll(".btn-favorito").forEach((btn) => {
              const livroId = parseInt(btn.dataset.id);

              const atualizarBotao = () => {
                if (favoritos.has(livroId)) {
                  btn.classList.add("salvo");
                  btn.textContent = "❌";
                  btn.title = "Remover da Lista de Desejos";
                } else {
                  btn.classList.remove("salvo");
                  btn.textContent = "💙";
                  btn.title = "Salvar na Lista de Desejos";
                }
              };

              atualizarBotao();

              btn.addEventListener("click", async () => {
                if (favoritos.has(livroId)) {
                  const res = await removerLivroListaDesejos(livroId);
                  if (res.status === "success") {
                    favoritos.delete(livroId);
                    atualizarBotao();
                    showToast("Removido da lista de desejos", "info");
                  }
                } else {
                  const res = await adicionarLivroListaDesejos(livroId);
                  if (res.status === "success") {
                    favoritos.add(livroId);
                    atualizarBotao();
                    showToast("Adicionado à lista de desejos!", "success");
                  }
                }
              });
            });
          } catch (err) {
            console.error("Erro ao gerenciar favoritos na home:", err);
          }
        }
      } else {
        mostrarMensagemErro(gridContainer, "Erro ao carregar livros.");
      }
    } catch (error) {
      mostrarMensagemErro(gridContainer, "Erro de conexão.");
    }
  }
});

// FUNÇÕES AUXILIARES
function mostrarMensagemErro(container, mensagem) {
  container.innerHTML = `
    <div class="error-message">
      <p>${mensagem}</p>
    </div>
  `;
}

function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.classList.add("toast", type);

  const icons = {
    info: "info-circle",
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
  };

  const icon = icons[type] || "info-circle";

  toast.innerHTML = `
    <i class="fas fa-${icon} toast-icon"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;

  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.classList.add("toast-container");
    document.body.appendChild(container);
  }

  container.appendChild(toast);

  void toast.offsetWidth;
  toast.classList.add("active");

  let timeoutId = setTimeout(() => {
    toast.classList.remove("active");
    toast.classList.add("fadeOut");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, duration);

  toast.querySelector(".toast-close").addEventListener("click", () => {
    clearTimeout(timeoutId);
    toast.classList.remove("active");
    toast.classList.add("fadeOut");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  });

  toast.addEventListener("mouseenter", () => {
    clearTimeout(timeoutId);
  });

  toast.addEventListener("mouseleave", () => {
    timeoutId = setTimeout(() => {
      toast.classList.remove("active");
      toast.classList.add("fadeOut");
      toast.addEventListener("transitionend", () => toast.remove(), {
        once: true,
      });
    }, duration);
  });

  return toast;
}
