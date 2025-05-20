document.addEventListener("DOMContentLoaded", function () {
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".profile-content");

  // Adicionar event listeners para cada item do menu
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuItems.forEach((i) => i.classList.remove("active"));

      this.classList.add("active");

      // Obter a seção correspondente
      const sectionId = `section-${this.dataset.section}`;

      sections.forEach((section) => {
        section.classList.add("hidden");
      });

      // Mostrar a seção correspondente
      document.getElementById(sectionId).classList.remove("hidden");
    });
  });
});


