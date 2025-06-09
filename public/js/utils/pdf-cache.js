// PDF Cache utility for browser storage using IndexedDB
// Handles caching of PDF files and rendered pages for better performance

export class PDFCache {
  constructor() {
    this.dbName = 'BiblioTechPDFCache';
    this.dbVersion = 1;
    this.db = null;
    this.pageCache = new Map(); // In-memory cache for rendered pages
    this.init();
  }

  async init() {
    try {
      this.db = await this.openDB();
    } catch (error) {
      console.warn('Failed to initialize PDF cache:', error);
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // PDF files store
        if (!db.objectStoreNames.contains('pdfs')) {
          const pdfStore = db.createObjectStore('pdfs', { keyPath: 'id' });
          pdfStore.createIndex('url', 'url', { unique: false });
          pdfStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Page renders store
        if (!db.objectStoreNames.contains('pages')) {
          const pageStore = db.createObjectStore('pages', { keyPath: 'id' });
          pageStore.createIndex('pdfId', 'pdfId', { unique: false });
        }
      };
    });
  }

  async cachePDF(url, arrayBuffer, metadata = {}) {
    if (!this.db) return false;
    
    try {
      const transaction = this.db.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      
      const cacheData = {
        id: this.generatePDFId(url),
        url: url,
        data: arrayBuffer,
        timestamp: Date.now(),
        size: arrayBuffer.byteLength,
        ...metadata
      };
      
      await store.put(cacheData);
      return true;
    } catch (error) {
      console.warn('Failed to cache PDF:', error);
      return false;
    }
  }

  async getCachedPDF(url) {
    if (!this.db) return null;
    
    try {
      const transaction = this.db.transaction(['pdfs'], 'readonly');
      const store = transaction.objectStore('pdfs');
      const request = store.get(this.generatePDFId(url));
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result && this.isCacheValid(result.timestamp)) {
            resolve(result);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to get cached PDF:', error);
      return null;
    }
  }

  cacheRenderedPage(pdfId, pageNum, imageData, scale) {
    const key = `${pdfId}_${pageNum}_${scale}`;
    this.pageCache.set(key, {
      imageData,
      timestamp: Date.now()
    });
    
    // Limit cache size (keep last 10 pages)
    if (this.pageCache.size > 10) {
      const firstKey = this.pageCache.keys().next().value;
      this.pageCache.delete(firstKey);
    }
  }

  getCachedPage(pdfId, pageNum, scale) {
    const key = `${pdfId}_${pageNum}_${scale}`;
    const cached = this.pageCache.get(key);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.imageData;
    }
    
    return null;
  }

  generatePDFId(url) {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  }

  isCacheValid(timestamp, maxAge = 3600000) { // 1 hour default
    return (Date.now() - timestamp) < maxAge;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async clearExpiredCache() {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      const index = store.index('timestamp');
      const cutoff = Date.now() - 86400000; // 24 hours
      
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      // Also manage cache size - keep only last 5 PDFs
      await this.manageCacheSize();
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }

  async manageCacheSize() {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['pdfs'], 'readwrite');
      const store = transaction.objectStore('pdfs');
      const index = store.index('timestamp');
      
      // Get all entries sorted by timestamp (newest first)
      const entries = [];
      const request = index.openCursor(null, 'prev');
      
      await new Promise((resolve) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            entries.push(cursor.value);
            cursor.continue();
          } else {
            resolve();
          }
        };
      });
      
      // Keep only the 5 most recent PDFs
      if (entries.length > 5) {
        const toDelete = entries.slice(5);
        for (const entry of toDelete) {
          await store.delete(entry.id);
        }
      }
    } catch (error) {
      console.warn('Failed to manage cache size:', error);
    }
  }

  async getCacheStats() {
    if (!this.db) return null;
    
    try {
      const transaction = this.db.transaction(['pdfs'], 'readonly');
      const store = transaction.objectStore('pdfs');
      
      const entries = [];
      const request = store.openCursor();
      
      await new Promise((resolve) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            entries.push(cursor.value);
            cursor.continue();
          } else {
            resolve();
          }
        };
      });
      
      const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
      
      return {
        count: entries.length,
        totalSize: totalSize,
        formattedSize: this.formatBytes(totalSize),
        entries: entries.map(e => ({
          url: e.url,
          size: this.formatBytes(e.size),
          timestamp: new Date(e.timestamp).toLocaleString()
        }))
      };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return null;
    }
  }
} 