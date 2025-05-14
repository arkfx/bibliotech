export function mostrarModalPadrao(emoji, titulo, mensagem, redirecionarPara = null, textoBotao = "Fechar") {
  const modal = document.getElementById("cadastroModal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalIcon = modal.querySelector(".modal-icon");
  const modalClose = modal.querySelector("#modal-close");

  modalIcon.textContent = emoji;
  modalTitle.textContent = titulo;
  modalMessage.textContent = mensagem;
  modalClose.textContent = textoBotao;
  modal.style.display = "flex";

  modalClose.onclick = () => {
    modal.style.display = "none";
    if (redirecionarPara) {
      window.location.href = redirecionarPara;
    }
  };
}
