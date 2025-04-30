(function () {
  console.log("Executando o auth-gard.js");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isLoggedIn || !isAdmin) {
    window.location.href = "../../../bibliotech/view/home.html";
  }
})();
