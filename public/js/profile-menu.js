import { logout } from "./api/session.js";

document.addEventListener("DOMContentLoaded", function () {
  // Logout
  const btnLogout = document.getElementById("btnLogout");

  if (btnLogout) {
    btnLogout.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        const data = await logout();
        console.log("Logout realizado:", data);

        if (data.status === "success") {
          window.location.href = "home.html";
        }
      } catch (error) {
        console.error("Erro ao realizar logout:", error);
      }
    });
  }

  // Dropdown Menu
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", function (e) {
      e.stopPropagation(); // Impede que o clique feche imediatamente
      dropdownMenu.classList.toggle("show");
    });

    // Fecha o menu se clicar fora
    document.addEventListener("click", function () {
      dropdownMenu.classList.remove("show");
    });
  }
});