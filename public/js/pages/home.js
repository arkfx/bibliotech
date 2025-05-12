import { getBooks } from "../api/livro.js";
import { renderBooks, renderSkeletons } from "../utils/renderBooks.js";
import { API_BASE } from "../config.js";

document.addEventListener("DOMContentLoaded", async () => {
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
    } else {
      console.warn("Usuário não está logado ou userId não disponível.");
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
  } else {
    console.warn("Elemento 'modalClose' não encontrado no DOM.");
  }

  renderSkeletons(gridContainer);

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarLivros();
      }
    });
  } else {
    console.warn("Elemento 'searchInput' não encontrado no DOM.");
  }

  if (!searchInput || searchInput.value.trim() === "") {
    try {
      const response = await getBooks();
      if (response.status === "success") {
        const livros = response.data;
        gridContainer.innerHTML = "";

        renderBooks(gridContainer, livros, (tituloLivro) => {
          abrirModal(
            "⚠️",
            "Aviso de Compra",
            `O livro "${tituloLivro}" ainda não pode ser comprado. Esta funcionalidade está em desenvolvimento.`
          );
        });

        // 🚨 Carrinho agora é gerenciado separadamente em carrinho.js
        document.dispatchEvent(
          new CustomEvent("livrosRenderizados", {
            detail: { userId },
          })
        );
      } else {
        console.error("Erro ao carregar os livros:", response.message);
        mostrarMensagemErro(
          gridContainer,
          "Não foi possível carregar os livros. Tente novamente mais tarde."
        );
      }
    } catch (error) {
      console.error("Erro ao buscar os livros:", error);
      mostrarMensagemErro(
        gridContainer,
        "Erro ao conectar ao servidor, tente novamente mais tarde."
      );
    }
  }
});

function mostrarMensagemErro(container, mensagem) {
  container.innerHTML = `
    <div class="error-message">
      <p>${mensagem}</p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    showToast("Bem-vindo à Bibliotech!", "info");
  }, 1000);
});

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
