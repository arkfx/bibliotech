/**
 * Database-backed Reading Session Management
 * Handles session-based progress tracking using the database API
 * Keeps localStorage for non-critical data like UI preferences
 */
import { saveReadingProgress, getReadingProgress } from '../api/reading-progress.js';

export class ReadingSessionDB {
  constructor(bookId, userId) {
    this.bookId = bookId;
    this.userId = userId;
    
    // Session data
    this.currentPage = 1;
    this.totalPages = 1;
    this.progressPercentage = 0;
    
    // Progress elements
    this.progressBarEl = null;
    this.progressTextEl = null;
    
    // Auto-save settings
    this.saveInterval = null;
    this.lastSaveTime = 0;
    this.saveDebounceMs = 2000; // Save every 2 seconds max
    
    this.init();
  }

  async init() {
    this.createProgressElements();
    await this.loadSavedPosition();
    this.setupEventListeners();
  }

  createProgressElements() {
    const pageInfoEl = document.getElementById('pageInfo');
    if (!pageInfoEl) return;

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

    // Add continue reading button in the sidebar instead of after controls
    let continueSection = document.querySelector('.continue-reading');
    if (!continueSection) {
      // Look for the book sidebar or create one in an appropriate location
      const bookSidebar = document.querySelector('.book-sidebar .book-info') || 
                          document.querySelector('.reading-progress') ||
                          document.querySelector('.book-sidebar');
      
      if (bookSidebar) {
        continueSection = document.createElement('div');
        continueSection.className = 'continue-reading';
        continueSection.innerHTML = `
          <div id="continueReading" style="display: none;">
            <button class="btn-continue" id="btnContinue">
              📖 Continuar da página <span id="resumePageNum">1</span>
            </button>
          </div>
        `;
        
        // Insert in the sidebar after the book info
        bookSidebar.appendChild(continueSection);
      }
    }

    // Update element references
    this.progressBarEl = document.getElementById('progressFill');
    this.progressTextEl = document.getElementById('progressPercentage');
  }

  async loadSavedPosition() {
    try {
      const progress = await getReadingProgress(this.bookId);
      if (progress) {
        this.currentPage = progress.current_page;
        this.totalPages = progress.total_pages;
        this.progressPercentage = progress.progress_percentage;
        this.showContinueOption(progress);
        
        // Also check localStorage for fallback (migration support)
        this.migrateFromLocalStorage();
      } else {
        // Check localStorage for existing data to migrate
        this.migrateFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading saved reading position:', error);
      // Fallback to localStorage
      this.migrateFromLocalStorage();
    }
  }

  migrateFromLocalStorage() {
    const positionKey = `reading_position_${this.bookId}_${this.userId}`;
    const savedPosition = localStorage.getItem(positionKey);
    
    if (savedPosition) {
      try {
        const position = JSON.parse(savedPosition);
        if (position.page && position.page > this.currentPage) {
          this.currentPage = position.page;
          this.totalPages = position.totalPages || this.totalPages;
          this.progressPercentage = position.progress || 0;
          
          // Save to database for future use
          this.saveProgressToDatabase(false); // Don't debounce initial migration
          
          // Clean up localStorage after migration
          localStorage.removeItem(positionKey);
          console.log('Migrated reading progress from localStorage to database');
        }
      } catch (error) {
        console.error('Error migrating from localStorage:', error);
      }
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

    // Auto-save progress every 10 seconds
    this.saveInterval = setInterval(() => {
      this.saveProgressToDatabase();
    }, 10000);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveProgressToDatabase(false); // Force immediate save
    });

    // Save on visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveProgressToDatabase(false); // Force immediate save when leaving
      }
    });
  }

  updateProgress(currentPage, totalPages) {
    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.progressPercentage = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

    // Update UI elements
    this.updateProgressUI();

    // Save to database (debounced)
    this.saveProgressToDatabase();
  }

  updateProgressUI() {
    // Update progress bar
    if (this.progressBarEl) {
      this.progressBarEl.style.width = `${this.progressPercentage}%`;
    }

    // Update progress text
    if (this.progressTextEl) {
      this.progressTextEl.textContent = `${Math.round(this.progressPercentage)}%`;
    }

    // Update page information
    const currentPageEl = document.getElementById('currentPageDisplay');
    const totalPagesEl = document.getElementById('totalPagesDisplay');

    if (currentPageEl) currentPageEl.textContent = this.currentPage;
    if (totalPagesEl) totalPagesEl.textContent = this.totalPages;
  }

  async saveProgressToDatabase(debounce = true) {
    const now = Date.now();
    
    // Debounce saves to avoid too many API calls
    if (debounce && (now - this.lastSaveTime) < this.saveDebounceMs) {
      return;
    }
    
    this.lastSaveTime = now;

    try {
      await saveReadingProgress(
        this.bookId,
        this.currentPage,
        this.totalPages,
        this.progressPercentage
      );
      
      console.log(`Reading progress saved: Page ${this.currentPage}/${this.totalPages} (${Math.round(this.progressPercentage)}%)`);
    } catch (error) {
      console.error('Error saving reading progress to database:', error);
      
      // Fallback to localStorage if database save fails
      this.saveToLocalStorageFallback();
    }
  }

  saveToLocalStorageFallback() {
    const positionKey = `reading_position_${this.bookId}_${this.userId}`;
    const position = {
      page: this.currentPage,
      timestamp: Date.now(),
      progress: this.progressPercentage,
      totalPages: this.totalPages
    };

    localStorage.setItem(positionKey, JSON.stringify(position));
  }

  showContinueOption(progress) {
    console.log('Showing continue option for progress:', progress);
    
    // Check if user came directly to a specific page (via "Continue Reading" from library)
    const urlParams = new URLSearchParams(window.location.search);
    const targetPageFromUrl = urlParams.get('page');
    
    // Don't show continue button if:
    // 1. User came directly to a specific page via URL
    // 2. Or if they're already on or past the saved page
    const shouldShowButton = progress.current_page > 1 && 
                            !targetPageFromUrl && 
                            (!window.pdfViewer || window.pdfViewer.pageNum < progress.current_page);
    
    const continueReading = document.getElementById('continueReading');
    if (continueReading && shouldShowButton) {
      continueReading.style.display = 'block';
      const resumePageNum = document.getElementById('resumePageNum');
      if (resumePageNum) {
        resumePageNum.textContent = progress.current_page;
      }
      
      // Store resume page for later use
      this.resumePage = progress.current_page;
      console.log('Resume page set to:', this.resumePage);
    } else {
      console.log('Not showing continue option - conditions not met:', {
        hasElement: !!continueReading,
        currentPage: progress.current_page,
        targetPageFromUrl: targetPageFromUrl,
        shouldShow: shouldShowButton
      });
      
      // Hide the button if it exists
      if (continueReading) {
        continueReading.style.display = 'none';
      }
    }
  }

  continueReading() {
    console.log('Continue reading clicked, resumePage:', this.resumePage, 'pdfViewer:', !!window.pdfViewer);
    
    if (this.resumePage && window.pdfViewer) {
      console.log(`Navigating to page ${this.resumePage}`);
      window.pdfViewer.goToPage(this.resumePage);
      
      // Hide continue button after use
      const continueReading = document.getElementById('continueReading');
      if (continueReading) {
        continueReading.style.display = 'none';
      }
    } else {
      console.warn('Cannot continue reading - missing resumePage or pdfViewer:', {
        resumePage: this.resumePage,
        pdfViewer: !!window.pdfViewer
      });
      
      // If we have the page but not the pdfViewer yet, wait a bit and try again
      if (this.resumePage && !window.pdfViewer) {
        setTimeout(() => {
          if (window.pdfViewer) {
            console.log('Retrying navigation after delay');
            window.pdfViewer.goToPage(this.resumePage);
            
            const continueReading = document.getElementById('continueReading');
            if (continueReading) {
              continueReading.style.display = 'none';
            }
          }
        }, 1000);
      }
    }
  }

  // Get current progress for external use
  getCurrentProgress() {
    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      progressPercentage: this.progressPercentage
    };
  }

  // Clean up when reader is closed
  cleanup() {
    // Clear auto-save interval
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    // Force final save
    this.saveProgressToDatabase(false);
  }
} 