/**
 * Adaptive Layout System - Phase 3: Advanced UI Features
 * Intelligent layout management that responds to screen size, orientation, and device capabilities
 */

export class AdaptiveLayout {
  constructor() {
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
      large: 1440
    };
    
    this.currentBreakpoint = null;
    this.orientation = null;
    this.isTouch = 'ontouchstart' in window;
    this.isRetina = window.devicePixelRatio > 1;
    
    this.resizeTimeout = null;
    this.orientationTimeout = null;
    
    this.callbacks = {
      breakpointChange: [],
      orientationChange: [],
      resize: []
    };
    
    this.init();
  }
  
  init() {
    this.detectInitialState();
    this.setupEventListeners();
    this.applyInitialLayout();
    
    console.log('Adaptive Layout initialized:', {
      breakpoint: this.currentBreakpoint,
      orientation: this.orientation,
      isTouch: this.isTouch,
      isRetina: this.isRetina
    });
  }
  
  detectInitialState() {
    this.currentBreakpoint = this.getCurrentBreakpoint();
    this.orientation = this.getOrientation();
    
    // Add CSS classes to document
    document.documentElement.classList.add(`breakpoint-${this.currentBreakpoint}`);
    document.documentElement.classList.add(`orientation-${this.orientation}`);
    
    if (this.isTouch) {
      document.documentElement.classList.add('touch-device');
    }
    
    if (this.isRetina) {
      document.documentElement.classList.add('retina-display');
    }
  }
  
  setupEventListeners() {
    // Debounced resize handler
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 150);
    });
    
    // Orientation change handler
    window.addEventListener('orientationchange', () => {
      clearTimeout(this.orientationTimeout);
      this.orientationTimeout = setTimeout(() => {
        this.handleOrientationChange();
      }, 300); // Longer delay for orientation changes
    });
    
    // Visual viewport API for mobile browsers
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleViewportChange();
      });
    }
  }
  
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width < this.breakpoints.mobile) {
      return 'mobile';
    } else if (width < this.breakpoints.tablet) {
      return 'tablet';
    } else if (width < this.breakpoints.desktop) {
      return 'desktop';
    } else if (width < this.breakpoints.large) {
      return 'large';
    } else {
      return 'xlarge';
    }
  }
  
  getOrientation() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return width > height ? 'landscape' : 'portrait';
  }
  
  handleResize() {
    const newBreakpoint = this.getCurrentBreakpoint();
    const newOrientation = this.getOrientation();
    
    // Check for breakpoint change
    if (newBreakpoint !== this.currentBreakpoint) {
      this.handleBreakpointChange(this.currentBreakpoint, newBreakpoint);
      this.currentBreakpoint = newBreakpoint;
    }
    
    // Check for orientation change
    if (newOrientation !== this.orientation) {
      this.handleOrientationChange();
      this.orientation = newOrientation;
    }
    
    // Fire resize callbacks
    this.callbacks.resize.forEach(callback => {
      try {
        callback({
          breakpoint: this.currentBreakpoint,
          orientation: this.orientation,
          width: window.innerWidth,
          height: window.innerHeight
        });
      } catch (error) {
        console.error('Adaptive Layout resize callback error:', error);
      }
    });
  }
  
  handleBreakpointChange(oldBreakpoint, newBreakpoint) {
    // Update CSS classes
    if (oldBreakpoint) {
      document.documentElement.classList.remove(`breakpoint-${oldBreakpoint}`);
    }
    document.documentElement.classList.add(`breakpoint-${newBreakpoint}`);
    
    console.log('Breakpoint changed:', oldBreakpoint, '->', newBreakpoint);
    
    // Apply breakpoint-specific layouts
    this.applyBreakpointLayout(newBreakpoint);
    
    // Fire breakpoint change callbacks
    this.callbacks.breakpointChange.forEach(callback => {
      try {
        callback(oldBreakpoint, newBreakpoint);
      } catch (error) {
        console.error('Adaptive Layout breakpoint callback error:', error);
      }
    });
  }
  
  handleOrientationChange() {
    const newOrientation = this.getOrientation();
    const oldOrientation = this.orientation;
    
    // Update CSS classes
    if (oldOrientation) {
      document.documentElement.classList.remove(`orientation-${oldOrientation}`);
    }
    document.documentElement.classList.add(`orientation-${newOrientation}`);
    
    this.orientation = newOrientation;
    
    console.log('Orientation changed:', oldOrientation, '->', newOrientation);
    
    // Apply orientation-specific layouts
    this.applyOrientationLayout(newOrientation);
    
    // Fire orientation change callbacks
    this.callbacks.orientationChange.forEach(callback => {
      try {
        callback(oldOrientation, newOrientation);
      } catch (error) {
        console.error('Adaptive Layout orientation callback error:', error);
      }
    });
  }
  
  handleViewportChange() {
    // Handle mobile browser viewport changes (e.g., when keyboard appears)
    if (window.visualViewport) {
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      
      if (viewportHeight < windowHeight * 0.8) {
        // Keyboard likely visible
        document.documentElement.classList.add('keyboard-visible');
      } else {
        // Keyboard likely hidden
        document.documentElement.classList.remove('keyboard-visible');
      }
    }
  }
  
  applyInitialLayout() {
    this.applyBreakpointLayout(this.currentBreakpoint);
    this.applyOrientationLayout(this.orientation);
  }
  
  applyBreakpointLayout(breakpoint) {
    const body = document.body;
    
    switch (breakpoint) {
      case 'mobile':
        this.applyMobileLayout();
        break;
      case 'tablet':
        this.applyTabletLayout();
        break;
      case 'desktop':
      case 'large':
      case 'xlarge':
        this.applyDesktopLayout();
        break;
    }
  }
  
  applyMobileLayout() {
    const sidebar = document.querySelector('.book-sidebar');
    const pdfReader = document.querySelector('.pdf-reader');
    const controls = document.querySelector('.reader-controls');
    
    if (sidebar) {
      sidebar.style.transform = 'none';
    }
    
    if (pdfReader) {
      pdfReader.style.marginLeft = '0';
      pdfReader.style.width = '100%';
    }
    
    if (controls) {
      controls.style.display = 'none';
    }
    
    // Show mobile controls
    this.showMobileControls();
  }
  
  applyTabletLayout() {
    // Tablet-specific layout adjustments
    const sidebar = document.querySelector('.book-sidebar');
    const pdfReader = document.querySelector('.pdf-reader');
    
    if (this.orientation === 'landscape') {
      // Show sidebar in landscape mode
      if (sidebar) {
        sidebar.style.transform = 'translateX(0)';
        sidebar.style.width = '25rem';
      }
      
      if (pdfReader) {
        pdfReader.style.marginLeft = '25rem';
        pdfReader.style.width = 'calc(100% - 25rem)';
      }
    } else {
      // Hide sidebar in portrait mode
      this.applyMobileLayout();
    }
  }
  
  applyDesktopLayout() {
    // Desktop-specific layout adjustments
    const sidebar = document.querySelector('.book-sidebar');
    const pdfReader = document.querySelector('.pdf-reader');
    const controls = document.querySelector('.reader-controls');
    
    if (sidebar) {
      sidebar.style.transform = 'translateX(0)';
      sidebar.style.width = '30rem';
    }

    if (controls) {
      controls.style.display = 'flex';
    }
    
    // Hide mobile controls
    this.hideMobileControls();
  }
  
  applyOrientationLayout(orientation) {
    // Apply orientation-specific adjustments
    if (this.isMobile() || this.isTablet()) {
      if (orientation === 'landscape') {
        this.optimizeForLandscape();
      } else {
        this.optimizeForPortrait();
      }
    }
  }
  
  optimizeForLandscape() {
    // Landscape optimizations for mobile/tablet
    const container = document.querySelector('.leitor-container');
    if (container) {
      container.style.flexDirection = 'row';
    }
    
    // Adjust PDF container height for landscape
    const pdfContainer = document.querySelector('.pdf-container');
    if (pdfContainer) {
      pdfContainer.style.height = 'calc(100vh - 12rem)';
    }
  }
  
  optimizeForPortrait() {
    // Portrait optimizations for mobile/tablet
    const container = document.querySelector('.leitor-container');
    if (container) {
      container.style.flexDirection = 'column';
    }
    
    // Adjust PDF container height for portrait
    const pdfContainer = document.querySelector('.pdf-container');
    if (pdfContainer) {
      pdfContainer.style.height = 'calc(100vh - 16rem)';
    }
  }
  
  showMobileControls() {
    const mobileControls = document.querySelector('.mobile-controls');
    if (mobileControls) {
      mobileControls.classList.add('show');
    }
  }
  
  hideMobileControls() {
    const mobileControls = document.querySelector('.mobile-controls');
    if (mobileControls) {
      mobileControls.classList.remove('show');
    }
  }
  
  // Utility methods
  isMobile() {
    return this.currentBreakpoint === 'mobile';
  }
  
  isTablet() {
    return this.currentBreakpoint === 'tablet';
  }
  
  isDesktop() {
    return ['desktop', 'large', 'xlarge'].includes(this.currentBreakpoint);
  }
  
  isLandscape() {
    return this.orientation === 'landscape';
  }
  
  isPortrait() {
    return this.orientation === 'portrait';
  }
  
  // Event subscription methods
  onBreakpointChange(callback) {
    this.callbacks.breakpointChange.push(callback);
  }
  
  onOrientationChange(callback) {
    this.callbacks.orientationChange.push(callback);
  }
  
  onResize(callback) {
    this.callbacks.resize.push(callback);
  }
  
  // Get current state
  getState() {
    return {
      breakpoint: this.currentBreakpoint,
      orientation: this.orientation,
      isTouch: this.isTouch,
      isRetina: this.isRetina,
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  
  // Force layout update
  update() {
    this.handleResize();
  }
  
  // Cleanup
  cleanup() {
    clearTimeout(this.resizeTimeout);
    clearTimeout(this.orientationTimeout);
    
    // Remove event listeners would go here if we stored references
    // For now, the listeners will be cleaned up when the page unloads
  }
} 