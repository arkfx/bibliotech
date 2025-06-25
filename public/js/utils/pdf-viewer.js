// PDF Viewer class with mobile and desktop support
// Handles PDF navigation, zoom, theme management, and touch gestures

import { PDFCache } from './pdf-cache.js';
import { ProgressTracker } from './progress-tracker.js';
import { PDFOperatorRenderer } from './pdf-renderer.js';
import { ReadingSession } from './reading-session.js';
import { PDFTableOfContents } from './pdf-toc.js';
import { PDFSearch } from './pdf-search.js';
import { ReadingPreferences } from './reading-preferences.js';
import { AdaptiveLayout } from './adaptive-layout.js';

export class PDFViewer {
  constructor() {
    // These settings are NOT stored in localStorage - they are hardcoded
    this.TRANSITION_CONFIG = {
      // Available transition types
      TYPES: {
        NONE: 'none',
        FADE: 'fade', 
        SLIDE: 'slide',
        FLIP: 'flip'
      },
      
      // Default settings (single source of truth)
      DEFAULTS: {
        type: 'fade',        // Modify this to change default transition type
        duration: 125,       // Modify this to change default transition duration (ms)
        enabled: true,
        preloadAdjacent: true
      },
      
      // Validation constraints
      CONSTRAINTS: {
        minDuration: 0,
        maxDuration: 10000,
        validTypes: ['none', 'fade', 'slide', 'flip']
      },
      
      // CSS class mappings
      CSS_CLASSES: {
        container: {
          none: 'no-transition',
          fade: 'transition-fade',
          slide: 'transition-slide', 
          flip: 'transition-flip',
          disabled: 'transition-disabled'
        },
        states: {
          transitioning: 'transitioning',
          slideNext: 'slide-next',
          slidePrev: 'slide-prev',
          flipNext: 'flip-next',
          flipPrev: 'flip-prev'
        }
      },
      
      // Timing configurations
      TIMING: {
        cssTransitionStart: 50,    // Wait time before starting transition
        preloadDelay: 100,         // Delay before preloading adjacent pages
        cleanupDelay: 50           // Delay before cleaning up transition classes
      }
    };

    // Core PDF.js references
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageCount = 0;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 1.0;
    this.fitMode = 'width';
    this.viewMode = 'page'; // 'page' or 'continuous'

    // Page transition properties (Phase 1.1)
    this.transitionType = 'fade';
    this.transitionDuration = 300;
    this.transitionEnabled = true;
    this.isTransitioning = false;
    this.preloadedPages = new Map(); // Cache for preloaded pages

    // Enhanced zoom properties (Phase 1.2)
    this.smoothZoomAnimations = true;
    this.zoomAnimationDuration = 250;
    this.smartZoomEnabled = true;
    this.textZoomLevel = 1.5;
    this.maxZoomLevel = 5.0;
    this.minZoomLevel = 0.25;
    this.zoomStep = 0.25;
    this.pinchSensitivity = 1.0;
    this.doubleTapZoomMode = 'smart';
    this.maintainPositionOnZoom = true;
    this.lastTapTime = 0;
    this.doubleTapDelay = 300;
    this.isZoomAnimating = false;
    this.zoomCenterPoint = { x: 0.5, y: 0.5 }; // Zoom center (0-1 relative coordinates)
    this.preZoomScrollPosition = { x: 0, y: 0 }; // For maintaining position

    // Theme and rendering
    this.currentTheme = 'dark';
    this.currentPDFId = null;

    // DOM elements - will be initialized in init()
    this.canvas = null;
    this.ctx = null;
    this.containerEl = null;
    this.controlsEl = null;
    this.loadingEl = null;
    this.errorEl = null;

    // Performance and caching
    this.cache = null;
    this.textRenderer = null;
    this.progressTracker = null;
    this.sessionDb = null;

    // Responsive and touch handling
    this.isMobile = window.innerWidth <= 768;
    this.adaptiveLayout = null;
    this.lastTouchDistance = 0;

    // Preferences and session management
    this.preferences = null;
    this.bookId = null;
    this.userId = null;

    // Virtual scrolling for continuous mode
    this.virtualScrolling = null;
    this.isSwitchingModes = false;

    // Search and TOC functionality
    this.searchInstance = null;
    this.tocInstance = null;

    // Helper flag for custom zoom state
    this.ZOOM_CUSTOM_CLASS = 'zoom-custom';

    // Initialize theme early - load from localStorage if available
    this.initializeThemeEarly();
    
    // Don't call init() in constructor - will be called from page
  }

  /**
   * Initialize theme as early as possible to avoid flash of wrong theme
   */
  initializeThemeEarly() {
    try {
      // Try to load theme from global preferences immediately
      const globalPrefs = localStorage.getItem('bibliotech_reader_prefs_global_general');
      if (globalPrefs) {
        const parsed = JSON.parse(globalPrefs);
        const savedTheme = parsed.theme;
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
          this.currentTheme = savedTheme;
          document.documentElement.setAttribute('data-theme', savedTheme);
          console.log('Early theme initialization:', savedTheme);
          return;
        }
      }
      
      // Fallback to dark theme
      this.currentTheme = 'dark';
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('Early theme initialization: default dark');
    } catch (e) {
      // Fallback to dark theme on any error
      this.currentTheme = 'dark';
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('Early theme initialization: fallback to dark');
    }
  }

  init() {
    // Initialize DOM elements first
    this.canvas = document.getElementById('pdfCanvas');
    this.containerEl = document.querySelector('.pdf-container');
    this.controlsEl = document.querySelector('.reader-controls');
    this.loadingEl = document.querySelector('.pdf-loading');
    this.errorEl = document.querySelector('.pdf-error');
    this.pageInfoEl = document.getElementById('pageInfo');
    this.mobilePageInfoEl = document.getElementById('mobilePageInfo');
    
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    // Initialize cache and rendering systems with proper fallbacks
    try {
    this.cache = new PDFCache();
    } catch (error) {
      console.warn('PDFCache not available, using fallback:', error);
      this.cache = this.createFallbackCache();
    }

    try {
    this.textRenderer = new PDFOperatorRenderer();
    } catch (error) {
      console.warn('PDFOperatorRenderer not available, using fallback:', error);
      this.textRenderer = this.createFallbackRenderer();
    }

    // Initialize preferences and theme EARLY to ensure proper theme loading
    this.initializePreferences();
    
    // Setup transition system AFTER preferences are loaded
    this.setupTransitionSystem();
    
    this.setupEventListeners();
    this.initializeAdaptiveLayout();
    this.detectMobile();
  }

  /**
   * Create fallback cache with all required methods
   */
  createFallbackCache() {
    return {
      getCachedPage() { return null; },
      cacheRenderedPage() {},
      generatePDFId(url) { 
        // Simple fallback ID generation
        return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      },
      getCachedPDF() { return Promise.resolve(null); },
      cachePDF() { return Promise.resolve(); },
      clearExpiredCache() { return Promise.resolve(); },
      manageCacheSize() { return Promise.resolve(); },
      getCacheStats() { return Promise.resolve({}); },
      clearThemeCache() {}
    };
  }

  /**
   * Create fallback renderer with all required methods
   */
  createFallbackRenderer() {
    return {
      analyzeAndRenderPage: async (page, canvas, viewport, theme = 'light') => {
        // Fallback to basic PDF.js rendering
        const ctx = canvas.getContext('2d');
        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;
      }
    };
  }

  /**
   * Setup page transition system (Phase 1.1)
   */
  setupTransitionSystem() {
    try {
      // Use centralized defaults directly - no localStorage storage
      this.transitionType = this.TRANSITION_CONFIG.DEFAULTS.type;
      this.transitionDuration = this.TRANSITION_CONFIG.DEFAULTS.duration;
      this.transitionEnabled = this.TRANSITION_CONFIG.DEFAULTS.enabled;

      // Apply transition settings to DOM
      this.applyTransitionSettingsToDOM();
      
      console.log('Transition system setup with centralized defaults:', {
        type: this.transitionType,
        duration: this.transitionDuration,
        enabled: this.transitionEnabled
      });
    } catch (error) {
      console.warn('Error setting up transition system:', error);
      // Fallback to safe defaults
      this.transitionType = this.TRANSITION_CONFIG.DEFAULTS.type;
      this.transitionDuration = this.TRANSITION_CONFIG.DEFAULTS.duration;
      this.transitionEnabled = this.TRANSITION_CONFIG.DEFAULTS.enabled;
      this.applyTransitionSettingsToDOM();
    }
  }

  /**
   * Apply transition settings to DOM elements
   */
  applyTransitionSettingsToDOM() {
    if (!this.containerEl) return;

    // Set CSS custom property for transition duration
    this.containerEl.style.setProperty('--transition-duration', `${this.transitionDuration}ms`);
    
    // Apply transition type CSS class
    this.updateTransitionCSS();
  }

  /**
   * Validate transition type using centralized configuration
   */
  isValidTransitionType(type) {
    return this.TRANSITION_CONFIG.CONSTRAINTS.validTypes.includes(type);
  }

  /**
   * Validate transition duration using centralized configuration
   */
  isValidDuration(duration) {
    return typeof duration === 'number' && 
           duration >= this.TRANSITION_CONFIG.CONSTRAINTS.minDuration && 
           duration <= this.TRANSITION_CONFIG.CONSTRAINTS.maxDuration;
  }

  /**
   * Configure page transition settings (Programmatic API)
   * Note: Changes are temporary and not saved to localStorage
   */
  configureTransitions(options = {}) {
    let hasChanges = false;

    // Validate and apply transition type
    if (options.type && this.isValidTransitionType(options.type)) {
      this.transitionType = options.type;
      hasChanges = true;
    }

    // Validate and apply transition duration
    if (typeof options.duration === 'number') {
      // Use centralized constraints for validation
      const clampedDuration = Math.max(
        this.TRANSITION_CONFIG.CONSTRAINTS.minDuration, 
        Math.min(this.TRANSITION_CONFIG.CONSTRAINTS.maxDuration, options.duration)
      );
      this.transitionDuration = clampedDuration;
      hasChanges = true;
    }

    // Apply enabled state
    if (typeof options.enabled === 'boolean') {
      this.transitionEnabled = options.enabled;
      hasChanges = true;
    }

    // Apply changes to DOM (but don't save to localStorage)
    if (hasChanges) {
      this.applyTransitionSettingsToDOM();
      
      console.log('Transition configuration updated (temporary, not saved):', {
        type: this.transitionType,
        duration: this.transitionDuration,
        enabled: this.transitionEnabled
      });
    }
  }

  /**
   * Update container CSS classes for transitions using centralized configuration
   */
  updateTransitionCSS() {
    if (!this.containerEl) return;

    const cssClasses = this.TRANSITION_CONFIG.CSS_CLASSES;

    // Remove all existing transition classes
    Object.values(cssClasses.container).forEach(className => {
      this.containerEl.classList.remove(className);
    });
    
    // Apply current transition class
    if (this.transitionEnabled && this.transitionType !== this.TRANSITION_CONFIG.TYPES.NONE) {
      const transitionClass = cssClasses.container[this.transitionType];
      if (transitionClass) {
        this.containerEl.classList.add(transitionClass);
      }
    } else {
      // Disabled or 'none' type
      this.containerEl.classList.add(cssClasses.container.disabled);
    }
  }

  setupEventListeners() {
    // Navigation controls
    document.getElementById('prevPage')?.addEventListener('click', () => this.prevPage());
    document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());
    
    // Zoom controls
    document.getElementById('zoomIn')?.addEventListener('click', () => this.zoomIn());
    document.getElementById('zoomOut')?.addEventListener('click', () => this.zoomOut());
    document.getElementById('fitWidth')?.addEventListener('click', () => this.fitToWidth());
    
    // Enhanced reading controls
    document.getElementById('fitHeight')?.addEventListener('click', () => this.fitToHeight());
    document.getElementById('toggleViewMode')?.addEventListener('click', () => this.toggleViewMode());
    
    // Desktop theme and fullscreen controls
    const themeToggle = document.getElementById('themeToggle');
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    const searchToggle = document.getElementById('searchToggle');
    
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.cycleTheme());
    }
    
    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
    }
    
    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        if (this.pdfSearch) {
          this.pdfSearch.openSearch();
        }
      });
    }
    
    // Mobile controls
    document.getElementById('mobilePrevPage')?.addEventListener('click', () => this.prevPage());
    document.getElementById('mobileNextPage')?.addEventListener('click', () => this.nextPage());
    document.getElementById('mobileSettings')?.addEventListener('click', () => this.toggleMobileSettings());
    document.getElementById('mobileTheme')?.addEventListener('click', () => this.cycleTheme());
    document.getElementById('closeSettings')?.addEventListener('click', () => this.closeMobileSettings());
    document.getElementById('mobileFullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('mobileSearch')?.addEventListener('click', () => {
      if (this.pdfSearch) {
        this.pdfSearch.openSearch();
        this.closeMobileSettings(); // Close settings panel when opening search
      }
    });
    
    // Mobile zoom controls
    document.getElementById('mobileZoomIn')?.addEventListener('click', () => this.zoomIn());
    document.getElementById('mobileZoomOut')?.addEventListener('click', () => this.zoomOut());
    document.getElementById('mobileFitWidth')?.addEventListener('click', () => this.fitToWidth());
    
    // Mobile enhanced reading controls
    document.getElementById('mobileFitHeight')?.addEventListener('click', () => this.fitToHeight());
    document.getElementById('mobileViewMode')?.addEventListener('click', () => this.toggleViewMode());
    
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
        const tapLength = currentTime - (this.lastTap || 0);
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
        case 'h':
          e.preventDefault();
          this.fitToHeight();
          break;
        case 'c':
          e.preventDefault();
          this.toggleViewMode();
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
      // Recalculate viewport constraints after resize
      this.updateViewportConstraints();
    });
  }

  // Enhanced touch gesture methods (Phase 1.2)
  handleTouchStart(e) {
    const now = Date.now();
    
    if (e.touches.length === 2) {
      // Pinch-to-zoom gesture
      this.isZooming = true;
      this.initialDistance = this.calculateDistance(e.touches[0], e.touches[1]);
      this.initialScale = this.getCurrentNumericScale();
      
      // Calculate pinch center point
      this.pinchCenter = this.calculatePinchCenter(e.touches[0], e.touches[1]);
      
      // Apply pinch zoom active class
      if (this.containerEl) {
        this.containerEl.classList.add('pinch-zoom-active');
      }
      
      e.preventDefault();
      
    } else if (e.touches.length === 1) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isSwiping = false;
      
      // Double-tap detection for smart zoom
      if (this.smartZoomEnabled && (now - this.lastTapTime) < this.doubleTapDelay) {
        e.preventDefault();
        this.handleDoubleTap(e.touches[0]);
        return;
      }
      
      this.lastTapTime = now;
    }
  }

  handleTouchMove(e) {
    if (this.isZooming && e.touches.length === 2) {
      e.preventDefault();
      
      const currentDistance = this.calculateDistance(e.touches[0], e.touches[1]);
      const scaleChange = (currentDistance / this.initialDistance) * this.pinchSensitivity;
      let newScale = this.initialScale * scaleChange;
      
      // Clamp to min/max zoom levels with viewport constraints
      const maxZoomForViewport = this.getMaxZoomForViewportSync();
      newScale = Math.min(Math.max(newScale, this.minZoomLevel), maxZoomForViewport);
      
      // Apply enhanced pinch zoom
      this.scale = newScale;
      this.fitMode = 'custom';
      
      // Calculate new pinch center for smooth zooming
      const newPinchCenter = this.calculatePinchCenter(e.touches[0], e.touches[1]);
      if (this.maintainPositionOnZoom) {
        this.adjustScrollForPinch(this.pinchCenter, newPinchCenter, this.initialScale, newScale);
      }
      
      this.pinchCenter = newPinchCenter;
      
      // Render with new scale
      if (this.viewMode === 'continuous') {
        this.updateViewAfterZoom();
      } else {
        this.renderPage(this.pageNum);
        this.updateZoomDisplay();
      }
      
    } else if (e.touches.length === 1 && !this.isZooming && !this.isZoomAnimating) {
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
      this.initialScale = this.getCurrentNumericScale();
      
      // Remove pinch zoom active class
      if (this.containerEl) {
        this.containerEl.classList.remove('pinch-zoom-active');
      }
      
      // Save zoom preferences after pinch gesture
      this.savePreferences();
      
    } else if (this.isSwiping && !this.isZoomAnimating) {
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

  /**
   * Handle double-tap for smart zoom
   */
  async handleDoubleTap(touch) {
    if (!this.smartZoomEnabled || this.isZoomAnimating) return;
    
    // Calculate tap point relative to container
    const containerRect = this.containerEl.getBoundingClientRect();
    const tapPoint = {
      x: (touch.clientX - containerRect.left) / containerRect.width,
      y: (touch.clientY - containerRect.top) / containerRect.height
    };
    
    // Apply smart zoom at tap location
    await this.smartZoom(tapPoint);
  }

  /**
   * Calculate center point between two touches
   */
  calculatePinchCenter(touch1, touch2) {
    const containerRect = this.containerEl.getBoundingClientRect();
    
    return {
      x: ((touch1.clientX + touch2.clientX) / 2 - containerRect.left) / containerRect.width,
      y: ((touch1.clientY + touch2.clientY) / 2 - containerRect.top) / containerRect.height
    };
  }

  /**
   * Adjust scroll position during pinch for smooth zooming
   */
  adjustScrollForPinch(oldCenter, newCenter, oldScale, newScale) {
    if (!this.containerEl) return;
    
    const scaleRatio = newScale / oldScale;
    const containerRect = this.containerEl.getBoundingClientRect();
    
    // Calculate the difference in center points
    const centerDeltaX = (newCenter.x - oldCenter.x) * containerRect.width;
    const centerDeltaY = (newCenter.y - oldCenter.y) * containerRect.height;
    
    // Adjust scroll to maintain focus on pinch center
    const currentScrollX = this.containerEl.scrollLeft;
    const currentScrollY = this.containerEl.scrollTop;
    
    const newScrollX = (currentScrollX * scaleRatio) - centerDeltaX;
    const newScrollY = (currentScrollY * scaleRatio) - centerDeltaY;
    
    this.containerEl.scrollTo({
      left: Math.max(0, newScrollX),
      top: Math.max(0, newScrollY),
      behavior: 'auto'
    });
  }

  calculateDistance(touch1, touch2) {
    const deltaX = touch1.clientX - touch2.clientX;
    const deltaY = touch1.clientY - touch2.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  // Enhanced Preferences and theme management with system awareness
  initializePreferences(bookId = 'global') {
    this.preferences = new ReadingPreferences(bookId);
    
    // Load all preferences with smart defaults
    const prefs = this.preferences.loadPreferences();
    
    // Ensure we have a valid theme preference, defaulting to 'dark'
    if (!prefs.theme || !['light', 'dark'].includes(prefs.theme)) {
      prefs.theme = 'dark';
      this.preferences.savePreference('theme', 'dark', true);
      console.log('Applied default dark theme');
    }
    
    // Use context-aware theme if auto theme is enabled
    if (prefs.autoTheme) {
      const contextTheme = this.preferences.getContextAwareTheme();
      if (contextTheme !== prefs.theme) {
        prefs.theme = contextTheme;
        this.preferences.savePreference('theme', contextTheme);
        console.log('Applied context-aware theme:', contextTheme);
      }
    }
    
    // Apply loaded preferences
    this.applyPreferences(prefs);
    
    // Setup enhanced system theme listener with context awareness
    this.systemThemeCleanup = this.preferences.setupSystemThemeListener((newTheme) => {
      console.log('System theme change detected:', newTheme);
      this.setTheme(newTheme);
      this.updateThemeButtons();
    });
    
    // Setup time-based theme switching if enabled
    if (prefs.timeBasedTheme && prefs.autoTheme) {
      this.setupTimeBasedThemeWatcher();
    }
    
    console.log('Enhanced reading preferences initialized for book:', bookId, prefs);
  }

  /**
   * Setup time-based theme watching for enhanced auto theme switching
   */
  setupTimeBasedThemeWatcher() {
    // Check for theme changes every 5 minutes
    this.timeBasedThemeInterval = setInterval(() => {
      const currentPrefs = this.preferences.loadPreferences();
      if (currentPrefs.autoTheme && currentPrefs.timeBasedTheme) {
        const contextTheme = this.preferences.getContextAwareTheme();
        const currentTheme = this.getTheme();
        
        if (contextTheme !== currentTheme) {
          console.log('Time-based theme switching to:', contextTheme);
          this.setTheme(contextTheme);
          this.updateThemeButtons();
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.currentTheme || 'light';
  }

  // Adaptive Layout System
  initializeAdaptiveLayout() {
    this.adaptiveLayout = new AdaptiveLayout();
    
    // Subscribe to layout changes
    this.adaptiveLayout.onBreakpointChange((oldBreakpoint, newBreakpoint) => {
      console.log('PDF Viewer - Breakpoint changed:', oldBreakpoint, '->', newBreakpoint);
      this.handleBreakpointChange(newBreakpoint);
    });
    
    this.adaptiveLayout.onOrientationChange((oldOrientation, newOrientation) => {
      console.log('PDF Viewer - Orientation changed:', oldOrientation, '->', newOrientation);
      this.handleOrientationChange(newOrientation);
    });
    
    this.adaptiveLayout.onResize((state) => {
      // Re-render current page if PDF is loaded
      if (this.pdfDoc && this.pageNum) {
        this.renderPage(this.pageNum);
      }
    });
    
    console.log('Adaptive layout initialized');
  }
  
  handleBreakpointChange(newBreakpoint) {
    // Update mobile detection
    this.isMobile = this.adaptiveLayout.isMobile();
    
    // Apply breakpoint-specific optimizations
    if (this.adaptiveLayout.isMobile()) {
      this.showMobileControls();
      this.hidePDFControls();
    } else {
      this.hideMobileControls();
      this.showPDFControls();
    }
    
    // Re-render current page to adapt to new layout
    if (this.pdfDoc && this.pageNum) {
      setTimeout(() => {
        this.renderPage(this.pageNum);
      }, 300); // Wait for layout transition to complete
    }
  }
  
  handleOrientationChange(newOrientation) {
    // Apply orientation-specific optimizations
    if (this.adaptiveLayout.isMobile() || this.adaptiveLayout.isTablet()) {
      // Adjust zoom for better readability in different orientations
      if (newOrientation === 'landscape') {
        // In landscape, fit to height might be better
        if (this.fitMode === 'width') {
          this.fitToHeight();
        }
      } else {
        // In portrait, fit to width is usually better
        if (this.fitMode === 'height') {
          this.fitToWidth();
        }
      }
    }
    
    // Re-render current page
    if (this.pdfDoc && this.pageNum) {
      setTimeout(() => {
        this.renderPage(this.pageNum);
      }, 300);
    }
  }
  
  showPDFControls() {
    const controls = document.querySelector('.reader-controls');
    if (controls) {
      controls.style.display = 'flex';
    }
  }
  
  hidePDFControls() {
    const controls = document.querySelector('.reader-controls');
    if (controls) {
      controls.style.display = 'none';
    }
  }

  applyPreferences(prefs) {
    // Apply theme preference
    if (prefs.theme && prefs.theme !== this.currentTheme) {
      this.setTheme(prefs.theme);
    }

    // Apply transition preferences (Phase 1.1)
    if (prefs.transitionType) {
      this.transitionType = prefs.transitionType;
    }
    if (prefs.transitionDuration) {
      this.transitionDuration = prefs.transitionDuration;
    }
    if (typeof prefs.transitionEnabled === 'boolean') {
      this.transitionEnabled = prefs.transitionEnabled;
    }
    
    // Update transition CSS after applying preferences
    this.updateTransitionCSS();
    if (this.containerEl) {
      this.containerEl.style.setProperty('--transition-duration', `${this.transitionDuration}ms`);
    }

    // Apply enhanced zoom preferences (Phase 1.2)
    if (typeof prefs.smoothZoomAnimations === 'boolean') {
      this.smoothZoomAnimations = prefs.smoothZoomAnimations;
    }
    if (prefs.zoomAnimationDuration) {
      this.zoomAnimationDuration = prefs.zoomAnimationDuration;
    }
    if (typeof prefs.smartZoomEnabled === 'boolean') {
      this.smartZoomEnabled = prefs.smartZoomEnabled;
    }
    if (prefs.textZoomLevel) {
      this.textZoomLevel = prefs.textZoomLevel;
    }
    if (prefs.maxZoomLevel) {
      this.maxZoomLevel = prefs.maxZoomLevel;
    }
    if (prefs.minZoomLevel) {
      this.minZoomLevel = prefs.minZoomLevel;
    }
    if (prefs.zoomStep) {
      this.zoomStep = prefs.zoomStep;
    }
    if (prefs.pinchSensitivity) {
      this.pinchSensitivity = prefs.pinchSensitivity;
    }
    if (prefs.doubleTapZoomMode) {
      this.doubleTapZoomMode = prefs.doubleTapZoomMode;
    }
    if (typeof prefs.maintainPositionOnZoom === 'boolean') {
      this.maintainPositionOnZoom = prefs.maintainPositionOnZoom;
    }

    // Apply view mode preference
    if (prefs.viewMode && prefs.viewMode !== this.viewMode) {
      this.viewMode = prefs.viewMode;
    }

    // Apply zoom and fit preferences
    if (prefs.zoom && typeof prefs.zoom === 'number') {
      this.scale = prefs.zoom;
    }
    if (prefs.fitMode) {
      this.fitMode = prefs.fitMode;
    }

    console.log('Applied reading preferences (excluding transitions):', prefs);
  }

  setTheme(theme) {
    const validThemes = ['light', 'dark'];
    if (!validThemes.includes(theme)) {
      theme = 'light';
    }
    
    const previousTheme = this.currentTheme;
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save to preferences system if available
    if (this.preferences) {
      this.preferences.savePreference('theme', theme, true); // Save globally
    } else {
      // Fallback to old localStorage method
      localStorage.setItem('pdf-reader-theme', theme);
    }
    
    this.updateThemeIcons();
  }

  cycleTheme() {
    const themes = ['light', 'dark'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const previousTheme = this.currentTheme;
    
    this.setTheme(themes[nextIndex]);
    this.updateThemeButtons();

    // 💡 Clear cache and re-render pages instantly so the theme change is visible immediately
    if (this.pdfDoc) {
      
      if (this.viewMode === 'page') {
        // Force re-render current page by bypassing cache
        this.renderPage(this.pageNum);
      } else if (this.viewMode === 'continuous' && this.virtualScrolling) {
        // Re-render all visible pages in continuous mode
        this.virtualScrolling.renderedPages.forEach((pageData, pageNum) => {
          if (pageData && pageData.canvas) {
            // Mark as not rendered to force fresh render with new theme
            pageData.rendered = false;
            this.renderPageToVirtualCanvas(pageNum, pageData.canvas);
          }
        });
      }
    }
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
    // Check if ReadingSession has transformed the pageInfo element
    const hasProgressBar = document.getElementById('currentPageDisplay');
    
    if (this.pageInfoEl && !hasProgressBar) {
      // Only update if ReadingSession hasn't transformed it
      this.pageInfoEl.textContent = `Página: ${this.pageNum} de ${this.pageCount}`;
    }
    
    if (this.mobilePageInfoEl) {
      this.mobilePageInfoEl.textContent = `${this.pageNum}/${this.pageCount}`;
    }
    
    this.updateZoomDisplay();
    this.updateProgress();
    this.updateNavigationButtons();
    
    // Update TOC current page indicator
    if (this.tableOfContents) {
      this.tableOfContents.updateCurrentPage(this.pageNum);
    }
  }

  updateZoomDisplay() {
    let displayText;
    
    // Determine display text based on fit mode and scale
    switch (this.fitMode) {
      case 'width':
        displayText = 'Ajustar Largura';
        break;
      case 'height':
        displayText = 'Ajustar Altura';
        break;
      default:
        const zoomPercent = Math.round(this.scale * 100);
        displayText = this.scale === 'fit-width' ? 'Ajustar' : `${zoomPercent}%`;
    }
    
    const zoomLevelEl = document.getElementById('zoomLevel');
    const mobileZoomLevelEl = document.getElementById('mobileZoomLevel');
    
    if (zoomLevelEl) zoomLevelEl.textContent = displayText;
    if (mobileZoomLevelEl) mobileZoomLevelEl.textContent = displayText;
    
    // Save zoom preference for this view mode
    this.saveZoomPreference();
  }
  
  // Save and restore zoom preferences per view mode
  saveZoomPreference() {
    try {
      const prefKey = `zoom_${this.viewMode}_${this.extractBookId(this.currentPDFUrl || 'default')}`;
      const zoomData = {
        scale: this.scale,
        fitMode: this.fitMode,
        timestamp: Date.now()
      };
      localStorage.setItem(prefKey, JSON.stringify(zoomData));
    } catch (e) {
      console.log('Could not save zoom preference:', e);
    }
  }
  
  loadZoomPreference() {
    try {
      const prefKey = `zoom_${this.viewMode}_${this.extractBookId(this.currentPDFUrl || 'default')}`;
      const saved = localStorage.getItem(prefKey);
      
      if (saved) {
        const zoomData = JSON.parse(saved);
        
        // Only restore if preference is less than 24 hours old
        if (Date.now() - zoomData.timestamp < 24 * 60 * 60 * 1000) {
          this.scale = zoomData.scale || 1;
          this.fitMode = zoomData.fitMode || 'custom';
          return true;
        }
      }
    } catch (e) {
      console.log('Could not parse zoom preference:', e);
    }
    
    return false;
  }

  updateProgress() {
    if (this.pageCount > 0) {
      // Update reading session progress only
      if (this.readingSession) {
        this.readingSession.updateProgress(this.pageNum, this.pageCount);
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
      
      let progressTracker;
      try {
        progressTracker = new ProgressTracker(this.loadingEl);
      } catch (error) {
        console.warn('ProgressTracker not available, using fallback:', error);
        progressTracker = {
          updateProgress: () => {},
          complete: () => {}
        };
      }
      
      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid PDF URL: ${url}`);
      }
      this.currentPDFUrl = url;
      this.currentPDFId = this.cache.generatePDFId(url);
      
      // Log the PDF URL for debugging/tracking purposes
      console.log('PDF Reader - Currently open book URL:', this.currentPDFUrl);
      
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
      
      // Handle URL-based page navigation early (from "Continue Reading" buttons)
      // This eliminates the delay by setting the target page before initial render
      if (window.targetPage) {
        console.log('Setting initial page from URL target:', window.targetPage);
        if (window.targetPage >= 1 && window.targetPage <= this.pageCount) {
          this.pageNum = window.targetPage;
        }
        // Clear the target page
        delete window.targetPage;
      }
      
      // Initialize Table of Contents
      this.tableOfContents = new PDFTableOfContents(this.pdfDoc, this);
      
      // Initialize PDFSearch
      this.pdfSearch = new PDFSearch(this.pdfDoc, this);
      
      await this.renderPage(this.pageNum);
      this.updateUI();
      this.showPDF();
      
      // Initialize book-specific preferences
      const bookId = this.extractBookId(url);
      if (bookId) {
        this.initializePreferences(bookId);
        
        // Apply preferred view mode after PDF is loaded
        if (this.preferredViewMode && this.preferredViewMode !== this.viewMode) {
          console.log(`PDF Viewer - Applying preferred view mode: ${this.preferredViewMode}`);
          this.viewMode = this.preferredViewMode;
          
          // Actually switch to the preferred view mode
          if (this.preferredViewMode === 'continuous') {
            this.enableContinuousMode();
          } else {
            this.enablePageMode();
          }
        }
        
        // Update view mode UI to reflect the current state
        this.updateViewModeUI();
      }
      
      // Initialize reading session AFTER showing PDF controls
      const userId = await this.getUserId();
      if (bookId && userId) {
        // Import the database-backed reading session
        const { ReadingSessionDB } = await import('./reading-session-db.js');
        this.readingSession = new ReadingSessionDB(bookId, userId);
        // Update progress immediately after initialization
        await this.readingSession.init();
        this.readingSession.updateProgress(this.pageNum, this.pageCount);
        
        // Note: URL-based navigation now happens earlier in the process
        // No delay as the page is already set before rendering
      }
      
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
      // Always use light theme for page 1 to avoid mask reversion issues
      const effectiveTheme = (num === 1) ? 'light' : this.currentTheme;
      
      // Don't check cache with scale as we need fresh render on zoom changes
      const cachedImage = null; // Force re-render to fix zoom issues
      
      if (cachedImage) {
        this.ctx.putImageData(cachedImage, 0, 0);
        
        // Update canvas dimensions from cached image
        this.canvas.width = cachedImage.width;
        this.canvas.height = cachedImage.height;
        
        // Ensure canvas reflects its intrinsic size even when loading from cache
        this.adjustCanvasStyles(this.canvas);
        
        this.pageRendering = false;
        
        if (this.pageNumPending !== null) {
          const pending = this.pageNumPending;
          this.pageNumPending = null;
          await this.renderPage(pending);
        }
        
        this.pageNum = num;
        this.updateUI();
        
        this.preloadNextPage();
        
        // Preload adjacent pages for smooth transitions (Phase 1.1)
        if (this.transitionEnabled) {
          setTimeout(() => this.preloadAdjacentPages(), this.TRANSITION_CONFIG.TIMING.preloadDelay);
        }
        
        return;
      }
      
      const page = await this.pdfDoc.getPage(num);
      
      // Calculate the actual numeric scale
      let effectiveScale = this.scale;
      if (this.scale === 'fit-width' || this.fitMode === 'width') {
        // Fallback handling: if the container is hidden (display:none) it will report width 0.
        // In that case, use the viewport width (window.innerWidth) so that the initial
        // calculation still results in a visible page. The container will soon be visible
        // when showPDF() is called, after which updateViewportConstraints() will refine
        // the zoom level.
        let containerWidth = (this.containerEl?.clientWidth || 0) - 40;
        if (containerWidth <= 0) {
          containerWidth = window.innerWidth - 40;
        }

        const baseViewport = page.getViewport({ scale: 1 });
        effectiveScale = containerWidth / baseViewport.width;
        // Update the scale to be numeric
        this.scale = effectiveScale;
      } else if (this.fitMode === 'height') {
        let containerHeight = (this.containerEl?.clientHeight || 0) - 40;
        if (containerHeight <= 0) {
          containerHeight = window.innerHeight - 40;
        }
        const baseViewport = page.getViewport({ scale: 1 });
        effectiveScale = containerHeight / baseViewport.height;
        this.scale = effectiveScale;
      }
      
      // Always use numeric scale for viewport calculation
      const finalViewport = page.getViewport({ scale: effectiveScale });
      this.canvas.height = finalViewport.height;
      this.canvas.width = finalViewport.width;

      // NEW: enforce intrinsic canvas size in the DOM
      this.adjustCanvasStyles(this.canvas);
      
      const imageRegions = await this.textRenderer.analyzeAndRenderPage(
        page, 
        this.canvas, 
        finalViewport, 
        effectiveTheme
      );
      
      // Cache the rendered page with theme information
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.cache.cacheRenderedPage(this.currentPDFId, num, imageData, effectiveScale, effectiveTheme);
      
      this.pageRendering = false;
      
      if (this.pageNumPending !== null) {
        const pending = this.pageNumPending;
        this.pageNumPending = null;
        await this.renderPage(pending);
      }
      
      this.pageNum = num;
      this.updateUI();
      
      this.preloadNextPage();
      
      // Preload adjacent pages for smooth transitions (Phase 1.1)
      if (this.transitionEnabled) {
        setTimeout(() => this.preloadAdjacentPages(), this.TRANSITION_CONFIG.TIMING.preloadDelay);
      }
      
    } catch (error) {
      console.error('Error rendering page:', error);
      this.pageRendering = false;
    }
  }

  async preloadNextPage() {
    if (this.pageNum < this.pageCount) {
      const nextPageNum = this.pageNum + 1;
      
      // Use light theme for page 1, otherwise use current theme
      const effectiveTheme = (nextPageNum === 1) ? 'light' : this.currentTheme;
      
      const cachedNext = this.cache.getCachedPage(this.currentPDFId, nextPageNum, this.scale, effectiveTheme);
      if (!cachedNext) {
        setTimeout(async () => {
          try {
            const page = await this.pdfDoc.getPage(nextPageNum);
            const viewport = page.getViewport({ scale: this.scale });
            
            const preloadCanvas = document.createElement('canvas');
            const preloadCtx = preloadCanvas.getContext('2d');
            preloadCanvas.height = viewport.height;
            preloadCanvas.width = viewport.width;
            
            if (effectiveTheme === 'light') {
              // Standard rendering for light theme (including page 1)
              await page.render({
                canvasContext: preloadCtx,
                viewport: viewport
              }).promise;
            } else {
              // Use theme renderer for dark theme (but not page 1)
              await this.textRenderer.analyzeAndRenderPage(
                page, 
                preloadCanvas, 
                viewport, 
                effectiveTheme
              );
            }
            
            const imageData = preloadCtx.getImageData(0, 0, preloadCanvas.width, preloadCanvas.height);
            this.cache.cacheRenderedPage(this.currentPDFId, nextPageNum, imageData, this.scale, effectiveTheme);
          } catch (error) {
            // Silently fail preload
          }
        }, 500);
      }
    }
  }

  showLoading() {
    if (this.loadingEl) this.loadingEl.style.display = 'flex';
    if (this.errorEl) this.errorEl.style.display = 'none';
    if (this.controlsEl) this.controlsEl.style.display = 'none';
    if (this.containerEl) this.containerEl.style.display = 'none';
  }

  showError() {
    if (this.loadingEl) this.loadingEl.style.display = 'none';
    if (this.errorEl) this.errorEl.style.display = 'flex';
    if (this.controlsEl) this.controlsEl.style.display = 'none';
    if (this.containerEl) this.containerEl.style.display = 'none';
  }

  showPDF() {
    if (this.loadingEl) this.loadingEl.style.display = 'none';
    if (this.errorEl) this.errorEl.style.display = 'none';
    if (this.containerEl) this.containerEl.style.display = 'flex';
    
    this.detectMobile();

    // Ensure initial scale truly fits the available width now that the container is visible.
    // When the page was still hidden, width calculations might have relied on a fallback
    // window size and produced a canvas that is wider than the real container. Re-evaluate
    // the viewport constraints and, if necessary, trigger a fit-to-width adjustment so
    // the PDF never overflows horizontally on first load / refresh.
    if (this.scale === 'fit-width' || this.fitMode === 'width') {
      // Recalculate based on real container width. This will shrink the canvas if it was
      // previously rendered too wide while the container was hidden.
      this.updateViewportConstraints();
    }
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

  // Navigation methods with smooth transitions (Phase 1.1)
  async prevPage() {
    if (this.pageNum <= 1 || this.isTransitioning) return;
    
    const targetPage = this.pageNum - 1;
    
    if (this.viewMode === 'continuous') {
      // In continuous mode, scroll to the previous page
      this.scrollToPageInContinuousMode(targetPage);
    } else {
      // In page mode, render with transition
      await this.renderPageWithTransition(targetPage, 'prev');
    }
  }

  async nextPage() {
    if (this.pageNum >= this.pageCount || this.isTransitioning) return;
    
    const targetPage = this.pageNum + 1;
    
    if (this.viewMode === 'continuous') {
      // In continuous mode, scroll to the next page
      this.scrollToPageInContinuousMode(targetPage);
    } else {
      // In page mode, render with transition
      await this.renderPageWithTransition(targetPage, 'next');
    }
  }

  /**
   * Render page with smooth transition animation
   */
  async renderPageWithTransition(targetPage, direction = 'next') {
    if (!this.transitionEnabled || 
        this.transitionType === this.TRANSITION_CONFIG.TYPES.NONE || 
        this.isTransitioning || 
        !this.containerEl) {
      return this.renderPage(targetPage);
    }

    this.isTransitioning = true;

    try {
      // Preload target page if not already cached
      await this.preloadPage(targetPage);

      // Apply transition CSS classes using centralized configuration
      const cssClasses = this.TRANSITION_CONFIG.CSS_CLASSES;
      this.containerEl.classList.add(cssClasses.states.transitioning);
      
      // Apply direction-specific classes for slide and flip transitions
      if (this.transitionType === this.TRANSITION_CONFIG.TYPES.SLIDE || 
          this.transitionType === this.TRANSITION_CONFIG.TYPES.FLIP) {
        const directionClass = direction === 'next' 
          ? cssClasses.states[`${this.transitionType}Next`]
          : cssClasses.states[`${this.transitionType}Prev`];
        if (directionClass) {
          this.containerEl.classList.add(directionClass);
        }
      }

      // Wait for CSS transition to start (using centralized timing)
      await this.delay(this.TRANSITION_CONFIG.TIMING.cssTransitionStart);

          // For flip animations, wait until midpoint to change content for realistic effect
    if (this.transitionType === this.TRANSITION_CONFIG.TYPES.FLIP) {
      // Wait for first half of the flip animation
      const halfDuration = Math.max(50, this.transitionDuration / 2);
      await this.delay(halfDuration - this.TRANSITION_CONFIG.TIMING.cssTransitionStart);
      
      // Change page content at the midpoint of the flip
      await this.renderPage(targetPage);
      
      // Wait for second half of the flip animation
      await this.delay(halfDuration);
    } else if (this.transitionType === this.TRANSITION_CONFIG.TYPES.FADE) {
      // For fade animations, wait for fade-out to complete before changing content
      await this.delay(this.transitionDuration - this.TRANSITION_CONFIG.TIMING.cssTransitionStart);
      
      // Change page content after fade-out is complete
      await this.renderPage(targetPage);
      
      // Remove transitioning class to fade in the new content
      this.containerEl.classList.remove(cssClasses.states.transitioning);
      
      // Wait a small amount for the fade-in to complete
      await this.delay(this.transitionDuration);
    } else {
      // For other transitions (slide), render immediately (original behavior)
      await this.renderPage(targetPage);
      
      // Wait for transition to complete (using actual transition duration)
      await this.delay(this.transitionDuration);
    }

          // Clean up transition classes (using centralized timing)
    await this.delay(this.TRANSITION_CONFIG.TIMING.cleanupDelay);
    
    // For fade transitions, transitioning class is already removed manually
    if (this.transitionType !== this.TRANSITION_CONFIG.TYPES.FADE) {
      this.containerEl.classList.remove(cssClasses.states.transitioning);
    }
    
    // Remove direction-specific classes for all transition types
    this.containerEl.classList.remove(
      cssClasses.states.slideNext,
      cssClasses.states.slidePrev,
      cssClasses.states.flipNext,
      cssClasses.states.flipPrev
    );

    } catch (error) {
      console.error('Error during page transition:', error);
      // Fallback to instant page change
      await this.renderPage(targetPage);
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Preload a specific page for smooth transitions
   */
  async preloadPage(pageNum) {
    if (!this.pdfDoc || pageNum < 1 || pageNum > this.pageCount) return;

    // Check if already preloaded
    if (this.preloadedPages.has(pageNum)) return;

    try {
      const effectiveTheme = (pageNum === 1) ? 'light' : this.currentTheme;
      
      // Check cache first
      const cachedImage = this.cache?.getCachedPage(this.currentPDFId, pageNum, this.scale, effectiveTheme);
      if (cachedImage) {
        this.preloadedPages.set(pageNum, cachedImage);
        return;
      }

      // Render page for preloading
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.scale });
      
      const preloadCanvas = document.createElement('canvas');
      const preloadCtx = preloadCanvas.getContext('2d');
      preloadCanvas.height = viewport.height;
      preloadCanvas.width = viewport.width;

      if (effectiveTheme === 'light') {
        await page.render({
          canvasContext: preloadCtx,
          viewport: viewport
        }).promise;
      } else {
        await this.textRenderer?.analyzeAndRenderPage(page, preloadCanvas, viewport, effectiveTheme);
      }

      const imageData = preloadCtx.getImageData(0, 0, preloadCanvas.width, preloadCanvas.height);
      
      // Cache and store preloaded page
      this.cache?.cacheRenderedPage(this.currentPDFId, pageNum, imageData, this.scale, effectiveTheme);
      this.preloadedPages.set(pageNum, imageData);

    } catch (error) {
      console.warn('Failed to preload page:', pageNum, error);
    }
  }

  /**
   * Preload adjacent pages for smoother navigation
   */
  async preloadAdjacentPages() {
    if (!this.transitionEnabled || !this.pdfDoc) return;

    const preloadPromises = [];
    
    // Preload previous page
    if (this.pageNum > 1) {
      preloadPromises.push(this.preloadPage(this.pageNum - 1));
    }
    
    // Preload next page
    if (this.pageNum < this.pageCount) {
      preloadPromises.push(this.preloadPage(this.pageNum + 1));
    }

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Utility method for creating delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper to compute current numeric scale when this.scale is not a number
  getCurrentNumericScale() {
    if (typeof this.scale === 'number' && !isNaN(this.scale)) {
      return this.scale;
    }

    // Derive from current canvas dimensions vs original PDF viewport
    if (!this.pdfDoc || !this.pageNum) return 1;
    try {
      const page = this.pdfDoc.getPage ? this.pdfDoc.getPageSync?.(this.pageNum) : null;
      // pdf.js v3 has no getPageSync; fallback to async getPage (still okay for scale estimation)
    } catch {}
    // Fallback: approximate using canvas width / container width
    if (this.canvas) {
      const ratio = this.canvas.width / (this.containerEl.clientWidth - 40);
      if (ratio > 0 && isFinite(ratio)) return ratio;
    }
    return 1;
  }

  // Enhanced zoom methods (Phase 1.2)
  async zoomIn(centerPoint = null) {
    if (this.isZoomAnimating) return;
    
    const currentScale = this.getCurrentNumericScale();
    const maxZoomForViewport = this.getMaxZoomForViewportSync();
    const newScale = Math.min(currentScale + this.zoomStep, maxZoomForViewport);
    
    if (newScale === currentScale) return; // Already at max zoom
    
    await this.animatedZoom(newScale, centerPoint, 'zoom-in');
  }

  async zoomOut(centerPoint = null) {
    if (this.isZoomAnimating) return;
    
    const currentScale = this.getCurrentNumericScale();
    const newScale = Math.max(currentScale - this.zoomStep, this.minZoomLevel);
    
    if (newScale === currentScale) return; // Already at min zoom
    
    await this.animatedZoom(newScale, centerPoint, 'zoom-out');
  }

  /**
   * Enhanced animated zoom with smooth transitions and position maintenance
   */
  async animatedZoom(targetScale, centerPoint = null, zoomType = 'zoom') {
    if (this.isZoomAnimating || !this.pdfDoc) return;
    
    this.isZoomAnimating = true;
    const startScale = this.getCurrentNumericScale();
    
    // Store current scroll position if maintaining position
    if (this.maintainPositionOnZoom) {
      this.storeScrollPosition();
    }
    
    // Set zoom center point
    if (centerPoint) {
      this.zoomCenterPoint = centerPoint;
      this.setZoomOrigin(centerPoint);
    }
    
    // Show zoom indicator immediately
    this.showZoomIndicator(targetScale, zoomType);
    
    try {
      if (this.smoothZoomAnimations) {
        await this.performAnimatedZoomTransition(targetScale, startScale, centerPoint);
      } else {
        // Direct zoom without animation
        this.scale = targetScale;
    this.fitMode = 'custom';
        await this.performZoom();
      }
      
      // Restore position if enabled
      if (this.maintainPositionOnZoom && centerPoint) {
        this.restoreScrollPositionWithCenter(centerPoint, startScale, targetScale);
      }
      
    } finally {
      this.isZoomAnimating = false;
    }
  }

  /**
   * Perform animated zoom transition with canvas overlay
   */
  async performAnimatedZoomTransition(targetScale, startScale, centerPoint) {
    if (!this.canvas || !this.containerEl) return;
    
    // Store original container overflow and transition classes for restoration
    const originalOverflow = this.containerEl.style.overflow;
    const originalOverflowX = this.containerEl.style.overflowX;
    const originalOverflowY = this.containerEl.style.overflowY;
    
    // ENHANCED: More comprehensive transition class preservation for Issue 3
    const transitionClasses = Array.from(this.containerEl.classList).filter(cls => 
      cls.startsWith('transition-') || 
      cls === 'transitioning' || 
      cls.includes('slide') || 
      cls.includes('flip') || 
      cls.includes('fade') ||
      cls === 'slide-next' ||
      cls === 'slide-prev' ||
      cls === 'flip-next' ||
      cls === 'flip-prev'
    );
    
    // Temporarily disable container scrolling during animation to prevent scroll slider issues
    this.containerEl.style.overflow = 'hidden';
    
    // Create overlay container for animation
    const animationContainer = document.createElement('div');
    animationContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
      background: transparent;
    `;
    
    // Clone current canvas for animation
    const oldCanvas = document.createElement('canvas');
    const oldCtx = oldCanvas.getContext('2d');
    oldCanvas.width = this.canvas.width;
    oldCanvas.height = this.canvas.height;
    oldCtx.drawImage(this.canvas, 0, 0);
    
    // Style the old canvas to match current position
    oldCanvas.style.cssText = `
      position: absolute;
      max-width: 100%;
      height: auto;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: opacity ${this.zoomAnimationDuration}ms ease-in-out,
                  transform ${this.zoomAnimationDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1);
      box-shadow: 0 4px 12px var(--shadow-strong);
      border-radius: 4px;
      background-color: var(--canvas-bg);
      opacity: 1;
    `;
    
    // Add transform origin if center point is specified
    if (centerPoint) {
      const originX = (centerPoint.x * 100).toFixed(1);
      const originY = (centerPoint.y * 100).toFixed(1);
      oldCanvas.style.transformOrigin = `${originX}% ${originY}%`;
    }
    
    animationContainer.appendChild(oldCanvas);
    this.containerEl.appendChild(animationContainer);
    
    // ISSUE 2 FIX: Hide original canvas completely and ensure it stays hidden
    const originalCanvasDisplay = this.canvas.style.display;
    this.canvas.style.opacity = '0';
    this.canvas.style.visibility = 'hidden';
    this.canvas.style.transition = '';
    
    try {
      // Update scale and render new content (off-screen)
      this.scale = targetScale;
    this.fitMode = 'custom';
      
      // Render new zoom level (this will update the hidden canvas)
      await this.renderPage(this.pageNum);
      
      // ISSUE 2 FIX: Add a small delay to ensure render is complete before animation
      await this.delay(50);
      
      // Calculate scale transformation for animation
      const scaleRatio = targetScale / startScale;
      
      // ISSUE 2 FIX: Start animation with proper sequencing
      // First, ensure old canvas is fully visible and positioned
      await this.delay(16); // Wait one frame
      
      // Start fade-out and scale animation on old canvas
      oldCanvas.style.opacity = '0';
      oldCanvas.style.transform = `translate(-50%, -50%) scale(${scaleRatio})`;
      
      // Wait for fade-out to complete entirely
      await this.delay(this.zoomAnimationDuration + 50);
      
      // ISSUE 2 FIX: Now show new canvas with careful timing
      this.canvas.style.visibility = 'visible';
      this.canvas.style.transition = `opacity ${Math.max(100, this.zoomAnimationDuration / 2)}ms ease-in-out`;
      this.canvas.style.opacity = '1';
      
      // Wait for fade-in to complete
      await this.delay(Math.max(100, this.zoomAnimationDuration / 2) + 50);
      
    } finally {
      // Cleanup animation elements
      if (animationContainer.parentNode) {
        animationContainer.remove();
      }
      
      // Restore canvas styles
      this.canvas.style.display = originalCanvasDisplay;
      // Remove inline styles that could override future page transitions (Issue 3)
      this.canvas.style.removeProperty('opacity');
      this.canvas.style.visibility = 'visible';
      this.canvas.style.removeProperty('transition');
      
      // Restore container overflow settings
      this.containerEl.style.overflow = originalOverflow;
      this.containerEl.style.overflowX = originalOverflowX;
      this.containerEl.style.overflowY = originalOverflowY;
      
      // ISSUE 3 FIX: Enhanced transition class restoration
      // First, ensure all necessary classes are restored
      transitionClasses.forEach(className => {
        if (!this.containerEl.classList.contains(className)) {
          this.containerEl.classList.add(className);
        }
      });
      
      // Wait a frame to ensure DOM updates are applied
      await this.delay(16);
      
      // Update zoom CSS and UI
      this.updateZoomCSS();
      this.updateZoomDisplay();
      this.savePreferences();
    }
  }

  /**
   * Smart double-tap zoom functionality
   */
  async smartZoom(tapPoint) {
    if (!this.smartZoomEnabled || this.isZoomAnimating) return;
    
    const currentScale = this.getCurrentNumericScale();
    const maxZoomForViewport = this.getMaxZoomForViewportSync();
    let targetScale;
    let zoomType = 'smart-zoom';
    
    // Determine target zoom level based on mode and current scale
    switch (this.doubleTapZoomMode) {
      case 'text-width':
        targetScale = Math.min(this.textZoomLevel, maxZoomForViewport);
        break;
        
      case 'fit-width':
        targetScale = 'fit-width';
        break;
        
      case 'smart':
      default:
        // Smart zoom logic: cycle through fit-width -> text zoom -> fit-width
        if (this.fitMode === 'width' || currentScale <= 1.1) {
          targetScale = Math.min(this.textZoomLevel, maxZoomForViewport);
          zoomType = 'smart-zoom-in';
        } else if (currentScale >= Math.min(this.textZoomLevel, maxZoomForViewport) * 0.9) {
          targetScale = 'fit-width';
          zoomType = 'smart-zoom-out';
        } else {
          targetScale = Math.min(this.textZoomLevel, maxZoomForViewport);
          zoomType = 'smart-zoom-in';
        }
        break;
    }
    
    // Apply smart zoom
    if (targetScale === 'fit-width') {
      await this.animatedFitToWidth();
    } else {
      await this.animatedZoom(targetScale, tapPoint, zoomType);
    }
  }

  fitToWidth() {
    this.fitMode = 'width';
    this.scale = 'fit-width';
    this.updateViewAfterZoom();
  }

  /**
   * Enhanced animated fit to width (Phase 1.2)
   */
  async animatedFitToWidth() {
    if (this.isZoomAnimating) return;
    
    this.isZoomAnimating = true;
    
    // Show zoom indicator immediately
    this.showZoomIndicator('fit-width', 'fit-width');
    
    try {
      if (this.smoothZoomAnimations) {
        await this.performAnimatedFitToWidth();
      } else {
        // Direct fit to width without animation
        this.fitMode = 'width';
        this.scale = 'fit-width';
        await this.performZoom();
      }
    } finally {
      this.isZoomAnimating = false;
    }
  }

  /**
   * Perform animated fit to width transition
   */
  async performAnimatedFitToWidth() {
    if (!this.canvas || !this.containerEl) return;
    
    // Store original container overflow and transition classes for restoration
    const originalOverflow = this.containerEl.style.overflow;
    const originalOverflowX = this.containerEl.style.overflowX;
    const originalOverflowY = this.containerEl.style.overflowY;
    
    // ENHANCED: More comprehensive transition class preservation for Issue 3
    const transitionClasses = Array.from(this.containerEl.classList).filter(cls => 
      cls.startsWith('transition-') || 
      cls === 'transitioning' || 
      cls.includes('slide') || 
      cls.includes('flip') || 
      cls.includes('fade') ||
      cls === 'slide-next' ||
      cls === 'slide-prev' ||
      cls === 'flip-next' ||
      cls === 'flip-prev'
    );
    
    // Temporarily disable container scrolling during animation to prevent scroll slider issues
    this.containerEl.style.overflow = 'hidden';
    
    // Calculate target scale for fit-width
    const currentPage = await this.pdfDoc.getPage(this.pageNum);
    const baseViewport = currentPage.getViewport({ scale: 1 });
    const containerWidth = this.containerEl.clientWidth - 40;
    const targetScale = containerWidth / baseViewport.width;
    const startScale = this.getCurrentNumericScale();
    
    // Create overlay container for animation
    const animationContainer = document.createElement('div');
    animationContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
      background: transparent;
    `;
    
    // Clone current canvas for animation
    const oldCanvas = document.createElement('canvas');
    const oldCtx = oldCanvas.getContext('2d');
    oldCanvas.width = this.canvas.width;
    oldCanvas.height = this.canvas.height;
    oldCtx.drawImage(this.canvas, 0, 0);
    
    // Style the old canvas to match current position
    oldCanvas.style.cssText = `
      position: absolute;
      max-width: 100%;
      height: auto;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: opacity ${this.zoomAnimationDuration}ms ease-in-out,
                  transform ${this.zoomAnimationDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1);
      box-shadow: 0 4px 12px var(--shadow-strong);
      border-radius: 4px;
      background-color: var(--canvas-bg);
      opacity: 1;
    `;
    
    animationContainer.appendChild(oldCanvas);
    this.containerEl.appendChild(animationContainer);
    
    // ISSUE 2 FIX: Hide original canvas completely and ensure it stays hidden
    const originalCanvasDisplay = this.canvas.style.display;
    this.canvas.style.opacity = '0';
    this.canvas.style.visibility = 'hidden';
    this.canvas.style.transition = '';
    
    try {
      // Apply fit to width
      this.fitMode = 'width';
      this.scale = 'fit-width';
      
      // Render new fit-to-width content (off-screen)
      await this.renderPage(this.pageNum);
      
      // ISSUE 2 FIX: Add a small delay to ensure render is complete before animation
      await this.delay(50);
      
      // Calculate scale transformation for animation
      const scaleRatio = targetScale / startScale;
      
      // ISSUE 2 FIX: Start animation with proper sequencing
      // First, ensure old canvas is fully visible and positioned
      await this.delay(16); // Wait one frame
      
      // Start fade-out and scale animation on old canvas
      oldCanvas.style.opacity = '0';
      oldCanvas.style.transform = `translate(-50%, -50%) scale(${scaleRatio})`;
      
      // Wait for fade-out to complete entirely
      await this.delay(this.zoomAnimationDuration + 50);
      
      // ISSUE 2 FIX: Now show new canvas with careful timing
      this.canvas.style.visibility = 'visible';
      this.canvas.style.transition = `opacity ${Math.max(100, this.zoomAnimationDuration / 2)}ms ease-in-out`;
      this.canvas.style.opacity = '1';
      
      // Wait for fade-in to complete
      await this.delay(Math.max(100, this.zoomAnimationDuration / 2) + 50);
      
    } finally {
      // Cleanup animation elements
      if (animationContainer.parentNode) {
        animationContainer.remove();
      }
      
      // Restore canvas styles
      this.canvas.style.display = originalCanvasDisplay;
      // Remove inline styles that could override future page transitions (Issue 3)
      this.canvas.style.removeProperty('opacity');
      this.canvas.style.visibility = 'visible';
      this.canvas.style.removeProperty('transition');
      
      // Restore container overflow settings
      this.containerEl.style.overflow = originalOverflow;
      this.containerEl.style.overflowX = originalOverflowX;
      this.containerEl.style.overflowY = originalOverflowY;
      
      // ISSUE 3 FIX: Enhanced transition class restoration
      // First, ensure all necessary classes are restored
      transitionClasses.forEach(className => {
        if (!this.containerEl.classList.contains(className)) {
          this.containerEl.classList.add(className);
        }
      });
      
      // Wait a frame to ensure DOM updates are applied
      await this.delay(16);
      
      // Update zoom CSS and UI
      this.updateZoomCSS();
      this.updateZoomDisplay();
      this.savePreferences();
    }
  }

  /**
   * Store current scroll position for position maintenance
   */
  storeScrollPosition() {
    if (this.containerEl) {
      this.preZoomScrollPosition = {
        x: this.containerEl.scrollLeft,
        y: this.containerEl.scrollTop
      };
    }
  }

  /**
   * Restore scroll position with center point consideration
   */
  restoreScrollPositionWithCenter(centerPoint, oldScale, newScale) {
    if (!this.containerEl || !centerPoint) return;
    
    const scaleRatio = newScale / oldScale;
    const containerRect = this.containerEl.getBoundingClientRect();
    
    // Calculate new scroll position to maintain the center point
    const centerX = centerPoint.x * containerRect.width;
    const centerY = centerPoint.y * containerRect.height;
    
    const newScrollX = (this.preZoomScrollPosition.x + centerX) * scaleRatio - centerX;
    const newScrollY = (this.preZoomScrollPosition.y + centerY) * scaleRatio - centerY;
    
    this.containerEl.scrollTo({
      left: Math.max(0, newScrollX),
      top: Math.max(0, newScrollY),
      behavior: 'auto'
    });
  }

  /**
   * Set CSS transform origin for zoom animations
   */
  setZoomOrigin(centerPoint) {
    if (!this.containerEl) return;
    
    const originX = (centerPoint.x * 100).toFixed(1);
    const originY = (centerPoint.y * 100).toFixed(1);
    
    this.containerEl.style.setProperty('--zoom-origin', `${originX}% ${originY}%`);
  }



  /**
   * Show zoom level indicator
   */
  showZoomIndicator(scale, zoomType = 'zoom') {
    let displayText;
    
    if (scale === 'fit-width') {
      displayText = 'Ajustar Largura';
    } else if (typeof scale === 'number') {
      displayText = `${Math.round(scale * 100)}%`;
    } else {
      displayText = 'Zoom';
    }
    
    // Create or update zoom indicator
    let indicator = document.querySelector('.zoom-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'zoom-indicator';
      document.body.appendChild(indicator);
    }
    
    indicator.textContent = displayText;
    indicator.classList.add('visible');
    
    // Hide after delay
    setTimeout(() => {
      indicator.classList.remove('visible');
    }, 1500);
  }

  /**
   * Perform the actual zoom operation
   */
  async performZoom() {
    // Update zoom display immediately
    this.updateZoomDisplay();
    
    // Save preferences when zoom changes
    this.savePreferences();
    
    // Update zoom CSS and overflow management
    this.updateZoomCSS();
    
    if (this.viewMode === 'continuous' && this.virtualScrolling) {
      // Store current page and scroll information for precise restoration
      const currentPage = this.pageNum;
      const scrollTop = this.containerEl.scrollTop;
      const pageHeight = this.virtualScrolling.pageHeight;
      
      // Calculate the current page's relative scroll position
      const pageStart = (currentPage - 1) * pageHeight;
      const relativePageOffset = scrollTop - pageStart;
      const relativePagePercent = relativePageOffset / pageHeight;
      
      // Re-render continuous view with new scale
      await this.renderContinuousView();
      
      // Restore position more precisely based on current page
      setTimeout(() => {
        const newPageHeight = this.virtualScrolling.pageHeight;
        const newPageStart = (currentPage - 1) * newPageHeight;
        const newScrollTop = newPageStart + (relativePagePercent * newPageHeight);
        
        this.containerEl.scrollTop = Math.max(0, newScrollTop);
        
        // Ensure current page is updated
        this.pageNum = currentPage;
        this.updateUI();
        
        // Update overflow after continuous view is rendered
        this.updateContainerOverflow();
      }, 150);
    } else {
      // Standard page mode rendering
      await this.renderPage(this.pageNum);
      
      // Update overflow after page is rendered
      setTimeout(() => {
        this.updateContainerOverflow();
      }, 50);
    }
  }

  updateViewAfterZoom() {
    // Update zoom display immediately for better responsiveness
    this.updateZoomDisplay();
    
    // Save preferences when zoom changes
    this.savePreferences();
    
    // Update zoom CSS and overflow management
    this.updateZoomCSS();
    
    if (this.viewMode === 'continuous' && this.virtualScrolling) {
      // Store current page and scroll information for precise restoration
      const currentPage = this.pageNum;
      const scrollTop = this.containerEl.scrollTop;
      const pageHeight = this.virtualScrolling.pageHeight;
      
      // Calculate the current page's relative scroll position
      const pageStart = (currentPage - 1) * pageHeight;
      const relativePageOffset = scrollTop - pageStart;
      const relativePagePercent = relativePageOffset / pageHeight;
      
      // Re-render continuous view with new scale
      this.renderContinuousView().then(() => {
        // Restore position more precisely based on current page
        setTimeout(() => {
          const newPageHeight = this.virtualScrolling.pageHeight;
          const newPageStart = (currentPage - 1) * newPageHeight;
          const newScrollTop = newPageStart + (relativePagePercent * newPageHeight);
          
          this.containerEl.scrollTop = Math.max(0, newScrollTop);
          
          // Ensure current page is updated
          this.pageNum = currentPage;
          this.updateUI();
          
          // Update overflow after continuous view is rendered
          this.updateContainerOverflow();
        }, 150);
      });
    } else {
      // Standard page mode rendering
      this.renderPage(this.pageNum).then(() => {
        // Update overflow after page is rendered
        setTimeout(() => {
          this.updateContainerOverflow();
        }, 50);
      });
    }
  }

  savePreferences() {
    if (this.preferences) {
      this.preferences.savePreferences({
        zoom: this.scale,
        fitMode: this.fitMode,
        viewMode: this.viewMode,
        theme: this.currentTheme,
        // Phase 1.1 - Transition preferences
        transitionType: this.transitionType,
        transitionDuration: this.transitionDuration,
        transitionEnabled: this.transitionEnabled,
        // Phase 1.2 - Enhanced zoom preferences
        smoothZoomAnimations: this.smoothZoomAnimations,
        zoomAnimationDuration: this.zoomAnimationDuration,
        smartZoomEnabled: this.smartZoomEnabled,
        textZoomLevel: this.textZoomLevel,
        maxZoomLevel: this.maxZoomLevel,
        minZoomLevel: this.minZoomLevel,
        zoomStep: this.zoomStep,
        pinchSensitivity: this.pinchSensitivity,
        doubleTapZoomMode: this.doubleTapZoomMode,
        maintainPositionOnZoom: this.maintainPositionOnZoom
      });
    }
  }

  // Enhanced reading controls
  fitToHeight() {
    if (!this.pdfDoc || !this.containerEl) return;
    
    this.fitMode = 'height';
    
    // Calculate scale to fit page height to container
    this.pdfDoc.getPage(this.pageNum).then(page => {
      const viewport = page.getViewport({ scale: 1 });
      
      // Use different height calculation based on view mode
      let containerHeight;
      if (this.viewMode === 'continuous') {
        // In continuous mode, use full container height
        containerHeight = this.containerEl.clientHeight - 60; // Account for scrollbar and padding
      } else {
        // In page mode, account for controls
        containerHeight = this.containerEl.clientHeight - 40;
      }
      
      const calculatedScale = containerHeight / viewport.height;
      this.scale = Math.min(Math.max(calculatedScale, 0.25), 5);
      this.updateViewAfterZoom();
    });
  }

  toggleViewMode() {
    const previousMode = this.viewMode;
    this.viewMode = this.viewMode === 'page' ? 'continuous' : 'page';
    
    console.log(`PDF Viewer - Switching view mode from ${previousMode} to ${this.viewMode}`);
    
    try {
      if (this.viewMode === 'continuous') {
        this.enableContinuousMode();
      } else {
        this.enablePageMode();
      }
      
      this.updateViewModeUI();
      this.savePreferences(); // Save view mode preference
    } catch (error) {
      console.error('Error switching view mode:', error);
      // Revert to previous mode on error
      this.viewMode = previousMode;
      this.updateViewModeUI();
    }
  }

  enableContinuousMode() {
    console.log('PDF Viewer - Enabling continuous mode');
    
    // Mark that we're switching modes
    this.isSwitchingModes = true;
    
    // Store current page before switching to preserve position
    const currentPageBeforeSwitch = this.pageNum;
    
    // Load zoom preference for continuous mode
    this.loadZoomPreference();
    
    // Set up continuous scrolling container
    this.containerEl.style.overflowY = 'auto';
    this.containerEl.style.overflowX = 'hidden';
    this.containerEl.style.scrollBehavior = 'smooth';
    this.containerEl.classList.add('continuous-mode');
    
    // Store current canvas reference for later restoration
    this.originalCanvas = this.canvas;
    this.originalCtx = this.ctx;
    
    // Render all pages in continuous view and then scroll to current page
    this.renderContinuousView().then(() => {
      // Scroll to the current page position after rendering is complete
      this.scrollToPageInContinuousMode(currentPageBeforeSwitch);
      
      // Reset mode switching flag after a brief delay
      setTimeout(() => {
        this.isSwitchingModes = false;
      }, 300);
    });
  }

  enablePageMode() {
    console.log('PDF Viewer - Enabling page mode');
    
    // Mark that we're switching modes
    this.isSwitchingModes = true;
    
    // Store the current page from continuous mode before cleanup
    const currentPageFromContinuous = this.pageNum;
    
    // Load zoom preference for page mode
    this.loadZoomPreference();
    
    // Clean up virtual scrolling if it exists
    if (this.virtualScrolling && this.virtualScrolling.cleanup) {
      this.virtualScrolling.cleanup();
      this.virtualScrolling = null;
    }
    
    // Disconnect page observer if it exists (legacy)
    if (this.pageObserver) {
      this.pageObserver.disconnect();
      this.pageObserver = null;
    }
    
    // Reset to single page view
    this.containerEl.style.overflowY = 'auto';
    this.containerEl.style.overflowX = 'auto';
    this.containerEl.style.scrollBehavior = 'auto';
    this.containerEl.classList.remove('continuous-mode');
    
    // Clear any existing continuous view and render current page
    this.containerEl.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.id = 'pdfCanvas';
    this.containerEl.appendChild(canvas);
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Ensure we render the correct page that was visible in continuous mode
    this.pageNum = currentPageFromContinuous;
    
    console.log(`PDF Viewer - Rendering page ${this.pageNum} in page mode`);
    this.renderPage(this.pageNum).then(() => {
      // Reset mode switching flag after rendering is complete
      setTimeout(() => {
        this.isSwitchingModes = false;
      }, 100);
    });
  }

  async renderContinuousView() {
    if (!this.pdfDoc) return;
    
    console.log('PDF Viewer - Rendering continuous view with virtual scrolling for', this.pageCount, 'pages');
    
    // Clear container
    this.containerEl.innerHTML = '';
    
    // Initialize virtual scrolling properties
    this.virtualScrolling = {
      renderBuffer: 2, // Number of pages to render before/after visible area
      pageHeight: 800, // Estimated page height (will be updated)
      visiblePages: new Set(),
      renderedPages: new Map(),
      totalHeight: 0,
      containerHeight: 0,
      scrollTop: 0
    };
    
    // Calculate effective scale for all pages
    let effectiveScale = this.scale;
    if (this.scale === 'fit-width' || this.fitMode === 'width') {
      const firstPage = await this.pdfDoc.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      const containerWidth = this.containerEl.clientWidth - 80;
      effectiveScale = Math.min(containerWidth / viewport.width, 3.0);
    }
    
    // Calculate accurate page height based on first page
    const firstPage = await this.pdfDoc.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: effectiveScale });
    this.virtualScrolling.pageHeight = firstViewport.height + 30; // Add gap
    this.virtualScrolling.totalHeight = this.virtualScrolling.pageHeight * this.pageCount;
    
    // Create virtual scroll container
    const virtualContainer = document.createElement('div');
    virtualContainer.className = 'virtual-scroll-container';
    virtualContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: ${this.virtualScrolling.totalHeight}px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    // Create viewport for rendered pages
    const viewport = document.createElement('div');
    viewport.className = 'virtual-viewport';
    viewport.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      pointer-events: none;
    `;
    
    virtualContainer.appendChild(viewport);
    this.containerEl.appendChild(virtualContainer);
    
    // Store references
    this.virtualScrolling.container = virtualContainer;
    this.virtualScrolling.viewport = viewport;
    this.virtualScrolling.effectiveScale = effectiveScale;
    
    // Set up virtual scroll event listener
    this.setupVirtualScrolling();
    
    // Initial render of visible pages
    this.updateVirtualScrolling();
    
    console.log('PDF Viewer - Virtual continuous view setup complete');
    
    // Return a promise for the zoom restoration
    return Promise.resolve();
  }

  setupVirtualScrolling() {
    // Throttled scroll handler for better performance
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.updateVirtualScrolling();
      }, 16); // ~60fps
    };
    
    this.containerEl.addEventListener('scroll', handleScroll);
    
    // Store cleanup function
    this.virtualScrolling.cleanup = () => {
      this.containerEl.removeEventListener('scroll', handleScroll);
    };
  }

  updateVirtualScrolling() {
    if (!this.virtualScrolling || !this.virtualScrolling.container || !this.pdfDoc) return;
    
    const containerRect = this.containerEl.getBoundingClientRect();
    const scrollTop = this.containerEl.scrollTop;
    const containerHeight = this.containerEl.clientHeight;
    
    // Calculate which pages should be visible
    const startPage = Math.max(1, Math.floor(scrollTop / this.virtualScrolling.pageHeight) + 1);
    const endPage = Math.min(this.pageCount, Math.ceil((scrollTop + containerHeight) / this.virtualScrolling.pageHeight) + 1);
    
    // Add buffer pages
    const bufferStart = Math.max(1, startPage - this.virtualScrolling.renderBuffer);
    const bufferEnd = Math.min(this.pageCount, endPage + this.virtualScrolling.renderBuffer);
    
    // Update current page based on most visible page in viewport
    // Use the page that occupies the most space in the top 1/3 of the viewport
    const detectionY = scrollTop + containerHeight * 0.33;
    const detectedPage = Math.min(this.pageCount, Math.max(1, Math.floor(detectionY / this.virtualScrolling.pageHeight) + 1));
    
    if (detectedPage !== this.pageNum) {
      this.pageNum = detectedPage;
      this.updateUI();
      
      // Update reading session if available
      if (this.readingSession) {
        this.readingSession.updateProgress(this.pageNum, this.pageCount);
      }
    }
    
    // Determine which pages need to be rendered or removed
    const newVisiblePages = new Set();
    for (let pageNum = bufferStart; pageNum <= bufferEnd; pageNum++) {
      newVisiblePages.add(pageNum);
    }
    
    // Remove pages that are no longer visible
    for (const pageNum of this.virtualScrolling.visiblePages) {
      if (!newVisiblePages.has(pageNum)) {
        this.removeVirtualPage(pageNum);
      }
    }
    
    // Add new visible pages
    for (const pageNum of newVisiblePages) {
      if (!this.virtualScrolling.visiblePages.has(pageNum)) {
        this.addVirtualPage(pageNum);
      }
    }
    
    this.virtualScrolling.visiblePages = newVisiblePages;
  }

  async addVirtualPage(pageNum) {
    if (!this.virtualScrolling || this.virtualScrolling.renderedPages.has(pageNum)) return;
    
    try {
      // Create page container
      const pageContainer = document.createElement('div');
      pageContainer.className = 'virtual-page-container';
      pageContainer.dataset.page = pageNum;
      
      const yPosition = (pageNum - 1) * this.virtualScrolling.pageHeight;
      pageContainer.style.cssText = `
        position: absolute;
        top: ${yPosition}px;
        left: 50%;
        transform: translateX(-50%);
        pointer-events: auto;
        margin-bottom: 10px;
      `;
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.style.cssText = `
        box-shadow: 0 4px 12px var(--shadow-strong);
        border-radius: 4px;
        background-color: var(--canvas-bg);
        transition: all 0.3s ease;
        max-width: 100%;
        height: auto;
      `;
      
      // Add page number label
      const pageLabel = document.createElement('div');
      pageLabel.style.cssText = `
        position: absolute;
        top: -25px;
        left: 0;
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 500;
        pointer-events: none;
      `;
      pageLabel.textContent = `Página ${pageNum}`;
      
      pageContainer.appendChild(pageLabel);
      pageContainer.appendChild(canvas);
      this.virtualScrolling.viewport.appendChild(pageContainer);
      
      // Store reference
      this.virtualScrolling.renderedPages.set(pageNum, {
        container: pageContainer,
        canvas: canvas,
        rendered: false
      });
      
      // Render page asynchronously
      await this.renderPageToVirtualCanvas(pageNum, canvas);
      
    } catch (error) {
      console.error(`Error adding virtual page ${pageNum}:`, error);
    }
  }

  removeVirtualPage(pageNum) {
    if (!this.virtualScrolling) return;
    
    const pageData = this.virtualScrolling.renderedPages.get(pageNum);
    if (pageData && pageData.container) {
      pageData.container.remove();
      this.virtualScrolling.renderedPages.delete(pageNum);
    }
  }

  async renderPageToVirtualCanvas(pageNum, canvas) {
    try {
      const pageData = this.virtualScrolling.renderedPages.get(pageNum);
      if (!pageData || pageData.rendered) return;
      
      const page = await this.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: this.virtualScrolling.effectiveScale });
      
      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // NEW: enforce intrinsic canvas size for virtual canvases
      this.adjustCanvasStyles(canvas);
      
      // Get canvas context
      const ctx = canvas.getContext('2d');
      
      // Use theme-aware rendering (but always light theme for page 1)
      const effectiveTheme = (pageNum === 1) ? 'light' : this.currentTheme;
      
      if (effectiveTheme === 'light') {
        // Standard rendering for light theme
        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;
      } else {
        // Use theme renderer for dark theme
        await this.textRenderer.analyzeAndRenderPage(
          page, 
          canvas, 
          viewport, 
          effectiveTheme
        );
      }
      
      // Cache the rendered page with theme information
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.cache.cacheRenderedPage(this.currentPDFId, pageNum, imageData, this.virtualScrolling.effectiveScale, effectiveTheme);
      
      // Mark as rendered
      pageData.rendered = true;
      
      console.log(`PDF Viewer - Rendered virtual page ${pageNum} with theme ${effectiveTheme}`);
      
    } catch (error) {
      console.error(`Error rendering virtual page ${pageNum}:`, error);
      
      // Show error placeholder
      const ctx = canvas.getContext('2d');
      canvas.width = 400;
      canvas.height = 200;
      
      ctx.fillStyle = 'var(--bg-tertiary)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'var(--text-secondary)';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Erro ao carregar página ${pageNum}`, canvas.width / 2, canvas.height / 2);
    }
  }

  updateViewModeUI() {
    const viewModeBtn = document.getElementById('toggleViewMode');
    const mobileViewModeBtn = document.getElementById('mobileViewMode');
    
    const text = this.viewMode === 'continuous' ? '📃 Contínuo' : '📄 Página';
    const title = this.viewMode === 'continuous' ? 'Alternar para modo página' : 'Alternar para modo contínuo';
    
    if (viewModeBtn) {
      viewModeBtn.textContent = text;
      viewModeBtn.title = title;
    }
    if (mobileViewModeBtn) {
      mobileViewModeBtn.textContent = text;
      mobileViewModeBtn.title = title;
    }
    
    console.log(`PDF Viewer - View mode updated to: ${this.viewMode}`);
  }

  // Helper methods for reading session
  extractBookId(url) {
    // Extract book ID from PDF URL or current page
    const urlParams = new URLSearchParams(window.location.search);
    const bookIdFromUrl = urlParams.get('id') || urlParams.get('livro_id');
    
    if (bookIdFromUrl) {
      return bookIdFromUrl;
    }
    
    // Try to extract from URL path or filename
    const pathMatch = url.match(/\/(\d+)[_-]/) || url.match(/livro[_-]?(\d+)/i);
    if (pathMatch) {
      return pathMatch[1];
    }
    
    // Fallback: use a hash of the PDF URL
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  }

  async getUserId() {
    try {
      // Try to get user ID from session API
      const response = await fetch('/session');
      if (response.ok) {
        const data = await response.json();
        return data.userId;
      }
    } catch (error) {
      console.log('Could not fetch user session:', error);
    }
    
    // Fallback: generate or get anonymous user ID
    let anonymousId = localStorage.getItem('pdf_reader_user_id');
    if (!anonymousId) {
      anonymousId = 'anon_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('pdf_reader_user_id', anonymousId);
    }
    return anonymousId;
  }

  // Add method to go to specific page (used by reading session resume)
  goToPage(pageNumber) {
    console.log(`PDF Viewer - goToPage called with pageNumber: ${pageNumber}, pageCount: ${this.pageCount}, viewMode: ${this.viewMode}`);
    
    if (pageNumber >= 1 && pageNumber <= this.pageCount) {
      if (this.viewMode === 'continuous' && this.virtualScrolling) {
        console.log('Using continuous mode navigation');
        this.scrollToPageInContinuousMode(pageNumber);
      } else {
        // Direct page mode navigation without animation
        console.log('Using direct page mode navigation');
        this.renderPage(pageNumber);
      }
      
      // Update reading session in both modes
      if (this.readingSession) {
        this.readingSession.updateProgress(pageNumber, this.pageCount);
      }
    } else {
      console.warn(`Invalid page number: ${pageNumber}. Must be between 1 and ${this.pageCount}`);
    }
  }

  scrollToPageInContinuousMode(pageNumber) {
    if (!this.virtualScrolling || pageNumber < 1 || pageNumber > this.pageCount) return;
    
    // Calculate scroll position for the target page
    // Use a small offset to position the page nicely in the viewport
    const pageOffset = 20; // Small top padding
    const targetY = Math.max(0, (pageNumber - 1) * this.virtualScrolling.pageHeight - pageOffset);
    
    // Use smooth scrolling, but disable it temporarily if we're switching modes
    // to avoid jarring transitions
    const shouldUseSmooth = !this.isSwitchingModes;
    
    this.containerEl.scrollTo({
      top: targetY,
      behavior: shouldUseSmooth ? 'smooth' : 'auto'
    });
    
    // Update current page number immediately
    this.pageNum = pageNumber;
    this.updateUI();
  }

  // Enhanced Cleanup method
  cleanup() {
    // Clean up virtual scrolling
    if (this.virtualScrolling && this.virtualScrolling.cleanup) {
      this.virtualScrolling.cleanup();
      this.virtualScrolling = null;
    }
    
    // Disconnect page observer (legacy)
    if (this.pageObserver) {
      this.pageObserver.disconnect();
      this.pageObserver = null;
    }
    
    // Clean up system theme listener
    if (this.systemThemeCleanup) {
      this.systemThemeCleanup();
      this.systemThemeCleanup = null;
    }
    
    // Clean up time-based theme watcher
    if (this.timeBasedThemeInterval) {
      clearInterval(this.timeBasedThemeInterval);
      this.timeBasedThemeInterval = null;
    }
    
    if (this.readingSession) {
      this.readingSession.cleanup();
    }
    if (this.tableOfContents) {
      this.tableOfContents.cleanup();
    }
    if (this.pdfSearch) {
      this.pdfSearch.cleanup();
    }
    if (this.adaptiveLayout) {
      this.adaptiveLayout.cleanup();
    }
  }

  // Force re-render current view (used for theme changes)
  forceRerenderCurrentView() {
    if (!this.pdfDoc) return;
    
    if (this.viewMode === 'page') {
      // Force re-render current page
      this.renderPage(this.pageNum);
    } else if (this.viewMode === 'continuous' && this.virtualScrolling) {
      // Re-render all visible pages in continuous mode
      this.virtualScrolling.renderedPages.forEach((pageData, pageNum) => {
        if (pageData && pageData.canvas) {
          // Mark as not rendered to force fresh render with new theme
          pageData.rendered = false;
          this.renderPageToVirtualCanvas(pageNum, pageData.canvas);
        }
      });
    }
  }

  /**
   * Update container CSS when switching between preset fit modes and custom zoom
   * Carefully preserves transition classes to avoid interfering with page transitions
   */
  updateZoomCSS() {
    if (!this.containerEl) return;

    // ISSUE 3 FIX: Enhanced and more comprehensive transition class preservation
    const transitionClasses = Array.from(this.containerEl.classList).filter(cls => 
      cls.startsWith('transition-') || 
      cls === 'transitioning' || 
      cls.includes('slide') || 
      cls.includes('flip') || 
      cls.includes('fade') ||
      cls === 'slide-next' ||
      cls === 'slide-prev' ||
      cls === 'flip-next' ||
      cls === 'flip-prev' ||
      // Additional specific transition-related classes
      cls === 'no-transition' ||
      cls === 'zoom-custom' ||
      cls === 'continuous-mode'
    );

    // Apply zoom-specific classes
    if (this.fitMode === 'custom') {
      this.containerEl.classList.add(this.ZOOM_CUSTOM_CLASS);
    } else {
      this.containerEl.classList.remove(this.ZOOM_CUSTOM_CLASS);
    }

    // ISSUE 3 FIX: Ensure all transition classes are properly restored
    // Use requestAnimationFrame to ensure this happens after any DOM manipulations
    requestAnimationFrame(() => {
      transitionClasses.forEach(className => {
        if (!this.containerEl.classList.contains(className)) {
          this.containerEl.classList.add(className);
          console.log(`Restored transition class: ${className}`);
        }
      });
      
      // Verify the transition system is still active
      this.ensureTransitionSystemActive();
    });

    // Update overflow settings based on zoom level and fit mode
    this.updateContainerOverflow();
  }

  /**
   * ISSUE 3 FIX: Additional method to ensure transition system remains active
   */
  ensureTransitionSystemActive() {
    if (!this.containerEl || !this.transitionEnabled) return;
    
    // Ensure the correct transition type CSS class is applied
    const expectedTransitionClass = this.TRANSITION_CONFIG.CSS_CLASSES.container[this.transitionType];
    if (expectedTransitionClass && !this.containerEl.classList.contains(expectedTransitionClass)) {
      this.containerEl.classList.add(expectedTransitionClass);
      console.log(`Re-applied transition class: ${expectedTransitionClass}`);
    }
    
    // Ensure transition duration CSS property is set
    const currentDuration = this.containerEl.style.getPropertyValue('--transition-duration');
    const expectedDuration = `${this.transitionDuration}ms`;
    if (currentDuration !== expectedDuration) {
      this.containerEl.style.setProperty('--transition-duration', expectedDuration);
      console.log(`Re-applied transition duration: ${expectedDuration}`);
    }
  }

  /**
   * Update container overflow settings based on current zoom level and fit mode
   * Ensures proper scrolling behavior when content exceeds container dimensions
   */
  updateContainerOverflow() {
    if (!this.containerEl || !this.canvas) return;

    // Get current scale and container dimensions (accounting for padding)
    const currentScale = this.getCurrentNumericScale();
    const containerStyle = getComputedStyle(this.containerEl);
    const containerPaddingX = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
    const containerPaddingY = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);
    
    const containerWidth = this.containerEl.clientWidth - containerPaddingX;
    const containerHeight = this.containerEl.clientHeight - containerPaddingY;
    
    // Get actual rendered canvas dimensions
    const canvasRect = this.canvas.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    // Determine if content exceeds container dimensions
    const contentExceedsWidth = canvasWidth > containerWidth;
    const contentExceedsHeight = canvasHeight > containerHeight;
    const contentExceedsContainer = contentExceedsWidth || contentExceedsHeight;

    // Apply CSS classes for positioning behavior
    if (contentExceedsContainer) {
      this.containerEl.classList.add('content-exceeds-container');
      this.containerEl.classList.remove('content-fits-container');
    } else {
      this.containerEl.classList.add('content-fits-container');
      this.containerEl.classList.remove('content-exceeds-container');
    }

    // Set overflow based on content size and zoom level
    if (this.fitMode === 'width') {
      // For fit-to-width, hide horizontal overflow but allow vertical when content exceeds height
      this.containerEl.style.overflowX = 'hidden';
      this.containerEl.style.overflowY = contentExceedsHeight ? 'auto' : 'hidden';
    } else if (this.fitMode === 'custom' && currentScale <= 1.0 && !contentExceedsContainer) {
      // For small zoom levels where content fits completely, hide both scrollbars
      this.containerEl.style.overflowX = 'hidden';
      this.containerEl.style.overflowY = 'hidden';
    } else if (this.fitMode === 'custom' && (currentScale > 1.0 || contentExceedsContainer)) {
      // For custom zoom above 100% or when content exceeds container, allow scrolling where needed
      this.containerEl.style.overflowX = contentExceedsWidth ? 'auto' : 'hidden';
      this.containerEl.style.overflowY = contentExceedsHeight ? 'auto' : 'hidden';
      
      // Ensure we can scroll to all parts of the enlarged content
      if (contentExceedsContainer) {
        // Force a reflow to ensure scroll dimensions are updated
        this.containerEl.scrollTop = this.containerEl.scrollTop;
        this.containerEl.scrollLeft = this.containerEl.scrollLeft;
      }
    } else {
      // Default behavior for other fit modes
      this.containerEl.style.overflowX = 'hidden';
      this.containerEl.style.overflowY = contentExceedsHeight ? 'auto' : 'hidden';
    }

    // In continuous mode, ensure smooth vertical scrolling
    if (this.viewMode === 'continuous') {
      this.containerEl.style.scrollBehavior = 'smooth';
    }

    // Ensure scroll position is valid after overflow changes
    this.ensureValidScrollPosition();
  }

  /**
   * Ensure the current scroll position is valid and accessible
   */
  ensureValidScrollPosition() {
    if (!this.containerEl) return;

    // Get maximum scroll values
    const maxScrollTop = this.containerEl.scrollHeight - this.containerEl.clientHeight;
    const maxScrollLeft = this.containerEl.scrollWidth - this.containerEl.clientWidth;

    // Clamp scroll position to valid range
    if (this.containerEl.scrollTop > maxScrollTop) {
      this.containerEl.scrollTop = Math.max(0, maxScrollTop);
    }
    if (this.containerEl.scrollLeft > maxScrollLeft) {
      this.containerEl.scrollLeft = Math.max(0, maxScrollLeft);
    }
  }

  /**
   * Adjust canvas styles to ensure proper display at its intrinsic pixel size
   * Allow natural scrolling when content exceeds container dimensions
   */
  adjustCanvasStyles(canvas) {
    if (!canvas) return;
    
    // Always display canvas at its intrinsic pixel size
    // This prevents CSS rules like max-width:100% from interfering with zoom
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    canvas.style.display = 'block';
    
    // Remove any constraint properties that might interfere with scrolling
    canvas.style.maxWidth = 'none';
    canvas.style.maxHeight = 'none';
    
    // Update container overflow after canvas style changes
    // Use setTimeout to ensure the canvas dimensions are applied first
    setTimeout(() => {
      this.updateContainerOverflow();
    }, 0);
  }

  /**
   * Calculate maximum zoom level that fits within viewport horizontally
   */
  getMaxZoomForViewport() {
    if (!this.pdfDoc || !this.pageNum || !this.containerEl) {
      return this.maxZoomLevel; // Fallback to original max zoom
    }

    try {
      // Get container dimensions with some padding for UI elements
      const containerWidth = this.containerEl.clientWidth - 80; // Account for padding and scrollbars
      const containerHeight = this.containerEl.clientHeight - 80;

      // For continuous mode, we need to be more conservative with horizontal space
      const effectiveContainerWidth = this.viewMode === 'continuous' 
        ? containerWidth - 40  // Extra margin for continuous mode
        : containerWidth;

      // Calculate based on current page dimensions
      return new Promise(async (resolve) => {
        try {
          const page = await this.pdfDoc.getPage(this.pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          
          // Calculate max zoom that fits horizontally
          const maxHorizontalZoom = effectiveContainerWidth / baseViewport.width;
          
          // Calculate max zoom that fits vertically (optional constraint)
          const maxVerticalZoom = containerHeight / baseViewport.height;
          
          // Use the more restrictive of horizontal constraint or original max zoom
          // We prioritize horizontal constraint but allow some vertical overflow
          const viewportConstrainedZoom = Math.min(
            maxHorizontalZoom * 0.95, // 5% margin for safety
            this.maxZoomLevel // Don't exceed original maximum
          );

          resolve(Math.max(viewportConstrainedZoom, this.minZoomLevel));
        } catch (error) {
          console.warn('Error calculating viewport-constrained zoom:', error);
          resolve(this.maxZoomLevel);
        }
      });
    } catch (error) {
      console.warn('Error in getMaxZoomForViewport:', error);
      return this.maxZoomLevel;
    }
  }

  /**
   * Synchronous version of getMaxZoomForViewport for immediate use
   */
  getMaxZoomForViewportSync() {
    if (!this.pdfDoc || !this.pageNum || !this.containerEl || !this.canvas) {
      return this.maxZoomLevel;
    }

    try {
      // Get container dimensions with padding
      const containerWidth = this.containerEl.clientWidth - 80;
      
      const effectiveContainerWidth = this.viewMode === 'continuous' 
        ? containerWidth - 40
        : containerWidth;

      // Use current canvas dimensions to estimate page size
      if (this.canvas.width > 0) {
        const currentScale = this.getCurrentNumericScale();
        const basePage = this.canvas.width / currentScale;
        const maxHorizontalZoom = effectiveContainerWidth / basePage;
        
        return Math.max(
          Math.min(maxHorizontalZoom * 0.95, this.maxZoomLevel),
          this.minZoomLevel
        );
      }

      return this.maxZoomLevel;
    } catch (error) {
      console.warn('Error in getMaxZoomForViewportSync:', error);
      return this.maxZoomLevel;
    }
  }

  /**
   * Update viewport constraints and adjust current zoom if necessary
   * Called when the window is resized to prevent horizontal overflow
   */
  updateViewportConstraints() {
    if (!this.pdfDoc || !this.pageNum || !this.containerEl) return;

    try {
      const currentScale = this.getCurrentNumericScale();
      const maxZoomForViewport = this.getMaxZoomForViewportSync();
      
      // If current zoom exceeds new viewport limits, adjust it
      if (currentScale > maxZoomForViewport) {
        console.log(`Adjusting zoom from ${currentScale.toFixed(2)} to ${maxZoomForViewport.toFixed(2)} due to viewport constraints`);
        
        // Smoothly transition to the new maximum zoom level
        this.animatedZoom(maxZoomForViewport, null, 'viewport-constraint');
      } else {
        // Just update the canvas styles to ensure proper display
        if (this.canvas) {
          this.adjustCanvasStyles(this.canvas);
        }
        
        // Update container overflow settings
        this.updateContainerOverflow();
      }
    } catch (error) {
      console.warn('Error updating viewport constraints:', error);
    }
  }

} 