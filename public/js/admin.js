document.addEventListener("DOMContentLoaded", function () {
  const btnAddLivro = document.querySelector(".btn-add-livro");
  const modal = document.getElementById("modalCadastroLivro");
  const closeBtn = document.querySelector(".close-btn");
  const btnLimpar = document.querySelector(".btn.limpar");
  const fileButtons = document.querySelectorAll(".file-input-button");

  btnAddLivro.addEventListener("click", function () {
    modal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", function () {
    modal.classList.add("hidden");
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });

  btnLimpar.addEventListener("click", function () {
    document.querySelector(".form-livro").reset();
  });

  fileButtons.forEach((button) => {
    const fileInput = button.previousElementSibling;
    button.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", function () {
      if (this.files.length > 0) {
        button.textContent = this.files[0].name;
      } else {
        button.textContent = "Escolha o arquivo";
      }
    });
  });
});
