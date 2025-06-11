/**
 * PDF Search & Find Functionality
 * Implements text search with highlighting, navigation, and session-based history
 */
export class PDFSearch {
  constructor(pdfDocument, pdfViewer) {
    this.pdfDoc = pdfDocument;
    this.pdfViewer = pdfViewer;
    this.textContent = new Map(); // Cache extracted text by page
    this.searchResults = [];
    this.currentResultIndex = -1;
    this.currentQuery = '';
    this.caseSensitive = false;
    this.wholeWords = false;
    this.useRegex = false;
    this.searchHistory = JSON.parse(sessionStorage.getItem('pdf_search_history') || '[]');
    
    // UI elements
    this.searchContainer = null;
    this.searchInput = null;
    this.searchResultsContainer = null;
    this.searchInfo = null;
    
    this.init();
  }

  init() {
    this.createSearchUI();
    this.setupEventListeners();
    this.extractAllText();
  }

  createSearchUI() {
    // Check if search UI already exists
    if (document.getElementById('pdfSearchContainer')) {
      this.searchContainer = document.getElementById('pdfSearchContainer');
      this.updateUIReferences();
      return;
    }

    // Create search container
    const searchHTML = `
      <div id="pdfSearchContainer" class="pdf-search-container" style="display: none;">
        <div class="search-header">
          <div class="search-input-group">
            <input type="text" id="searchInput" class="search-input" placeholder="Buscar no documento..." />
            <button id="searchClear" class="search-clear-btn" title="Limpar busca">×</button>
          </div>
          <div class="search-controls">
            <button id="searchOptionsBtn" class="search-btn" title="Opções de busca">⚙️</button>
            <button id="searchPrev" class="search-btn" title="Resultado anterior" disabled>↑</button>
            <button id="searchNext" class="search-btn" title="Próximo resultado" disabled>↓</button>
            <button id="searchClose" class="search-btn" title="Fechar busca">×</button>
          </div>
        </div>
        
        <div id="searchOptionsPanel" class="search-options" style="display: none;">
          <label class="search-option">
            <input type="checkbox" id="caseSensitive" />
            <span>Maiúsculas/minúsculas</span>
          </label>
          <label class="search-option">
            <input type="checkbox" id="wholeWords" />
            <span>Palavras inteiras</span>
          </label>
          <label class="search-option">
            <input type="checkbox" id="useRegex" />
            <span>Expressão regular</span>
          </label>
        </div>
        
        <div id="searchInfo" class="search-info">
          <span id="searchResults">0 resultados</span>
          <span id="searchStatus"></span>
        </div>
        
        <div id="searchHistory" class="search-history" style="display: none;">
          <h4>Buscas recentes:</h4>
          <div id="searchHistoryList" class="search-history-list"></div>
        </div>
        
        <div id="searchResultsList" class="search-results-list" style="display: none;">
        </div>
      </div>
    `;

    // Insert search UI into the PDF reader
    const pdfReader = document.querySelector('.pdf-reader');
    if (pdfReader) {
      pdfReader.insertAdjacentHTML('afterbegin', searchHTML);
      this.updateUIReferences();
    }
  }

  updateUIReferences() {
    this.searchContainer = document.getElementById('pdfSearchContainer');
    this.searchInput = document.getElementById('searchInput');
    this.searchResultsContainer = document.getElementById('searchResultsList');
    this.searchInfo = document.getElementById('searchInfo');
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.debounceSearch(e.target.value);
      });
      
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) {
            this.goToPreviousResult();
          } else {
            this.goToNextResult();
          }
        } else if (e.key === 'Escape') {
          this.closeSearch();
        }
      });
    }

    // Search controls
    document.getElementById('searchClear')?.addEventListener('click', () => this.clearSearch());
    document.getElementById('searchPrev')?.addEventListener('click', () => this.goToPreviousResult());
    document.getElementById('searchNext')?.addEventListener('click', () => this.goToNextResult());
    document.getElementById('searchClose')?.addEventListener('click', () => this.closeSearch());
    
    // Search options
    document.getElementById('searchOptionsBtn')?.addEventListener('click', () => this.toggleSearchOptions());
    document.getElementById('caseSensitive')?.addEventListener('change', (e) => {
      this.caseSensitive = e.target.checked;
      this.performSearch(this.currentQuery);
    });
    document.getElementById('wholeWords')?.addEventListener('change', (e) => {
      this.wholeWords = e.target.checked;
      this.performSearch(this.currentQuery);
    });
    document.getElementById('useRegex')?.addEventListener('change', (e) => {
      this.useRegex = e.target.checked;
      this.performSearch(this.currentQuery);
    });

    // Global keyboard shortcut for search
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        this.openSearch();
      }
    });
  }

  async extractAllText() {
    if (!this.pdfDoc) return;

    try {
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
        const page = await this.pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items with proper spacing
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        this.textContent.set(pageNum, {
          text: pageText,
          items: textContent.items
        });
      }
      
      console.log(`PDF Search - Extracted text from ${this.pdfDoc.numPages} pages`);
    } catch (error) {
      console.error('Error extracting text for search:', error);
    }
  }

  openSearch() {
    if (this.searchContainer) {
      this.searchContainer.style.display = 'block';
      this.searchInput?.focus();
      this.loadSearchHistory();
    }
  }

  closeSearch() {
    if (this.searchContainer) {
      this.searchContainer.style.display = 'none';
      this.clearHighlights();
    }
  }

  toggleSearchOptions() {
    const optionsEl = document.getElementById('searchOptionsPanel');
    if (optionsEl) {
      const isVisible = optionsEl.style.display !== 'none';
      optionsEl.style.display = isVisible ? 'none' : 'block';
    }
  }

  debounceSearch(query) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  async performSearch(query) {
    if (!query.trim()) {
      this.clearSearch();
      return;
    }

    this.currentQuery = query;
    this.searchResults = [];
    this.currentResultIndex = -1;

    try {
      let searchPattern;
      
      if (this.useRegex) {
        try {
          searchPattern = new RegExp(query, this.caseSensitive ? 'g' : 'gi');
        } catch (e) {
          this.showSearchError('Expressão regular inválida');
          return;
        }
      } else {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = this.wholeWords ? `\\b${escapedQuery}\\b` : escapedQuery;
        searchPattern = new RegExp(pattern, this.caseSensitive ? 'g' : 'gi');
      }

      // Search through all pages
      for (const [pageNum, pageData] of this.textContent) {
        const matches = [...pageData.text.matchAll(searchPattern)];
        
        matches.forEach(match => {
          this.searchResults.push({
            page: pageNum,
            text: match[0],
            index: match.index,
            context: this.getSearchContext(pageData.text, match.index, match[0].length)
          });
        });
      }

      this.updateSearchInfo();
      this.renderSearchResults();
      
      if (this.searchResults.length > 0) {
        this.goToResult(0);
        this.addToSearchHistory(query);
      }

    } catch (error) {
      console.error('Search error:', error);
      this.showSearchError('Erro na busca');
    }
  }

  getSearchContext(text, index, length, contextSize = 50) {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(text.length, index + length + contextSize);
    
    const before = text.substring(start, index);
    const match = text.substring(index, index + length);
    const after = text.substring(index + length, end);
    
    return {
      before: before,
      match: match,
      after: after,
      fullContext: text.substring(start, end)
    };
  }

  goToResult(index) {
    if (index < 0 || index >= this.searchResults.length) return;
    
    this.currentResultIndex = index;
    const result = this.searchResults[index];
    
    // Navigate to the page containing the result
    this.pdfViewer.goToPage(result.page);
    
    // Update UI
    this.updateSearchInfo();
    this.highlightCurrentResult();
  }

  goToNextResult() {
    if (this.searchResults.length === 0) return;
    
    const nextIndex = (this.currentResultIndex + 1) % this.searchResults.length;
    this.goToResult(nextIndex);
  }

  goToPreviousResult() {
    if (this.searchResults.length === 0) return;
    
    const prevIndex = this.currentResultIndex <= 0 ? 
      this.searchResults.length - 1 : this.currentResultIndex - 1;
    this.goToResult(prevIndex);
  }

  highlightCurrentResult() {
    // This would be implemented with canvas overlay or PDF annotation
    // For now, we'll just update the visual indicator
    this.updateResultHighlight();
  }

  updateResultHighlight() {
    // Remove existing highlights
    const existingHighlights = document.querySelectorAll('.search-highlight');
    existingHighlights.forEach(el => el.remove());
    
    if (this.currentResultIndex >= 0 && this.searchResults.length > 0) {
      // Add visual indicator (this would be enhanced with actual PDF highlighting)
      const result = this.searchResults[this.currentResultIndex];
      console.log(`Highlighting result ${this.currentResultIndex + 1}: "${result.text}" on page ${result.page}`);
    }
  }

  clearHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(el => el.remove());
  }

  clearSearch() {
    this.searchResults = [];
    this.currentResultIndex = -1;
    this.currentQuery = '';
    
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    
    this.clearHighlights();
    this.updateSearchInfo();
    this.clearSearchResults();
  }

  updateSearchInfo() {
    const resultsEl = document.getElementById('searchResults');
    
    if (resultsEl) {
      if (this.searchResults.length === 0) {
        resultsEl.textContent = this.currentQuery ? 'Nenhum resultado' : '0 resultados';
      } else {
        resultsEl.textContent = `${this.currentResultIndex + 1} de ${this.searchResults.length} resultados`;
      }
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('searchPrev');
    const nextBtn = document.getElementById('searchNext');
    
    const hasResults = this.searchResults.length > 0;
    if (prevBtn) prevBtn.disabled = !hasResults;
    if (nextBtn) nextBtn.disabled = !hasResults;
  }

  renderSearchResults() {
    if (!this.searchResultsContainer) return;
    
    this.searchResultsContainer.innerHTML = '';
    
    if (this.searchResults.length === 0) {
      this.searchResultsContainer.style.display = 'none';
      return;
    }
    
    // Show results list
    this.searchResultsContainer.style.display = 'block';
    
    // Group results by page
    const resultsByPage = new Map();
    this.searchResults.forEach((result, index) => {
      if (!resultsByPage.has(result.page)) {
        resultsByPage.set(result.page, []);
      }
      resultsByPage.get(result.page).push({ ...result, resultIndex: index });
    });
    
    // Render grouped results
    resultsByPage.forEach((pageResults, pageNum) => {
      const pageHeader = document.createElement('div');
      pageHeader.className = 'search-page-header';
      pageHeader.textContent = `Página ${pageNum} (${pageResults.length} resultado${pageResults.length > 1 ? 's' : ''})`;
      this.searchResultsContainer.appendChild(pageHeader);
      
      pageResults.forEach(result => {
        const resultEl = document.createElement('div');
        resultEl.className = 'search-result-item';
        resultEl.innerHTML = `
          <div class="search-result-context">
            ${result.context.before}<mark>${result.context.match}</mark>${result.context.after}
          </div>
        `;
        
        resultEl.addEventListener('click', () => {
          this.goToResult(result.resultIndex);
        });
        
        this.searchResultsContainer.appendChild(resultEl);
      });
    });
  }

  clearSearchResults() {
    if (this.searchResultsContainer) {
      this.searchResultsContainer.innerHTML = '';
      this.searchResultsContainer.style.display = 'none';
    }
  }

  addToSearchHistory(query) {
    if (!query.trim()) return;
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(item => item !== query);
    
    // Add to beginning
    this.searchHistory.unshift(query);
    
    // Keep only last 10 searches
    this.searchHistory = this.searchHistory.slice(0, 10);
    
    // Save to session storage
    sessionStorage.setItem('pdf_search_history', JSON.stringify(this.searchHistory));
  }

  loadSearchHistory() {
    const historyContainer = document.getElementById('searchHistoryList');
    if (!historyContainer || this.searchHistory.length === 0) return;
    
    historyContainer.innerHTML = '';
    
    this.searchHistory.forEach(query => {
      const historyItem = document.createElement('div');
      historyItem.className = 'search-history-item';
      historyItem.textContent = query;
      
      historyItem.addEventListener('click', () => {
        if (this.searchInput) {
          this.searchInput.value = query;
          this.performSearch(query);
        }
      });
      
      historyContainer.appendChild(historyItem);
    });
    
    const historyEl = document.getElementById('searchHistory');
    if (historyEl) {
      historyEl.style.display = this.searchHistory.length > 0 ? 'block' : 'none';
    }
  }

  showSearchError(message) {
    const statusEl = document.getElementById('searchStatus');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = 'var(--error-color)';
      
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.style.color = '';
      }, 3000);
    }
  }

  // Public API methods
  getSearchResults() {
    return this.searchResults;
  }

  getCurrentResult() {
    return this.currentResultIndex >= 0 ? this.searchResults[this.currentResultIndex] : null;
  }

  getSearchStats() {
    return {
      totalResults: this.searchResults.length,
      currentIndex: this.currentResultIndex,
      query: this.currentQuery,
      options: {
        caseSensitive: this.caseSensitive,
        wholeWords: this.wholeWords,
        useRegex: this.useRegex
      }
    };
  }

  // Cleanup
  cleanup() {
    clearTimeout(this.searchTimeout);
    this.clearHighlights();
    
    // Save search history
    if (this.searchHistory.length > 0) {
      sessionStorage.setItem('pdf_search_history', JSON.stringify(this.searchHistory));
    }
  }
} 