document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".main-nav-list input");
  const searchButton = document.querySelector(".main-nav-list button");
  const genreFilter = document.querySelector(".filter-genres");

  if (!searchInput || !searchButton) return;

  function redirecionarParaBusca() {
    const termo = searchInput.value.trim();
    const genero = genreFilter?.value;

    const url = new URL("home.html", window.location.href);
    if (termo) url.searchParams.set("search", termo);
    if (genero) url.searchParams.set("genero_id", genero);

    window.location.href = url.toString();
  }

  searchButton.addEventListener("click", redirecionarParaBusca);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      redirecionarParaBusca();
    }
  });
});
