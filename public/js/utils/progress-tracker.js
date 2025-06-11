// Progress tracking utility for PDF loading operations
// Provides enhanced UI feedback with download speed, ETA, and file size information

export class ProgressTracker {
  constructor(loadingEl) {
    this.loadingEl = loadingEl;
    this.startTime = null;
    this.lastUpdate = null;
    this.speeds = [];
    this.setupUI();
  }

  setupUI() {
    // Enhanced loading UI
    this.loadingEl.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-info">
        <p class="loading-status">Preparando para carregar...</p>
        <div class="progress-details">
          <div class="progress-bar-container">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" id="downloadProgress"></div>
            </div>
            <span class="progress-percentage" id="progressPercent">0%</span>
          </div>
          <div class="loading-stats">
            <span class="file-size" id="fileSize">--</span>
            <span class="loading-speed" id="loadingSpeed">--</span>
            <span class="time-remaining" id="timeRemaining">--</span>
          </div>
        </div>
      </div>
    `;
  }

  updateProgress(loaded, total, fromCache = false) {
    if (!this.startTime) {
      this.startTime = Date.now();
      this.lastUpdate = { time: this.startTime, loaded: 0 };
    }

    const now = Date.now();
    const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
    
    // Update progress bar
    const progressBar = document.getElementById('downloadProgress');
    const progressPercent = document.getElementById('progressPercent');
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;

    // Update file size
    const fileSize = document.getElementById('fileSize');
    if (fileSize && total > 0) {
      fileSize.textContent = `${this.formatBytes(loaded)} / ${this.formatBytes(total)}`;
    }

    // Calculate speed and ETA
    if (now - this.lastUpdate.time > 500) { // Update every 500ms
      const timeDiff = (now - this.lastUpdate.time) / 1000;
      const bytesDiff = loaded - this.lastUpdate.loaded;
      const currentSpeed = bytesDiff / timeDiff;
      
      this.speeds.push(currentSpeed);
      if (this.speeds.length > 5) this.speeds.shift(); // Keep last 5 measurements
      
      const avgSpeed = this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length;
      
      // Update speed display
      const speedEl = document.getElementById('loadingSpeed');
      if (speedEl && avgSpeed > 0) {
        speedEl.textContent = `${this.formatBytes(avgSpeed)}/s`;
      }

      // Update ETA
      const timeRemaining = document.getElementById('timeRemaining');
      if (timeRemaining && avgSpeed > 0 && total > loaded) {
        const remainingBytes = total - loaded;
        const eta = remainingBytes / avgSpeed;
        timeRemaining.textContent = `ETA: ${this.formatTime(eta)}`;
      }

      this.lastUpdate = { time: now, loaded };
    }

    // Update status
    const statusEl = this.loadingEl.querySelector('.loading-status');
    if (statusEl) {
      if (fromCache) {
        statusEl.textContent = 'Carregando do cache local...';
      } else if (percent === 100) {
        statusEl.textContent = 'Processando PDF...';
      } else {
        statusEl.textContent = `Baixando PDF... ${percent}%`;
      }
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatTime(seconds) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }

  complete() {
    const statusEl = this.loadingEl.querySelector('.loading-status');
    if (statusEl) {
      statusEl.textContent = 'PDF carregado com sucesso!';
    }
    
    // Show performance summary
    if (this.startTime) {
      const totalTime = (Date.now() - this.startTime) / 1000;
      const timeEl = document.getElementById('timeRemaining');
      if (timeEl) {
        timeEl.textContent = `Concluído em ${this.formatTime(totalTime)}`;
        timeEl.style.color = '#28a745';
      }
    }
  }
} 