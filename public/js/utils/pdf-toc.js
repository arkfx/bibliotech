/**
 * PDF Table of Contents and Navigation
 * Handles PDF outline extraction, TOC display, thumbnails, and navigation
 */
export class PDFTableOfContents {
  constructor(pdfDocument, pdfViewer) {
    this.pdfDoc = pdfDocument;
    this.pdfViewer = pdfViewer;
    this.outline = null;
    this.thumbnails = new Map();
    this.isVisible = false;
    this.isExpanded = false; // Track expand/collapse state
    
    // UI elements
    this.tocContainer = null;
    this.thumbnailContainer = null;
    this.pageJumpInput = null;
    this.toggleButton = null;
    
    // this.init();
    //INITIALIZE TOC AFTER PDF IS LOADED
  }

  async init() {
    this.createTOCElements();
    await this.extractOutline();
    await this.generateThumbnails();
    this.setupEventListeners();
  }

  createTOCElements() {
    // Create TOC panel in sidebar
    const sidebar = document.querySelector('.book-sidebar');
    if (!sidebar) return;

    // Create TOC section
    const tocSection = document.createElement('div');
    tocSection.className = 'toc-section';
    tocSection.innerHTML = `
      <div class="toc-header">
        <h3>Navegação</h3>
        <div class="toc-controls">
          <button id="btnTOC" class="toc-btn active" title="Sumário">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
          <button id="btnThumbnails" class="toc-btn" title="Miniaturas">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button id="btnPageJump" class="toc-btn" title="Ir para página">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Table of Contents -->
      <div id="tocContent" class="toc-content active">
        <div class="toc-controls-header">
          <button id="toggleExpandCollapse" class="toc-expand-collapse-btn" title="Expandir/Recolher tudo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="7,13 12,18 17,13"></polyline>
              <polyline points="7,6 12,11 17,6"></polyline>
            </svg>
          </button>
        </div>
        <div class="toc-outline" id="tocOutline">
          <p class="toc-loading">Carregando sumário...</p>
        </div>
      </div>

      <!-- Thumbnails View -->
      <div id="thumbnailContent" class="toc-content">
        <div class="thumbnail-grid" id="thumbnailGrid">
          <p class="toc-loading">Gerando miniaturas...</p>
        </div>
      </div>

      <!-- Page Jump -->
      <div id="pageJumpContent" class="toc-content">
        <div class="page-jump">
          <label for="pageJumpInput">Ir para página:</label>
          <div class="page-jump-controls">
            <input type="number" id="pageJumpInput" min="1" placeholder="Número da página">
            <button id="btnGoToPage" class="btn-go">Ir</button>
          </div>
          <p class="page-jump-info">
            Total de páginas: <span id="totalPagesInfo">-</span>
          </p>
        </div>
      </div>
    `;

    sidebar.appendChild(tocSection);

    // Update element references
    this.tocContainer = document.getElementById('tocOutline');
    this.thumbnailContainer = document.getElementById('thumbnailGrid');
    this.pageJumpInput = document.getElementById('pageJumpInput');
    this.toggleButton = document.getElementById('toggleExpandCollapse');
  }

  async extractOutline() {
    try {
      this.outline = await this.pdfDoc.getOutline();
      this.renderOutline();
    } catch (error) {
      console.log('No outline available in PDF:', error);
      this.renderNoOutline();
    }
  }

  renderOutline() {
    if (!this.tocContainer) return;

    const tocContent = document.getElementById('tocContent');
    const controlsHeader = tocContent?.querySelector('.toc-controls-header');

    if (!this.outline || this.outline.length === 0) {
      this.renderNoOutline();
      // Hide controls header when no outline
      if (controlsHeader) {
        controlsHeader.style.display = 'none';
      }
      return;
    }

    // Show controls header when outline exists
    if (controlsHeader) {
      controlsHeader.style.display = 'flex';
    }

    const tocList = this.createOutlineList(this.outline);
    this.tocContainer.innerHTML = '';
    this.tocContainer.appendChild(tocList);
  }

  renderNoOutline() {
    if (!this.tocContainer) return;
    
    this.tocContainer.innerHTML = `
      <div class="toc-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <p>Este PDF não possui sumário</p>
      </div>
    `;
  }

  createOutlineList(outline, level = 0) {
    const ul = document.createElement('ul');
    ul.className = `toc-list level-${level}`;

    outline.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'toc-item';
      
      const hasChildren = item.items && item.items.length > 0;
      if (hasChildren) {
        li.classList.add('has-children');
      }

      // Create container for the item content
      const itemContainer = document.createElement('div');
      itemContainer.className = 'toc-item-container';
      itemContainer.style.paddingLeft = `${level * 16 + 8}px`;

      // Add expand/collapse icon if has children
      if (hasChildren) {
        const expandIcon = document.createElement('span');
        expandIcon.className = 'toc-expand-icon';
        expandIcon.innerHTML = '▶'; // Right arrow for collapsed
        expandIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleExpand(li, expandIcon);
        });
        itemContainer.appendChild(expandIcon);
      } else {
        // Add spacer for items without children to align text
        const spacer = document.createElement('span');
        spacer.className = 'toc-spacer';
        itemContainer.appendChild(spacer);
      }

      // Create the clickable link
      const link = document.createElement('a');
      link.className = 'toc-link';
      link.textContent = item.title;
      
      // Add click handler for navigation
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToDestination(item.dest);
      });

      itemContainer.appendChild(link);
      li.appendChild(itemContainer);

      // Add nested items if they exist
      if (hasChildren) {
        const nestedList = this.createOutlineList(item.items, level + 1);
        nestedList.className += ' toc-nested collapsed'; // Start collapsed
        li.appendChild(nestedList);
      }

      ul.appendChild(li);
    });

    return ul;
  }

  toggleExpand(listItem, expandIcon) {
    const nestedList = listItem.querySelector('.toc-nested');
    if (!nestedList) return;

    const isCollapsed = nestedList.classList.contains('collapsed');
    
    if (isCollapsed) {
      // Expand
      nestedList.classList.remove('collapsed');
      expandIcon.innerHTML = '▼'; // Down arrow for expanded
      expandIcon.classList.add('expanded');
    } else {
      // Collapse
      nestedList.classList.add('collapsed');
      expandIcon.innerHTML = '▶'; // Right arrow for collapsed
      expandIcon.classList.remove('expanded');
    }

    // Update global state based on current items
    this.checkAndUpdateGlobalState();
  }

  checkAndUpdateGlobalState() {
    const allNestedLists = document.querySelectorAll('.toc-nested');
    if (allNestedLists.length === 0) return;

    const collapsedLists = document.querySelectorAll('.toc-nested.collapsed');
    
    if (collapsedLists.length === allNestedLists.length) {
      // All are collapsed
      this.isExpanded = false;
    } else if (collapsedLists.length === 0) {
      // All are expanded
      this.isExpanded = true;
    }
    // If some are expanded and some collapsed, keep current state
    
    this.updateToggleButtonState();
  }

  async navigateToDestination(dest) {
    try {
      if (!dest) return;

      let pageNumber;
      
      if (Array.isArray(dest)) {
        // Direct destination array
        const ref = dest[0];
        pageNumber = await this.pdfDoc.getPageIndex(ref) + 1;
      } else if (typeof dest === 'string') {
        // Named destination
        const destinations = await this.pdfDoc.getDestinations();
        if (destinations[dest]) {
          const ref = destinations[dest][0];
          pageNumber = await this.pdfDoc.getPageIndex(ref) + 1;
        }
      }

      if (pageNumber && this.pdfViewer) {
        this.pdfViewer.goToPage(pageNumber);
      }
    } catch (error) {
      console.error('Error navigating to destination:', error);
    }
  }

  async generateThumbnails() {
    if (!this.thumbnailContainer || !this.pdfDoc) return;

    const totalPages = this.pdfDoc.numPages;
    const thumbnailsPerBatch = 5;
    
    this.thumbnailContainer.innerHTML = '<p class="toc-loading">Gerando miniaturas...</p>';

    // Generate thumbnails in batches for better performance
    for (let i = 1; i <= totalPages; i += thumbnailsPerBatch) {
      const batchEnd = Math.min(i + thumbnailsPerBatch - 1, totalPages);
      await this.generateThumbnailBatch(i, batchEnd);
      
      // Small delay to prevent blocking UI
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.renderThumbnails();
  }

  async generateThumbnailBatch(startPage, endPage) {
    const promises = [];
    
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      promises.push(this.generateThumbnail(pageNum));
    }

    await Promise.all(promises);
  }

  async generateThumbnail(pageNum) {
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.2 }); // Small scale for thumbnail
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      // Store thumbnail
      this.thumbnails.set(pageNum, {
        canvas: canvas,
        width: viewport.width,
        height: viewport.height
      });

    } catch (error) {
      console.error(`Error generating thumbnail for page ${pageNum}:`, error);
    }
  }

  renderThumbnails() {
    if (!this.thumbnailContainer) return;

    this.thumbnailContainer.innerHTML = '';

    const totalPages = this.pdfDoc.numPages;
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const thumbnail = this.thumbnails.get(pageNum);
      
      const thumbnailEl = document.createElement('div');
      thumbnailEl.className = 'thumbnail-item';
      thumbnailEl.dataset.page = pageNum;

      if (thumbnail) {
        const img = document.createElement('img');
        img.src = thumbnail.canvas.toDataURL();
        img.alt = `Página ${pageNum}`;
        
        thumbnailEl.appendChild(img);
      } else {
        // Placeholder for failed thumbnails
        thumbnailEl.innerHTML = `
          <div class="thumbnail-placeholder">
            <span>${pageNum}</span>
          </div>
        `;
      }

      const label = document.createElement('div');
      label.className = 'thumbnail-label';
      label.textContent = pageNum;
      thumbnailEl.appendChild(label);

      // Add click handler
      thumbnailEl.addEventListener('click', () => {
        if (this.pdfViewer) {
          this.pdfViewer.goToPage(pageNum);
        }
      });

      this.thumbnailContainer.appendChild(thumbnailEl);
    }
  }

  setupEventListeners() {
    // TOC tab switching
    const tocBtn = document.getElementById('btnTOC');
    const thumbnailBtn = document.getElementById('btnThumbnails');
    const pageJumpBtn = document.getElementById('btnPageJump');

    const tocContent = document.getElementById('tocContent');
    const thumbnailContent = document.getElementById('thumbnailContent');
    const pageJumpContent = document.getElementById('pageJumpContent');

    if (tocBtn && tocContent) {
      tocBtn.addEventListener('click', () => {
        this.switchTab('toc', tocBtn, tocContent);
      });
    }

    if (thumbnailBtn && thumbnailContent) {
      thumbnailBtn.addEventListener('click', () => {
        this.switchTab('thumbnails', thumbnailBtn, thumbnailContent);
      });
    }

    if (pageJumpBtn && pageJumpContent) {
      pageJumpBtn.addEventListener('click', () => {
        this.switchTab('pageJump', pageJumpBtn, pageJumpContent);
      });
    }

    // Page jump functionality
    const goBtn = document.getElementById('btnGoToPage');
    const totalPagesInfo = document.getElementById('totalPagesInfo');
    
    if (totalPagesInfo && this.pdfDoc) {
      totalPagesInfo.textContent = this.pdfDoc.numPages;
    }

    if (this.pageJumpInput) {
      this.pageJumpInput.max = this.pdfDoc.numPages;
      
      this.pageJumpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.jumpToPage();
        }
      });
    }

    if (goBtn) {
      goBtn.addEventListener('click', () => {
        this.jumpToPage();
      });
    }

    // Toggle expand/collapse all button
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggleExpandCollapseAll();
      });
    }
  }

  switchTab(activeTab, activeBtn, activeContent) {
    // Remove active classes from all buttons and content
    document.querySelectorAll('.toc-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.toc-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected button and content
    activeBtn.classList.add('active');
    activeContent.classList.add('active');
  }

  jumpToPage() {
    if (!this.pageJumpInput || !this.pdfViewer) return;

    const pageNum = parseInt(this.pageJumpInput.value);
    const maxPages = this.pdfDoc.numPages;

    if (pageNum >= 1 && pageNum <= maxPages) {
      this.pdfViewer.goToPage(pageNum);
      this.pageJumpInput.value = ''; // Clear input after successful jump
    } else {
      // Show error feedback
      this.pageJumpInput.classList.add('error');
      setTimeout(() => {
        this.pageJumpInput.classList.remove('error');
      }, 1000);
    }
  }

  // Update current page indicator in thumbnails
  updateCurrentPage(pageNum) {
    // Remove previous active thumbnail
    document.querySelectorAll('.thumbnail-item.active').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to current page thumbnail
    const currentThumbnail = document.querySelector(`[data-page="${pageNum}"]`);
    if (currentThumbnail) {
      currentThumbnail.classList.add('active');
    }
  }

  toggleExpandCollapseAll() {
    if (this.isExpanded) {
      this.collapseAll();
    } else {
      this.expandAll();
    }
  }

  expandAll() {
    const nestedLists = document.querySelectorAll('.toc-nested.collapsed');
    const expandIcons = document.querySelectorAll('.toc-expand-icon');
    
    nestedLists.forEach(list => {
      list.classList.remove('collapsed');
    });
    
    expandIcons.forEach(icon => {
      icon.innerHTML = '▼';
      icon.classList.add('expanded');
    });

    this.isExpanded = true;
    this.updateToggleButtonState();
  }

  collapseAll() {
    const nestedLists = document.querySelectorAll('.toc-nested:not(.collapsed)');
    const expandIcons = document.querySelectorAll('.toc-expand-icon');
    
    nestedLists.forEach(list => {
      list.classList.add('collapsed');
    });
    
    expandIcons.forEach(icon => {
      icon.innerHTML = '▶';
      icon.classList.remove('expanded');
    });

    this.isExpanded = false;
    this.updateToggleButtonState();
  }

  updateToggleButtonState() {
    if (!this.toggleButton) return;

    const svg = this.toggleButton.querySelector('svg');
    if (!svg) return;

    if (this.isExpanded) {
      // Show collapse icon (arrows pointing up)
      svg.innerHTML = `
        <polyline points="17,11 12,6 7,11"></polyline>
        <polyline points="17,18 12,13 7,18"></polyline>
      `;
      this.toggleButton.title = "Recolher tudo";
      this.toggleButton.classList.add('active');
    } else {
      // Show expand icon (arrows pointing down)
      svg.innerHTML = `
        <polyline points="7,13 12,18 17,13"></polyline>
        <polyline points="7,6 12,11 17,6"></polyline>
      `;
      this.toggleButton.title = "Expandir tudo";
      this.toggleButton.classList.remove('active');
    }
  }

  // Clean up resources
  cleanup() {
    this.thumbnails.clear();
  }
} 