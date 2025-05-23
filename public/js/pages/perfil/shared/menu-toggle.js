export function setupMenuToggle(callback) {
    const menuItems = document.querySelectorAll(".menu-item");
    
    menuItems.forEach(item => {
      item.addEventListener("click", async function() {
        const sectionId = this.dataset.section;
        
        // Ativação visual do menu
        menuItems.forEach(i => i.classList.remove("active"));
        this.classList.add("active");
        
        // Controle de seções
        document.querySelectorAll(".profile-content").forEach(s => {
          s.classList.add("hidden");
        });
        document.getElementById(`section-${sectionId}`).classList.remove("hidden");
        
        // Callback para inicialização sob demanda
        if (typeof callback === 'function') {
          await callback(sectionId);
        }
      });
    });
  }