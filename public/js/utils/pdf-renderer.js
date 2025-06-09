// PDF Operator Renderer
// Handles PDF.js operator detection and theme rendering logic

export class PDFOperatorRenderer {
  constructor() {
    this.imageRegions = [];
    this.currentTheme = 'light';
  }

  /**
   * Analyzes PDF page for images and applies theme-appropriate rendering
   * Note: Page 1 is always rendered in light theme by the PDF viewer to avoid mask reversion issues
   */
  async analyzeAndRenderPage(page, canvas, viewport, theme = 'light') {
    this.currentTheme = theme;
    this.imageRegions = [];
    
    try {
      // Get the rendering context
      const context = canvas.getContext('2d');
      
      // Create render context for PDF.js
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      // Apply theme-specific rendering if needed
      if (theme === 'dark') {
        await this.renderWithDarkTheme(page, renderContext);
      } else {
        // Standard rendering for light theme (including page 1 regardless of selected theme)
        await page.render(renderContext).promise;
      }
      
      return this.imageRegions;
    } catch (error) {
      console.error('Error during page analysis and rendering:', error);
      // Fallback to standard rendering
      await page.render({
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }).promise;
      return [];
    }
  }

  /**
   * Renders page with dark theme, preserving image regions
   */
  async renderWithDarkTheme(page, renderContext) {
    try {
      // First, detect image regions
      await this.detectImageRegions(page, renderContext.viewport);
      
      // Render the page normally first
      await page.render(renderContext).promise;
      
      // Apply dark theme filter while preserving images
      this.applyDarkThemeFilter(renderContext.canvasContext);
      
    } catch (error) {
      console.error('Error in dark theme rendering:', error);
      // Fallback to normal rendering
      await page.render(renderContext).promise;
    }
  }

  /**
   * Detects image regions in the PDF page
   */
  async detectImageRegions(page, viewport) {
    try {
      const operatorList = await page.getOperatorList();
      const { fnArray, argsArray } = operatorList;
      
      this.imageRegions = [];
      let currentTransform = [1, 0, 0, 1, 0, 0]; // Identity matrix
      const transformStack = [];
      
      for (let i = 0; i < fnArray.length; i++) {
        const op = fnArray[i];
        const args = argsArray[i];
        
        switch (op) {
          case pdfjsLib.OPS.save:
            transformStack.push([...currentTransform]);
            break;
            
          case pdfjsLib.OPS.restore:
            if (transformStack.length > 0) {
              currentTransform = transformStack.pop();
            }
            break;
            
          case pdfjsLib.OPS.transform:
            currentTransform = this.multiplyMatrices(currentTransform, args);
            break;
            
          case pdfjsLib.OPS.paintImageXObject:
          case pdfjsLib.OPS.paintInlineImageXObject:
          case pdfjsLib.OPS.paintImageMaskXObject:
            // Image detected - calculate bounds
            const bounds = this.calculateImageBounds(currentTransform, viewport);
            if (bounds && this.isValidBounds(bounds)) {
              this.imageRegions.push(bounds);
            }
            break;
        }
      }
      
    } catch (error) {
      console.error('Error detecting image regions:', error);
      this.imageRegions = [];
    }
  }

  /**
   * Calculates image bounds from transformation matrix
   */
  calculateImageBounds(transform, viewport) {
    try {
      // Image is drawn in unit square [0,1] x [0,1] in image space
      const corners = [
        [0, 0], [1, 0], [1, 1], [0, 1]
      ];
      
      // Transform corners to page coordinates
      const transformedCorners = corners.map(([x, y]) => {
        const pageX = transform[0] * x + transform[2] * y + transform[4];
        const pageY = transform[1] * x + transform[3] * y + transform[5];
        return [pageX, pageY];
      });
      
      // Convert to canvas coordinates
      const canvasCorners = transformedCorners.map(([x, y]) => {
        return viewport.convertToViewportPoint(x, y);
      });
      
      // Calculate bounding box
      const xs = canvasCorners.map(p => p[0]);
      const ys = canvasCorners.map(p => p[1]);
      
      return {
        left: Math.min(...xs),
        top: Math.min(...ys),
        right: Math.max(...xs),
        bottom: Math.max(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
      };
      
    } catch (error) {
      console.error('Error calculating image bounds:', error);
      return null;
    }
  }

  /**
   * Multiplies two transformation matrices
   */
  multiplyMatrices(m1, m2) {
    return [
      m1[0] * m2[0] + m1[2] * m2[1],
      m1[1] * m2[0] + m1[3] * m2[1],
      m1[0] * m2[2] + m1[2] * m2[3],
      m1[1] * m2[2] + m1[3] * m2[3],
      m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
      m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
    ];
  }

  /**
   * Validates that bounds are reasonable
   */
  isValidBounds(bounds) {
    return bounds && 
           bounds.width > 1 && 
           bounds.height > 1 && 
           bounds.left >= 0 && 
           bounds.top >= 0 &&
           bounds.width < 10000 && 
           bounds.height < 10000;
  }

  /**
   * Applies dark theme filter while preserving image regions
   */
  applyDarkThemeFilter(context) {
    try {
      const canvas = context.canvas;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Use sub-pixel offset to preserve anti-aliased edges with minimal text obstruction
      const scaleAwareOffset = 0.9; // Even smaller offset
      
      // Create a mask for image regions with offset padding
      const isImagePixel = this.createImageMask(canvas.width, canvas.height, scaleAwareOffset);
      
      // Apply inversion to non-image pixels
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = Math.floor(i / 4);
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);
        
        if (!isImagePixel[pixelIndex]) {
          // Invert colors for text/background (non-image areas)
          data[i] = 255 - data[i];         // Red
          data[i + 1] = 255 - data[i + 1]; // Green  
          data[i + 2] = 255 - data[i + 2]; // Blue
          // Alpha stays the same
        }
      }
      
      context.putImageData(imageData, 0, 0);
      
    } catch (error) {
      console.error('Error applying dark theme filter:', error);
    }
  }

  /**
   * Creates a mask indicating which pixels are part of images
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {number} offsetPixels - Padding around image regions to preserve anti-aliasing (can be fractional)
   */
  createImageMask(width, height, offsetPixels) {
    const mask = new Array(width * height).fill(false);
    
    for (const region of this.imageRegions) {
      // For sub-pixel precision, we'll apply offset selectively:
      // - Use Math.floor for start coordinates (slightly expand inward)
      // - Use Math.ceil for end coordinates (slightly expand outward)
      // This gives us effective sub-pixel precision
      
      let startX, endX, startY, endY;
      
      // Use consistent rounding for symmetric padding in all directions
      startX = Math.max(0, Math.round(region.left - offsetPixels));
      endX = Math.min(width, Math.round(region.right + offsetPixels));
      startY = Math.max(0, Math.round(region.top - offsetPixels));
      endY = Math.min(height, Math.round(region.bottom + offsetPixels));
      
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          mask[y * width + x] = true;
        }
      }
    }
    
    return mask;
  }

  /**
   * Gets detected image regions for the current page
   */
  getImageRegions() {
    return [...this.imageRegions];
  }

  /**
   * Clears stored image regions
   */
  clearImageRegions() {
    this.imageRegions = [];
  }
} 