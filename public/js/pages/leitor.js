// PDF Reader Entry Point
// Main initialization and coordination logic for the BiblioTech PDF reader

import {
  getLivrosDaBiblioteca,
  getLinkDoLivroNaBiblioteca,
} from "../api/biblioteca.js";

import { PDFViewer } from "../utils/pdf-viewer.js";

// Application initialization
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const livroId = params.get("id");
  const targetPage = params.get("page"); // Get target page from URL if available

  if (!livroId) {
    showError("ID do livro não encontrado.");
    return;
  }

  // Initialize PDF viewer
  const pdfViewer = new PDFViewer();
  
  // Initialize the viewer (DOM elements, event listeners, etc.)
  pdfViewer.init();
  
  // Make globally available for window resize handler
  window.pdfViewer = pdfViewer;
  
  // Store target page for later navigation
  if (targetPage && parseInt(targetPage) > 1) {
    window.targetPage = parseInt(targetPage);
    console.log('Target page from URL:', window.targetPage);
  }

  try {
    // Load book data
    const livrosData = await getLivrosDaBiblioteca();
    
    const livro = livrosData.data.find((l) => l.id == livroId);
    
    if (!livro) {
      throw new Error("Livro não encontrado na sua biblioteca.");
    }

    // Update book info in sidebar
    updateBookInfo(livro);

    // Load PDF
    const pdfUrl = await getLinkDoLivroNaBiblioteca(livroId);

    // Wait for PDF.js to be available
    await waitForPDFJS();
    await pdfViewer.loadPDF(pdfUrl);
    
    // Navigation to target page will now be handled by the reading session after it's fully initialized
    
  } catch (err) {
    console.error("Erro ao carregar leitor:", err);
    
    const errorDetails = {
      message: err.message,
      name: err.name,
      stack: err.stack,
      bookId: livroId
    };
    
    console.error("Error details:", errorDetails);
    
    // Show user-friendly error message
    let userMessage = "Erro ao abrir o livro";
    if (err.message.includes('PDF.js')) {
      userMessage = "Erro ao carregar o leitor de PDF. Tente recarregar a página.";
    } else if (err.message.includes('não encontrado')) {
      userMessage = "Livro não encontrado na sua biblioteca.";
    } else if (err.message.includes('PDF')) {
      userMessage = "Erro ao carregar o arquivo PDF. Verifique sua conexão.";
    }
    
    showError(`${userMessage}\n\nDetalhes técnicos: ${err.message}`);
  }
});

// Helper functions
function updateBookInfo(livro) {
  const tituloEl = document.getElementById("tituloLivro");
  const autorEl = document.getElementById("autorLivro");
  const capaEl = document.getElementById("capaLivro");
  
  if (tituloEl) tituloEl.textContent = livro.titulo;
  if (autorEl) autorEl.textContent = livro.autor;
  if (capaEl) {
    capaEl.src = livro.imagem_url;
    capaEl.alt = `Capa do livro ${livro.titulo}`;
  }
}

function showError(message) {
  alert(message);
  
  const errorEl = document.getElementById('pdfError');
  if (errorEl) {
    errorEl.style.display = 'flex';
    const errorText = errorEl.querySelector('p');
    if (errorText) {
      errorText.textContent = message;
    }
  }
}

function waitForPDFJS() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100;
    
    const checkPDFJS = () => {
      attempts++;
      
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.getDocument) {
        resolve();
      } else if (attempts >= maxAttempts) {
        console.error('PDF.js failed to load after maximum attempts');
        reject(new Error('PDF.js library failed to load. Please check your internet connection and try refreshing the page.'));
      } else {
        setTimeout(checkPDFJS, 50);
      }
    };
    
    checkPDFJS();
  });
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Re-render current page to adjust to new container size
    const canvas = document.getElementById('pdfCanvas');
    if (canvas && window.pdfViewer) {
      window.pdfViewer.renderPage(window.pdfViewer.pageNum);
    }
  }, 250);
});

// Clean up expired cache on page load
window.addEventListener('load', () => {
  if (window.pdfViewer && window.pdfViewer.cache) {
    window.pdfViewer.cache.clearExpiredCache();
  }
});

// Clean up reading session on page unload
window.addEventListener('beforeunload', () => {
  if (window.pdfViewer && window.pdfViewer.cleanup) {
    window.pdfViewer.cleanup();
  }
});

// Example of how to change transition settings programmatically (Option 2)
// You can now easily change the transition type and timing from anywhere in your code:

// Method 1: Change individual settings
function demonstrateTransitionChanges() {
  if (window.pdfViewer) {
    console.log('Demonstrating transition configuration changes:');
    
    // Change to slide transition with slower timing
    window.pdfViewer.configureTransitions({
      type: 'slide',
      duration: 800,
      enabled: true
    });
    
    console.log('Changed to slide transition (800ms)');
    
    // You can also change just one property at a time:
    setTimeout(() => {
      window.pdfViewer.configureTransitions({ type: 'flip' });
      console.log('Changed to flip transition');
    }, 3000);
    
    setTimeout(() => {
      window.pdfViewer.configureTransitions({ duration: 200 });
      console.log('Changed duration to 200ms');
    }, 6000);
    
    setTimeout(() => {
      window.pdfViewer.configureTransitions({ type: 'none' });
      console.log('Disabled transitions');
    }, 9000);
    
    setTimeout(() => {
      // Reset to centralized defaults
      window.pdfViewer.configureTransitions({
        type: window.pdfViewer.TRANSITION_CONFIG.DEFAULTS.type,
        duration: window.pdfViewer.TRANSITION_CONFIG.DEFAULTS.duration,
        enabled: window.pdfViewer.TRANSITION_CONFIG.DEFAULTS.enabled
      });
      console.log('Reset to centralized defaults');
    }, 12000);
  }
}

// Uncomment the line below to see the demonstration in action:
// setTimeout(demonstrateTransitionChanges, 5000); // Run 5 seconds after page load

// Temporary function to reset preferences (no longer needed for transition settings)
// Transition settings are now hardcoded and don't use localStorage
function resetPreferencesToDefaults() {
  console.log('Resetting preferences (excluding transitions - they are hardcoded now)...');
  
  // Clear all reading preferences
  localStorage.removeItem('bibliotech_reader_prefs_global_general');
  
  // Clear book-specific preferences
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('bibliotech_reader_prefs_')) {
      localStorage.removeItem(key);
      console.log('Cleared:', key);
    }
  });
  
  console.log('Preferences cleared! Reloading page...');
  location.reload();
}

// TEMPORARY: Automatically reset preferences on first load to test new defaults
// Uncomment the line below to clear stored preferences and use new defaults:
// resetPreferencesToDefaults();
