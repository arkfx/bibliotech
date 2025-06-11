/**
 * Reading Preferences Manager
 * Handles saving and loading user reading preferences locally
 * Part of Phase 3: Advanced UI Features
 */

export class ReadingPreferences {
  constructor(bookId = 'global') {
    this.bookId = bookId;
    this.storagePrefix = 'bibliotech_reader_prefs';
    this.defaultPreferences = {
      // Theme preferences
      theme: 'dark',
      autoTheme: false, // System-aware theme switching
      
      // Zoom and view preferences
      zoom: 1.0,
      fitMode: 'width', // 'width', 'height', 'custom'
      viewMode: 'page', // 'page', 'continuous'
      
      // Reading controls
      autoScroll: false,
      autoScrollSpeed: 2,
      
      // UI preferences
      showControls: true,
      showProgress: true,
      showThumbnails: true,
      
      // Mobile-specific preferences
      swipeGestures: true,
      pinchToZoom: true,
      doubleTapToFit: true,
      
      // Performance preferences
      preloadPages: true,
      cacheEnabled: true,
      
      // Accessibility preferences
      highContrast: false,
      largeButtons: false,
      
      // Reading session preferences
      rememberPosition: true,
      saveReadingTime: true,
      
      // Search preferences
      caseSensitive: false,
      wholeWords: false,
      regularExpressions: false,
      
      // Last updated timestamp
      lastUpdated: Date.now()
    };
  }

  /**
   * Get storage key for specific preference type
   */
  getStorageKey(type = 'general') {
    return `${this.storagePrefix}_${type}_${this.bookId}`;
  }

  /**
   * Get global storage key (not book-specific)
   */
  getGlobalStorageKey(type = 'general') {
    return `${this.storagePrefix}_global_${type}`;
  }

  /**
   * Load all preferences for current book/session
   */
  loadPreferences() {
    try {
      // Load book-specific preferences
      const bookPrefs = this.loadBookPreferences();
      
      // Load global preferences
      const globalPrefs = this.loadGlobalPreferences();
      
      // Merge with defaults (book prefs override global prefs override defaults)
      const preferences = {
        ...this.defaultPreferences,
        ...globalPrefs,
        ...bookPrefs
      };

      console.log('Loaded reading preferences:', preferences);
      return preferences;
    } catch (e) {
      console.warn('Could not load reading preferences:', e);
      return { ...this.defaultPreferences };
    }
  }

  /**
   * Load book-specific preferences
   */
  loadBookPreferences() {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Could not parse book preferences:', e);
      return {};
    }
  }

  /**
   * Load global preferences (apply to all books)
   */
  loadGlobalPreferences() {
    try {
      const stored = localStorage.getItem(this.getGlobalStorageKey());
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Could not parse global preferences:', e);
      return {};
    }
  }

  /**
   * Save specific preference
   */
  savePreference(key, value, global = false) {
    try {
      const storageKey = global ? this.getGlobalStorageKey() : this.getStorageKey();
      const current = this.getCurrentStoredPreferences(global);
      
      current[key] = value;
      current.lastUpdated = Date.now();
      
      localStorage.setItem(storageKey, JSON.stringify(current));
      console.log(`Saved ${global ? 'global' : 'book'} preference:`, key, value);
    } catch (e) {
      console.warn('Could not save preference:', e);
    }
  }

  /**
   * Save multiple preferences at once
   */
  savePreferences(preferences, global = false) {
    try {
      const storageKey = global ? this.getGlobalStorageKey() : this.getStorageKey();
      const current = this.getCurrentStoredPreferences(global);
      
      const updated = {
        ...current,
        ...preferences,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(updated));
      console.log(`Saved ${global ? 'global' : 'book'} preferences:`, preferences);
    } catch (e) {
      console.warn('Could not save preferences:', e);
    }
  }

  /**
   * Get currently stored preferences from localStorage
   */
  getCurrentStoredPreferences(global = false) {
    try {
      const storageKey = global ? this.getGlobalStorageKey() : this.getStorageKey();
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Reset preferences to defaults
   */
  resetPreferences(global = false) {
    try {
      const storageKey = global ? this.getGlobalStorageKey() : this.getStorageKey();
      localStorage.removeItem(storageKey);
      console.log(`Reset ${global ? 'global' : 'book'} preferences to defaults`);
    } catch (e) {
      console.warn('Could not reset preferences:', e);
    }
  }

  /**
   * Check if preferences are expired (older than specified time)
   */
  arePreferencesExpired(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
    try {
      const prefs = this.loadBookPreferences();
      if (!prefs.lastUpdated) return true;
      
      return Date.now() - prefs.lastUpdated > maxAge;
    } catch (e) {
      return true;
    }
  }

  /**
   * Clean up expired preferences
   */
  cleanupExpiredPreferences() {
    try {
      if (this.arePreferencesExpired()) {
        this.resetPreferences();
        console.log('Cleaned up expired preferences for book:', this.bookId);
      }
    } catch (e) {
      console.warn('Could not cleanup expired preferences:', e);
    }
  }

  /**
   * Export preferences for backup/sync
   */
  exportPreferences() {
    return {
      bookId: this.bookId,
      bookPreferences: this.loadBookPreferences(),
      globalPreferences: this.loadGlobalPreferences(),
      exportedAt: Date.now()
    };
  }

  /**
   * Import preferences from backup/sync
   */
  importPreferences(exportedData) {
    try {
      if (exportedData.bookPreferences) {
        this.savePreferences(exportedData.bookPreferences, false);
      }
      
      if (exportedData.globalPreferences) {
        this.savePreferences(exportedData.globalPreferences, true);
      }
      
      console.log('Imported preferences successfully');
      return true;
    } catch (e) {
      console.warn('Could not import preferences:', e);
      return false;
    }
  }

  /**
   * Get preference with fallback
   */
  getPreference(key, fallback = null) {
    const prefs = this.loadPreferences();
    return prefs[key] !== undefined ? prefs[key] : fallback;
  }

  /**
   * Auto-detect system theme preference with enhanced capabilities
   */
  getSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      if (darkQuery.matches) return 'dark';
      if (lightQuery.matches) return 'light';
      
      // Check time-based auto detection for systems without theme preference
      return this.getTimeBasedTheme();
    }
    return 'light';
  }

  /**
   * Get theme based on time of day (fallback for systems without theme preference)
   */
  getTimeBasedTheme() {
    const hour = new Date().getHours();
    // Dark theme between 8 PM and 6 AM
    return (hour >= 20 || hour < 6) ? 'dark' : 'light';
  }

  /**
   * Enhanced system theme change listener with multiple triggers
   */
  setupSystemThemeListener(callback) {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const lightQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      const handler = (e) => {
        const autoTheme = this.getPreference('autoTheme', true);
        if (autoTheme && typeof callback === 'function') {
          // Determine new theme based on which query triggered
          let newTheme;
          if (e.media.includes('dark')) {
            newTheme = e.matches ? 'dark' : 'light';
          } else {
            newTheme = e.matches ? 'light' : 'dark';
          }
          
          console.log('System theme changed to:', newTheme);
          this.savePreference('lastSystemTheme', newTheme, true);
          callback(newTheme);
        }
      };
      
      // Listen to both dark and light theme changes
      darkQuery.addEventListener('change', handler);
      lightQuery.addEventListener('change', handler);
      
      // Enhanced time-based theme switching for auto mode
      let timeBasedInterval;
      if (this.getPreference('autoTheme', true) && this.getPreference('timeBasedTheme', false)) {
        timeBasedInterval = setInterval(() => {
          const currentTheme = this.getPreference('theme', 'dark');
          const timeBasedTheme = this.getTimeBasedTheme();
          
          if (currentTheme !== timeBasedTheme && typeof callback === 'function') {
            console.log('Time-based theme change to:', timeBasedTheme);
            callback(timeBasedTheme);
          }
        }, 60000); // Check every minute
      }
      
      // Enhanced cleanup function
      return () => {
        darkQuery.removeEventListener('change', handler);
        lightQuery.removeEventListener('change', handler);
        if (timeBasedInterval) {
          clearInterval(timeBasedInterval);
        }
      };
    }
    
    return () => {}; // No-op cleanup
  }

  /**
   * Smart theme detection with context awareness
   */
  getContextAwareTheme() {
    const prefs = this.loadPreferences();
    
    // If auto theme is disabled, use manual preference
    if (!prefs.autoTheme) {
      return prefs.theme || 'dark';
    }
    
    // Check for reading environment context
    const context = this.detectReadingContext();
    
    switch (context) {
      case 'lowLight':
        return 'dark';
      case 'brightLight':
        return 'light';
      case 'bedtime':
        return 'dark';
      default:
        return this.getSystemTheme();
    }
  }

  /**
   * Detect reading environment context
   */
  detectReadingContext() {
    const hour = new Date().getHours();
    
    // Bedtime reading (9 PM - 6 AM)
    if (hour >= 21 || hour < 6) {
      return 'bedtime';
    }
    
    // Bright daylight hours (10 AM - 4 PM)
    if (hour >= 10 && hour <= 16) {
      return 'brightLight';
    }
    
    // Evening/early morning (might be low light)
    if (hour >= 18 || hour <= 8) {
      return 'lowLight';
    }
    
    return 'normal';
  }

  /**
   * Get intelligent default preferences based on device/context with enhanced detection
   */
  getSmartDefaults() {
    const deviceInfo = this.detectDeviceCapabilities();
    const readingContext = this.detectReadingContext();
    
    const defaults = {
      ...this.defaultPreferences,
      
      // Theme preferences with context awareness
      theme: this.getContextAwareTheme(),
      autoTheme: true,
      timeBasedTheme: !deviceInfo.hasSystemTheme, // Enable time-based if no system theme support
      
      // Device-optimized visual/aesthetic settings only
      viewMode: deviceInfo.isMobile ? 'continuous' : (deviceInfo.isTablet ? 'page' : 'page'),
      fitMode: this.getOptimalFitMode(deviceInfo),
      
      // Touch interaction preferences
      swipeGestures: deviceInfo.isTouch,
      pinchToZoom: deviceInfo.isTouch && deviceInfo.supportsMultiTouch,
      doubleTapToFit: deviceInfo.isTouch,
      tapToToggleControls: deviceInfo.isMobile,
      
      // UI scale and sizing
      largeButtons: deviceInfo.screenWidth < 768 || deviceInfo.isTouch,
      compactUI: deviceInfo.screenWidth < 480,
      
      // Performance settings - keep consistent across all devices (use original defaults)
      preloadPages: this.defaultPreferences.preloadPages,
      cacheEnabled: this.defaultPreferences.cacheEnabled,
      
      // Feature availability
      showThumbnails: !deviceInfo.isMobile || deviceInfo.screenWidth > 768,
      showTOC: true,
      enableAnimations: !deviceInfo.lowEndDevice && deviceInfo.prefersReducedMotion !== true,
      
      // Reading-specific optimizations
      autoScroll: false, // Conservative default
      continuousScrollSpeed: deviceInfo.isMobile ? 2 : 3,
      
      // Accessibility considerations
      highContrast: this.shouldUseHighContrast(deviceInfo),
      reducedMotion: deviceInfo.prefersReducedMotion,
      
      lastUpdated: Date.now()
    };
    
    console.log('Generated smart defaults for device:', deviceInfo.type, '(performance settings consistent across devices)', defaults);
    return defaults;
  }

  /**
   * Comprehensive device capability detection
   */
  detectDeviceCapabilities() {
    const userAgent = navigator.userAgent;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Enhanced device detection
    const isMobile = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent) || (screenWidth >= 768 && screenWidth <= 1024);
    const isDesktop = !isMobile && !isTablet;
    
    // Touch capabilities
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const supportsMultiTouch = navigator.maxTouchPoints > 1;
    
    // Performance indicators
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 2; // GB
    const lowEndDevice = cores < 4 || memory < 3;
    
    // System capabilities
    const hasSystemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all';
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return {
      type: isMobile ? 'mobile' : (isTablet ? 'tablet' : 'desktop'),
      isMobile,
      isTablet,
      isDesktop,
      isTouch,
      supportsMultiTouch,
      screenWidth,
      screenHeight,
      pixelRatio,
      cores,
      memory,
      lowEndDevice,
      hasSystemTheme,
      prefersReducedMotion
    };
  }



  /**
   * Get optimal fit mode based on device
   */
  getOptimalFitMode(deviceInfo) {
    if (deviceInfo.isMobile) {
      return deviceInfo.screenWidth < 400 ? 'width' : 'width';
    }
    
    if (deviceInfo.isTablet) {
      return 'page'; // Tablets can usually show full pages nicely
    }
    
    return 'width'; // Desktop default to width for comfortable reading
  }



  /**
   * Determine if high contrast should be used
   */
  shouldUseHighContrast(deviceInfo) {
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      return true;
    }
    
    // Consider mobile devices in bright environments
    const hour = new Date().getHours();
    if (deviceInfo.isMobile && hour >= 10 && hour <= 16) {
      return true;
    }
    
    return false;
  }
} 