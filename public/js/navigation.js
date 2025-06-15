document.addEventListener('DOMContentLoaded', function() {
  const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  
  function closeMainNav() {
    mainNav.classList.remove('active');
    document.body.style.overflow = '';
    
    const hamburger = mobileNavToggle.querySelector('.hamburger');
    if (hamburger) {
      hamburger.innerHTML = '&#9776;';
    }
  }
  
  if (mobileNavToggle && mainNav) {
    mobileNavToggle.addEventListener("click", function() {
      mainNav.classList.toggle("active");
      
      const hamburger = this.querySelector('.hamburger');
      if (hamburger) {
        hamburger.innerHTML = mainNav.classList.contains('active') ? '✕' : '&#9776;';
      }
      
      document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });
    
    const navLinks = document.querySelectorAll('.main-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', closeMainNav);
    });
    
    const searchButton = document.querySelector('.main-nav-list .btn');
    if (searchButton) {
      searchButton.addEventListener('click', closeMainNav);
    }
  }
});