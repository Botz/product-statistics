// Product Statistics Chrome Extension - Content Script
// Handles overlay injection on kartenliebe.de

class ProductStatistics {
  constructor() {
    this.apiEndpoint = 'https://6858ebf3138a18086dfc43e0.mockapi.io/web-api/theme-statistics';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.isEnabled = true;
    this.init();
  }

  async init() {
    console.log('Product Statistics extension loaded');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
    } else {
      this.startMonitoring();
    }
  }

  startMonitoring() {
    // Initial check
    this.checkForProductGrid();
    
    // Monitor for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Debounce to avoid excessive calls
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
            this.checkForProductGrid();
          }, 500);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkForProductGrid() {
    const cardsGrid = document.querySelector('.cards-grid');
    if (cardsGrid && this.isEnabled) {
      console.log('Found cards-grid, processing product tiles...');
      this.processProductTiles(cardsGrid);
    }
  }

  async processProductTiles(cardsGrid) {
    const cardsTiles = cardsGrid.querySelectorAll('.cards-tile');
    
    if (cardsTiles.length === 0) {
      console.log('No cards-tile elements found');
      return;
    }

    console.log(`Found ${cardsTiles.length} product tiles`);
    
    // Extract product IDs from tiles
    const productIds = this.extractProductIds(cardsTiles);
    
    if (productIds.length === 0) {
      console.log('No product IDs could be extracted');
      return;
    }

    // Fetch statistics data
    const statisticsData = await this.fetchStatistics();
    
    if (statisticsData) {
      this.injectOverlays(cardsTiles, statisticsData);
    }
  }

  extractProductIds(cardsTiles) {
    const productIds = [];
    
    cardsTiles.forEach((tile, index) => {
      // Try multiple methods to extract product ID
      let productId = null;
      
      // Method 1: Look for data attributes
      productId = tile.dataset.productId || tile.dataset.id;
      
      // Method 2: Look for links with product URLs
      if (!productId) {
        const link = tile.querySelector('a[href*="/product/"], a[href*="/p/"]');
        if (link) {
          const match = link.href.match(/\/(product|p)\/([^/?]+)/);
          if (match) {
            productId = match[2];
          }
        }
      }
      
      // Method 3: Use index as fallback ID
      if (!productId) {
        productId = `product-${index + 1}`;
      }
      
      productIds.push(productId);
      // Store the ID on the element for later reference
      tile.dataset.extractedProductId = productId;
    });
    
    return productIds;
  }

  async fetchStatistics() {
    // Check cache first
    const cacheKey = 'statistics-data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('Using cached statistics data');
      return cached.data;
    }

    try {
      console.log('Fetching statistics from API...');
      const response = await fetch(this.apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the data
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      console.log('Statistics data fetched successfully:', data);
      return data;
      
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      return null;
    }
  }

  injectOverlays(cardsTiles, statisticsData) {
    cardsTiles.forEach((tile) => {
      // Remove existing overlay if present
      const existingOverlay = tile.querySelector('.product-stats-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      
      const productId = tile.dataset.extractedProductId;
      const stats = this.findStatsForProduct(productId, statisticsData);
      
      if (stats) {
        this.createOverlay(tile, stats);
      } else {
        // Create overlay with default/placeholder data
        this.createOverlay(tile, {
          orderCount: 0,
          orderValue: 0,
          productName: 'Unknown Product'
        });
      }
    });
  }

  findStatsForProduct(productId, statisticsData) {
    // Try to match by exact ID first
    let stats = statisticsData.find(item => item.id === productId);
    
    // If not found, try partial matching
    if (!stats) {
      stats = statisticsData.find(item => 
        item.id && item.id.includes(productId.replace('product-', ''))
      );
    }
    
    // If still not found, use first available data as fallback
    if (!stats && statisticsData.length > 0) {
      const index = parseInt(productId.replace('product-', '')) - 1;
      stats = statisticsData[index % statisticsData.length];
    }
    
    return stats;
  }

  createOverlay(tile, stats) {
    const overlay = document.createElement('div');
    overlay.className = 'product-stats-overlay';
    
    const orderCount = stats.orderCount || 0;
    const orderValue = stats.orderValue || 0;
    
    overlay.innerHTML = `
      <div class="stats-item">
        <span class="stats-label">Orders:</span>
        <span class="stats-value">${orderCount}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">Value:</span>
        <span class="stats-value">€${orderValue.toFixed(2)}</span>
      </div>
    `;
    
    // Position the overlay
    tile.style.position = 'relative';
    tile.appendChild(overlay);
    
    console.log(`Overlay created for product ${tile.dataset.extractedProductId}:`, stats);
  }

  // Public methods for popup communication
  toggle() {
    this.isEnabled = !this.isEnabled;
    
    if (this.isEnabled) {
      this.checkForProductGrid();
    } else {
      this.removeAllOverlays();
    }
    
    return this.isEnabled;
  }

  refresh() {
    this.cache.clear();
    this.checkForProductGrid();
  }

  removeAllOverlays() {
    const overlays = document.querySelectorAll('.product-stats-overlay');
    overlays.forEach(overlay => overlay.remove());
  }
}

// Initialize the extension
const productStats = new ProductStatistics();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'toggle':
      const isEnabled = productStats.toggle();
      sendResponse({ enabled: isEnabled });
      break;
    case 'refresh':
      productStats.refresh();
      sendResponse({ success: true });
      break;
    case 'getStatus':
      sendResponse({ enabled: productStats.isEnabled });
      break;
  }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductStatistics;
}