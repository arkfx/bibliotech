// PDF Viewer class with mobile and desktop support
// Handles PDF navigation, zoom, theme management, and touch gestures

import { PDFCache } from './pdf-cache.js';
import { ProgressTracker } from './progress-tracker.js';
import { PDFOperatorRenderer } from './pdf-renderer.js';

export class PDFViewer {
  constructor() {
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageCount = 0;
    this.scale = 1.2;
    this.canvas = document.getElementById('pdfCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.pageRendering = false;
    this.pageNumPending = null;
    this.currentPDFId = null;
    
    // Touch gesture properties
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.initialDistance = 0;
    this.initialScale = 1.2;
    this.lastTap = 0;
    this.isZooming = false;
    this.isSwiping = false;
    
    // Theme management
    this.currentTheme = localStorage.getItem('pdf-reader-theme') || 'light';
    this.isFullscreen = false;
    
    // Initialize components
    this.cache = new PDFCache();
    this.textRenderer = new PDFOperatorRenderer();
    
    // UI elements
    this.loadingEl = document.getElementById('pdfLoading');
    this.errorEl = document.getElementById('pdfError');
    this.controlsEl = document.getElementById('readerControls');
    this.containerEl = document.getElementById('pdfContainer');
    this.pageInfoEl = document.getElementById('pageInfo');
    this.zoomLevelEl = document.getElementById('zoomLevel');
    this.progressFillEl = document.getElementById('progressFill');
    this.progressTextEl = document.getElementById('progressText');
    
    // Mobile UI elements
    this.mobileControlsEl = document.getElementById('mobileControls');
    this.mobilePageInfoEl = document.getElementById('mobilePageInfo');
    this.mobileZoomLevelEl = document.getElementById('mobileZoomLevel');
    this.mobileSettingsPanelEl = document.getElementById('mobileSettingsPanel');
    
    this.setupEventListeners();
    this.initializeTheme();
    this.detectMobile();
  }

  setupEventListeners() {
    // Navigation controls
    document.getElementById('prevPage')?.addEventListener('click', () => this.prevPage());
    document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());
    
    // Zoom controls
    document.getElementById('zoomIn')?.addEventListener('click', () => this.zoomIn());
    document.getElementById('zoomOut')?.addEventListener('click', () => this.zoomOut());
    document.getElementById('fitWidth')?.addEventListener('click', () => this.fitToWidth());
    
    // Desktop theme and fullscreen controls
    const themeToggle = document.getElementById('themeToggle');
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.cycleTheme());
    }
    
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
    }
    
    // Mobile controls
    document.getElementById('mobilePrevPage')?.addEventListener('click', () => this.prevPage());
    document.getElementById('mobileNextPage')?.addEventListener('click', () => this.nextPage());
    document.getElementById('mobileSettings')?.addEventListener('click', () => this.toggleMobileSettings());
    document.getElementById('mobileTheme')?.addEventListener('click', () => this.cycleTheme());
    document.getElementById('closeSettings')?.addEventListener('click', () => this.closeMobileSettings());
    document.getElementById('mobileFullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    
    // Mobile zoom controls
    document.getElementById('mobileZoomIn')?.addEventListener('click', () => this.zoomIn());
    document.getElementById('mobileZoomOut')?.addEventListener('click', () => this.zoomOut());
    document.getElementById('mobileFitWidth')?.addEventListener('click', () => this.fitToWidth());
    
    // Theme selection buttons
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        this.setTheme(theme);
        this.updateThemeButtons();
      });
    });
    
    // Touch events for PDF canvas
    if (this.canvas) {
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleTouchStart(e);
      }, { passive: false });
      
      this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        this.handleTouchMove(e);
      }, { passive: false });
      
      this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleTouchEnd(e);
      }, { passive: false });
      
      // Double-tap to fit width
      this.canvas.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTap;
        if (tapLength < 500 && tapLength > 0) {
          this.fitToWidth();
        }
        this.lastTap = currentTime;
      });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          this.prevPage();
          break;
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          this.nextPage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          this.zoomIn();
          break;
        case '-':
          e.preventDefault();
          this.zoomOut();
          break;
        case '0':
          e.preventDefault();
          this.fitToWidth();
          break;
        case 'f':
        case 'F11':
          e.preventDefault();
          this.toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          this.cycleTheme();
          break;
        case 'Escape':
          if (this.isFullscreen) {
            this.toggleFullscreen();
          }
          if (this.mobileSettingsPanelEl?.classList.contains('show')) {
            this.closeMobileSettings();
          }
          break;
      }
    });
    
    // Orientation change handler
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  // Touch gesture methods
  handleTouchStart(e) {
    if (e.touches.length === 2) {
      this.isZooming = true;
      this.initialDistance = this.calculateDistance(e.touches[0], e.touches[1]);
      this.initialScale = this.scale;
    } else if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isSwiping = false;
    }
  }

  handleTouchMove(e) {
    if (this.isZooming && e.touches.length === 2) {
      const currentDistance = this.calculateDistance(e.touches[0], e.touches[1]);
      const scaleChange = currentDistance / this.initialDistance;
      const newScale = this.initialScale * scaleChange;
      
      this.scale = Math.min(Math.max(newScale, 0.25), 5.0);
      this.renderPage(this.pageNum);
      this.updateZoomDisplay();
      
    } else if (e.touches.length === 1 && !this.isZooming) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = Math.abs(touchX - this.touchStartX);
      const deltaY = Math.abs(touchY - this.touchStartY);
      
      if (deltaX > 20 && deltaX > deltaY * 2) {
        this.isSwiping = true;
        this.touchEndX = touchX;
        this.touchEndY = touchY;
      }
    }
  }

  handleTouchEnd(e) {
    if (this.isZooming) {
      this.isZooming = false;
      this.initialDistance = 0;
      this.initialScale = this.scale;
    } else if (this.isSwiping) {
      const deltaX = this.touchEndX - this.touchStartX;
      const threshold = 50;
      
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          this.prevPage();
        } else {
          this.nextPage();
        }
      }
      
      this.isSwiping = false;
    }
    
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
  }

  calculateDistance(touch1, touch2) {
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  // Theme management
  initializeTheme() {
    this.setTheme(this.currentTheme);
    this.updateThemeButtons();
  }

  setTheme(theme) {
    const validThemes = ['light', 'dark'];
    if (!validThemes.includes(theme)) {
      theme = 'light';
    }
    
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pdf-reader-theme', theme);
    
    this.updateThemeIcons();
  }

  cycleTheme() {
    const themes = ['light', 'dark'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
    this.updateThemeButtons();
  }

  updateThemeButtons() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
    });
  }

  updateThemeIcons() {
    const themeToggle = document.getElementById('themeToggle');
    const mobileTheme = document.getElementById('mobileTheme');
    
    let iconSvg = '';
    if (this.currentTheme === 'dark') {
      iconSvg = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    } else {
      iconSvg = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
    
    if (themeToggle) {
      const svg = themeToggle.querySelector('svg');
      if (svg) svg.innerHTML = iconSvg;
    }
    
    if (mobileTheme) {
      const svg = mobileTheme.querySelector('svg');
      if (svg) svg.innerHTML = iconSvg;
    }
  }

  // Mobile UI methods
  detectMobile() {
    const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      this.showMobileControls();
    } else {
      this.hideMobileControls();
    }
  }

  showMobileControls() {
    if (this.mobileControlsEl) {
      this.mobileControlsEl.style.display = 'block';
    }
    if (this.controlsEl) {
      this.controlsEl.style.display = 'none';
    }
  }

  hideMobileControls() {
    if (this.mobileControlsEl) {
      this.mobileControlsEl.style.display = 'none';
    }
    if (this.controlsEl) {
      this.controlsEl.style.display = 'flex';
    }
  }

  toggleMobileSettings() {
    if (this.mobileSettingsPanelEl) {
      this.mobileSettingsPanelEl.classList.toggle('show');
    }
  }

  closeMobileSettings() {
    if (this.mobileSettingsPanelEl) {
      this.mobileSettingsPanelEl.classList.remove('show');
    }
  }

  // Fullscreen methods
  toggleFullscreen() {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  enterFullscreen() {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    
    document.body.classList.add('fullscreen-mode');
    this.isFullscreen = true;
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    
    document.body.classList.remove('fullscreen-mode');
    this.isFullscreen = false;
  }

  // Orientation and resize handlers
  handleOrientationChange() {
    setTimeout(() => {
      this.detectMobile();
      if (this.pdfDoc) {
        this.renderPage(this.pageNum);
      }
    }, 300);
  }

  handleResize() {
    this.detectMobile();
    if (this.pdfDoc) {
      this.renderPage(this.pageNum);
    }
  }

  // UI update methods
  updateUI() {
    if (this.pageInfoEl) {
      this.pageInfoEl.textContent = `Página: ${this.pageNum} de ${this.pageCount}`;
    }
    
    if (this.mobilePageInfoEl) {
      this.mobilePageInfoEl.textContent = `${this.pageNum}/${this.pageCount}`;
    }
    
    this.updateZoomDisplay();
    this.updateProgress();
    this.updateNavigationButtons();
  }

  updateZoomDisplay() {
    const zoomPercent = Math.round(this.scale * 100);
    
    if (this.zoomLevelEl) {
      this.zoomLevelEl.textContent = `${zoomPercent}%`;
    }
    
    if (this.mobileZoomLevelEl) {
      this.mobileZoomLevelEl.textContent = `${zoomPercent}%`;
    }
  }

  updateProgress() {
    if (this.pageCount > 0) {
      const progress = (this.pageNum / this.pageCount) * 100;
      
      if (this.progressFillEl) {
        this.progressFillEl.style.width = `${progress}%`;
      }
      
      if (this.progressTextEl) {
        this.progressTextEl.textContent = `${Math.round(progress)}%`;
      }
    }
  }

  updateNavigationButtons() {
    const prevButtons = [document.getElementById('prevPage'), document.getElementById('mobilePrevPage')];
    const nextButtons = [document.getElementById('nextPage'), document.getElementById('mobileNextPage')];
    
    prevButtons.forEach(btn => {
      if (btn) {
        btn.disabled = this.pageNum <= 1;
      }
    });
    
    nextButtons.forEach(btn => {
      if (btn) {
        btn.disabled = this.pageNum >= this.pageCount;
      }
    });
  }

  async loadPDF(url) {
    try {
      this.showLoading();
      
      const progressTracker = new ProgressTracker(this.loadingEl);
      
      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid PDF URL: ${url}`);
      }
      this.currentPDFId = this.cache.generatePDFId(url);
      
      if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      } else {
        throw new Error('PDF.js library not available');
      }

      // Check cache first
      const cachedPDF = await this.cache.getCachedPDF(url);
      let pdfData;
      
      if (cachedPDF) {
        progressTracker.updateProgress(cachedPDF.size, cachedPDF.size, true);
        pdfData = cachedPDF.data;
        this.showCacheIndicator(true);
      } else {
        // Test if URL is accessible
        const testResponse = await fetch(url, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error(`PDF file not accessible: ${testResponse.status} ${testResponse.statusText}`);
        }

        // Download with progress tracking
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download PDF: ${response.status}`);
        }

        const contentLength = parseInt(response.headers.get('content-length') || '0');
        const reader = response.body.getReader();
        const chunks = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;
          progressTracker.updateProgress(receivedLength, contentLength || receivedLength);
        }

        const allChunks = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }
        
        pdfData = allChunks.buffer;
        
        await this.cache.cachePDF(url, pdfData, {
          title: document.getElementById("tituloLivro")?.textContent,
          author: document.getElementById("autorLivro")?.textContent
        });
        
        this.showCacheIndicator(false, 2000);
      }

      progressTracker.complete();

      const loadingTask = pdfjsLib.getDocument({
        data: pdfData,
        verbosity: 0
      });

      this.pdfDoc = await loadingTask.promise;
      this.pageCount = this.pdfDoc.numPages;
      
      await this.renderPage(this.pageNum);
      this.updateUI();
      this.showPDF();
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.showError();
    }
  }

  async renderPage(num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
      return;
    }
    
    this.pageRendering = true;
    
    try {
      const cachedImage = this.cache.getCachedPage(this.currentPDFId, num, this.scale);
      
      if (cachedImage && this.currentTheme === 'light') {
        this.ctx.putImageData(cachedImage, 0, 0);
        this.pageRendering = false;
        
        if (this.pageNumPending !== null) {
          const pending = this.pageNumPending;
          this.pageNumPending = null;
          await this.renderPage(pending);
        }
        
        this.pageNum = num;
        this.updateUI();
        return;
      }
      
      const page = await this.pdfDoc.getPage(num);
      
      const containerWidth = this.containerEl.clientWidth - 40;
      const viewport = page.getViewport({ scale: 1 });
      
      if (this.scale === 'fit-width') {
        this.scale = containerWidth / viewport.width;
      }
      
      const finalViewport = page.getViewport({ scale: this.scale });
      this.canvas.height = finalViewport.height;
      this.canvas.width = finalViewport.width;
      
      const imageRegions = await this.textRenderer.analyzeAndRenderPage(
        page, 
        this.canvas, 
        finalViewport, 
        this.currentTheme
      );
      
      if (this.currentTheme === 'light') {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.cache.cacheRenderedPage(this.currentPDFId, num, imageData, this.scale);
      }
      
      this.pageRendering = false;
      
      if (this.pageNumPending !== null) {
        const pending = this.pageNumPending;
        this.pageNumPending = null;
        await this.renderPage(pending);
      }
      
      this.pageNum = num;
      this.updateUI();
      
      this.preloadNextPage();
      
    } catch (error) {
      console.error('Error rendering page:', error);
      this.pageRendering = false;
    }
  }

  async preloadNextPage() {
    if (this.pageNum < this.pageCount) {
      const nextPageNum = this.pageNum + 1;
      
      const cachedNext = this.cache.getCachedPage(this.currentPDFId, nextPageNum, this.scale);
      if (!cachedNext) {
        setTimeout(async () => {
          try {
            const page = await this.pdfDoc.getPage(nextPageNum);
            const viewport = page.getViewport({ scale: this.scale });
            
            const preloadCanvas = document.createElement('canvas');
            const preloadCtx = preloadCanvas.getContext('2d');
            preloadCanvas.height = viewport.height;
            preloadCanvas.width = viewport.width;
            
            await page.render({
              canvasContext: preloadCtx,
              viewport: viewport
            }).promise;
            
            const imageData = preloadCtx.getImageData(0, 0, preloadCanvas.width, preloadCanvas.height);
            this.cache.cacheRenderedPage(this.currentPDFId, nextPageNum, imageData, this.scale);
          } catch (error) {
            // Silently fail preload
          }
        }, 500);
      }
    }
  }

  showLoading() {
    this.loadingEl.style.display = 'flex';
    this.errorEl.style.display = 'none';
    this.controlsEl.style.display = 'none';
    this.containerEl.style.display = 'none';
  }

  showError() {
    this.loadingEl.style.display = 'none';
    this.errorEl.style.display = 'flex';
    this.controlsEl.style.display = 'none';
    this.containerEl.style.display = 'none';
  }

  showPDF() {
    this.loadingEl.style.display = 'none';
    this.errorEl.style.display = 'none';
    this.containerEl.style.display = 'flex';
    
    this.detectMobile();
  }

  showCacheIndicator(fromCache = false, duration = 3000) {
    const indicator = document.getElementById('cacheIndicator');
    if (!indicator) return;
    
    indicator.textContent = fromCache ? '📁 Carregado do Cache' : '💾 Salvo no Cache';
    indicator.className = `cache-indicator show ${fromCache ? 'from-cache' : ''}`;
    
    setTimeout(() => {
      indicator.classList.remove('show');
    }, duration);
  }

  // Navigation methods
  prevPage() {
    if (this.pageNum <= 1) return;
    this.renderPage(this.pageNum - 1);
  }

  nextPage() {
    if (this.pageNum >= this.pageCount) return;
    this.renderPage(this.pageNum + 1);
  }

  // Zoom methods
  zoomIn() {
    this.scale = Math.min(this.scale * 1.25, 5);
    this.renderPage(this.pageNum);
  }

  zoomOut() {
    this.scale = Math.max(this.scale * 0.8, 0.25);
    this.renderPage(this.pageNum);
  }

  fitToWidth() {
    this.scale = 'fit-width';
    this.renderPage(this.pageNum);
  }
} 