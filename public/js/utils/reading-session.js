/**
 * Reading Session Management
 * Handles session-based progress tracking, reading time, and position storage
 */
export class ReadingSession {
  constructor(bookId, userId) {
    this.bookId = bookId;
    this.userId = userId;
    this.positionKey = `reading_position_${bookId}_${userId}`;
    
    // Session data
    this.currentPage = 1;
    this.totalPages = 1;
    
    // Progress elements
    this.progressBarEl = null;
    this.progressTextEl = null;
    
    this.init();
  }

  init() {
    this.createProgressElements();
    this.loadSavedPosition();
    this.setupEventListeners();
  }

  createProgressElements() {
    const pageInfoEl = document.getElementById('pageInfo');
    if (!pageInfoEl) return;

    // Get the parent container to add continue reading button
    const readerControls = document.querySelector('.reader-controls');
    
    // Transform the existing pageInfo span into a progress-enabled display
    pageInfoEl.innerHTML = `
      <div class="page-info-with-progress">
        <div class="progress-row">
          <div class="progress-bar-inline">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <span class="progress-percentage" id="progressPercentage">0%</span>
        </div>
        <span class="page-text">Página: <span id="currentPageDisplay">1</span> de <span id="totalPagesDisplay">1</span></span>
      </div>
    `;

    // Add continue reading button after reader controls if it doesn't exist
    let continueSection = document.querySelector('.continue-reading-inline');
    if (!continueSection && readerControls) {
      continueSection = document.createElement('div');
      continueSection.className = 'continue-reading-inline';
      continueSection.innerHTML = `
        <div id="continueReading" style="display: none;">
          <button class="btn-continue-inline" id="btnContinue">
            📖 Continuar da página <span id="resumePageNum">1</span>
          </button>
        </div>
      `;
      
      // Insert after reader controls
      readerControls.parentNode.insertBefore(continueSection, readerControls.nextSibling);
    }

    // Update element references
    this.progressBarEl = document.getElementById('progressFill');
    this.progressTextEl = document.getElementById('progressPercentage');
  }

  loadSavedPosition() {
    // Load saved reading position
    const savedPosition = localStorage.getItem(this.positionKey);
    if (savedPosition) {
      const position = JSON.parse(savedPosition);
      this.currentPage = position.page || 1;
      this.showContinueOption(position);
    }
  }

  setupEventListeners() {
    // Continue reading button
    const continueBtn = document.getElementById('btnContinue');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.continueReading();
      });
    }

    // Auto-save position every 10 seconds (more frequent)
    setInterval(() => {
      this.saveReadingPosition();
    }, 10000);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveReadingPosition();
    });

    // Handle visibility change (minimal tracking)
    document.addEventListener('visibilitychange', () => {
      // Could add minimal activity tracking here if needed
    });
  }

  updateProgress(currentPage, totalPages) {
    this.currentPage = currentPage;
    this.totalPages = totalPages;

    // Calculate progress percentage
    const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

    // Update progress bar
    if (this.progressBarEl) {
      this.progressBarEl.style.width = `${progress}%`;
    }

    // Update progress text
    if (this.progressTextEl) {
      this.progressTextEl.textContent = `${Math.round(progress)}%`;
    }

    // Update page information
    const currentPageEl = document.getElementById('currentPageDisplay');
    const totalPagesEl = document.getElementById('totalPagesDisplay');

    if (currentPageEl) currentPageEl.textContent = currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;

    // Auto-save position on page change
    this.saveReadingPosition();
  }

  // Removed: All reading time tracking methods

  showContinueOption(position) {
    const continueReading = document.getElementById('continueReading');
    if (continueReading && position.page > 1) {
      continueReading.style.display = 'block';
      const resumePageNum = document.getElementById('resumePageNum');
      if (resumePageNum) {
        resumePageNum.textContent = position.page;
      }
      
      // Store resume page for later use
      this.resumePage = position.page;
    }
  }

  continueReading() {
    if (this.resumePage && window.pdfViewer) {
      window.pdfViewer.goToPage(this.resumePage);
      
      // Hide continue button after use
      const continueReading = document.getElementById('continueReading');
      if (continueReading) {
        continueReading.style.display = 'none';
      }
    }
  }

  saveReadingPosition() {
    const position = {
      page: this.currentPage,
      timestamp: Date.now(),
      progress: this.totalPages > 0 ? (this.currentPage / this.totalPages) * 100 : 0,
      totalPages: this.totalPages
    };

    localStorage.setItem(this.positionKey, JSON.stringify(position));
  }

  // Clean up (save final position)
  cleanup() {
    this.saveReadingPosition();
  }
} 