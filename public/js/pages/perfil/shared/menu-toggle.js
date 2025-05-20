export function setupMenuToggle() {
    const menuItems = document.querySelectorAll(".menu-item");
    const sections = document.querySelectorAll(".profile-content");
  
    if (!menuItems.length || !sections.length) return;
  
    menuItems.forEach(item => {
      item.addEventListener("click", function() {
        // Remove classe 'active' de todos os itens
        menuItems.forEach(i => i.classList.remove("active"));
        
        // Adiciona classe 'active' apenas no item clicado
        this.classList.add("active");
        
        sections.forEach(section => {
          section.classList.add("hidden");
        });
        
        // Mostra apenas a seção correspondente
        const sectionId = `section-${this.dataset.section}`;
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
          activeSection.classList.remove("hidden");
        }
      });
    });
  }