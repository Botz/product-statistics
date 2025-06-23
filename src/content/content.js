// Product Statistics Chrome Extension - Content Script
// Handles overlay injection on kartenliebe.de

class ProductStatistics {
  constructor() {
    this.apiEndpoint = 'https://6858ebf3138a18086dfc43e0.mockapi.io/web-api/theme-statistics';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.isEnabled = false;
    this.sortableInstance = null;
    this.customOrder = this.loadCustomOrder();
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
    // Initial check - fetch data and inject overlays
    this.checkForProductGrid();
    
    // Monitor for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Debounce to avoid excessive calls
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
            // Only process new product tiles with existing cached data
            // No refetching of API data
            this.processNewProductTiles();
          }, 1000); // Reduced debounce time since no API call
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkForProductGrid() {
    const cardsGrid = document.querySelector('.cards-grid__container');
    if (cardsGrid && this.isEnabled) {
      console.log('Found cards-grid, processing product tiles...');
      this.removeInfoTiles();
      this.processProductTiles(cardsGrid);
      this.initializeSortable(cardsGrid);
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
        const link = tile.querySelector('a');
        if (link) {
          try {
            const url = new URL(link.href);
            
            // Fallback: try to extract themeId from URL parameters
            const urlParams = new URLSearchParams(url.search);
            productId = urlParams.get('themeId');

          } catch (error) {
            console.warn('Failed to parse URL:', link.href, error);
            // Fallback to original regex method if URL parsing fails
            const match = link.href.match(/\/(product|p)\/([^/?]+)/);
            if (match) {
              productId = match[2];
            }
          }
        }
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
      
      console.log(`Processing tile for product ID: ${productId}`, stats);

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
    console.log(`Finding stats for product ID: ${productId}`, statisticsData);
    // Try to match by exact themeId first
    let stats = statisticsData.find(item => item.themeId == productId);
  
    
    // Transform the API response structure to match expected format
    if (stats && stats.orders) {
      return {
        id: stats.themeId,
        orderCount: stats.orders.count || 0,
        orderValue: stats.orders.value || 0,
        productName: stats.productName || `Theme ${stats.themeId}`
      };
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

  /**
   * Initialize sortable functionality for the cards grid
   */
  initializeSortable(cardsGrid) {
    // Destroy existing sortable instance if it exists
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }

    // Check if Sortable is available
    if (typeof Sortable === 'undefined') {
      console.warn('Sortable.js not loaded, drag and drop functionality disabled');
      return;
    }

    // Add sortable class to grid
    cardsGrid.classList.add('sortable-enabled');

    // Apply custom order if it exists
    this.applyCustomOrder(cardsGrid);

    // Initialize sortable
    this.sortableInstance = Sortable.create(cardsGrid, {


      
      onEnd: (evt) => {
        console.log('Drag ended:', evt.item, 'from', evt.oldIndex, 'to', evt.newIndex);
        document.body.style.userSelect = '';
        
        // Save new order if position changed
        if (evt.oldIndex !== evt.newIndex) {
          this.saveCustomOrder(cardsGrid);
        }
      },

    });

    console.log('Sortable initialized for cards grid');
  }

  /**
   * Apply custom order to cards grid
   */
  applyCustomOrder(cardsGrid) {
    if (!this.customOrder || this.customOrder.length === 0) {
      return;
    }

    const cardsTiles = Array.from(cardsGrid.querySelectorAll('.cards-tile'));
    const orderedTiles = [];

    // First, add tiles in the saved order
    this.customOrder.forEach(productId => {
      const tile = cardsTiles.find(tile =>
        tile.dataset.extractedProductId === productId
      );
      if (tile) {
        orderedTiles.push(tile);
      }
    });

    // Then add any new tiles that weren't in the saved order
    cardsTiles.forEach(tile => {
      if (!orderedTiles.includes(tile)) {
        orderedTiles.push(tile);
      }
    });

    // Reorder the DOM elements
    orderedTiles.forEach(tile => {
      cardsGrid.appendChild(tile);
    });

    console.log('Applied custom order to', orderedTiles.length, 'tiles');
  }

  /**
   * Save current order to localStorage
   */
  saveCustomOrder(cardsGrid) {
    const cardsTiles = cardsGrid.querySelectorAll('.cards-tile');
    const order = Array.from(cardsTiles).map(tile =>
      tile.dataset.extractedProductId
    ).filter(id => id); // Filter out null/undefined IDs

    this.customOrder = order;
    
    try {
      localStorage.setItem('productStats_cardOrder', JSON.stringify(order));
      console.log('Saved custom order:', order);
    } catch (error) {
      console.error('Failed to save custom order:', error);
    }
  }

  /**
   * Load custom order from localStorage
   */
  loadCustomOrder() {
    try {
      const saved = localStorage.getItem('productStats_cardOrder');
      if (saved) {
        const order = JSON.parse(saved);
        console.log('Loaded custom order:', order);
        return order;
      }
    } catch (error) {
      console.error('Failed to load custom order:', error);
    }
    return [];
  }

  /**
   * Reset custom order
   */
  resetCustomOrder() {
    this.customOrder = [];
    try {
      localStorage.removeItem('productStats_cardOrder');
      window.location.reload();
      this.isEnabled = false
      console.log('Reset custom order');
      
      // Reinitialize sortable to apply default order
      const cardsGrid = document.querySelector('.cards-grid__container');
      if (cardsGrid) {
        this.initializeSortable(cardsGrid);
      }
    } catch (error) {
      console.error('Failed to reset custom order:', error);
    }
  }

  /**
   * Save current order to kartenliebe.de server
   */
  async saveOrderToServer() {
    const cardsGrid = document.querySelector('.cards-grid');
    if (!cardsGrid) {
      throw new Error('Cards grid not found');
    }

    const cardsTiles = cardsGrid.querySelectorAll('.cards-tile');
    if (cardsTiles.length === 0) {
      throw new Error('No card tiles found');
    }

    // Build payload array with id and sort position
    const payload = [];
    cardsTiles.forEach((tile, index) => {
      const productId = tile.dataset.extractedProductId;
      if (productId) {
        payload.push({
          id: parseInt(productId),
          sort: index + 1
        });
      }
    });

    if (payload.length === 0) {
      throw new Error('No valid product IDs found');
    }

    console.log('Saving order to server:', payload);

    try {
      // Create FormData and add payload as 'sorted' field
      const formData = new FormData();
      formData.append('sorted', JSON.stringify(payload));

      const response = await fetch('https://www.kartenliebe.de/designer-admin/themes-sorting/sort-themes', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Order saved successfully:', result);
      return result;

    } catch (error) {
      console.error('Failed to save order to server:', error);
      throw error;
    }
  }

  /**
   * Remove all info-tile elements from the page
   */
  removeInfoTiles() {
    const infoTiles = document.querySelectorAll('.info-tile');
    if (infoTiles.length > 0) {
      console.log(`Removing ${infoTiles.length} info-tile elements`);
      infoTiles.forEach(tile => tile.remove());
    }
  }

  // Public methods for popup communication
  toggle() {
    this.isEnabled = !this.isEnabled;
    
    if (this.isEnabled) {
      this.removeInfoTiles();
      this.checkForProductGrid();
    } else {
      this.removeAllOverlays();
      // Destroy sortable instance when disabled
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
        this.sortableInstance = null;
      }
      // Remove sortable class
      const cardsGrid = document.querySelector('.cards-grid__container');
      if (cardsGrid) {
        cardsGrid.classList.remove('sortable-enabled');
      }
    }
    
    return this.isEnabled;
  }

  refresh() {
    this.cache.clear();
    this.checkForProductGrid();
  }

  /**
   * Process new product tiles that appear in the DOM without refetching API data
   * Uses existing cached data to inject overlays on newly added product tiles
   */
  processNewProductTiles() {
    if (!this.isEnabled) {
      return;
    }

    const cardsGrid = document.querySelector('.cards-grid');
    if (!cardsGrid) {
      return;
    }

    // Get cached statistics data
    const cacheKey = 'statistics-data';
    const cached = this.cache.get(cacheKey);
    
    if (!cached || Date.now() - cached.timestamp >= this.cacheExpiry) {
      console.log('No valid cached data available for new product tiles');
      return;
    }

    const statisticsData = cached.data;
    console.log('Processing new product tiles with cached data');

    // Find product tiles that don't have overlays yet
    const cardsTiles = cardsGrid.querySelectorAll('.cards-tile');
    const tilesWithoutOverlays = Array.from(cardsTiles).filter(tile =>
      !tile.querySelector('.product-stats-overlay')
    );

    if (tilesWithoutOverlays.length === 0) {
      return;
    }

    console.log(`Found ${tilesWithoutOverlays.length} new product tiles without overlays`);

    // Extract product IDs for new tiles
    const productIds = this.extractProductIds(tilesWithoutOverlays);
    
    if (productIds.length > 0) {
      // Inject overlays using cached data
      this.injectOverlays(tilesWithoutOverlays, statisticsData);
    }
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
    case 'resetOrder':
      productStats.resetCustomOrder();
      sendResponse({ success: true, enabled: productStats.isEnabled });
      break;
    case 'saveOrder':
      productStats.saveOrderToServer()
        .then(result => {
          sendResponse({ success: true, result: result });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep message channel open for async response
  }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductStatistics;
}