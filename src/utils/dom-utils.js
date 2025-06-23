// DOM utility functions for Product Statistics Extension

/**
 * DOM manipulation and query utilities
 */
export class DomUtils {
  /**
   * Wait for an element to appear in the DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Element>} The found element
   */
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Safely create and inject HTML content
   * @param {string} html - HTML string to inject
   * @returns {DocumentFragment} Document fragment with sanitized content
   */
  static createSafeHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Check if element is visible in viewport
   * @param {Element} element - Element to check
   * @returns {boolean} True if element is visible
   */
  static isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Extract product ID from various DOM patterns
   * @param {Element} element - Product element
   * @param {number} fallbackIndex - Fallback index if no ID found
   * @returns {string} Product ID
   */
  static extractProductId(element, fallbackIndex = 0) {
    // Method 1: Data attributes
    let productId = element.dataset.productId || 
                   element.dataset.id || 
                   element.dataset.itemId;
    
    // Method 2: URL parsing
    if (!productId) {
      const link = element.querySelector('a[href*="/product/"], a[href*="/p/"], a[href*="/item/"]');
      if (link) {
        const match = link.href.match(/\/(product|p|item)\/([^/?#]+)/);
        if (match) {
          productId = match[2];
        }
      }
    }
    
    // Method 3: Class name parsing
    if (!productId) {
      const classMatch = element.className.match(/product-([\w-]+)/i);
      if (classMatch) {
        productId = classMatch[1];
      }
    }
    
    // Method 4: Fallback to index
    if (!productId) {
      productId = `product-${fallbackIndex + 1}`;
    }
    
    return productId;
  }

  /**
   * Remove all instances of a class from the document
   * @param {string} className - Class name to remove
   */
  static removeAllByClass(className) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(element => element.remove());
  }

  /**
   * Create a throttled scroll listener
   * @param {Function} callback - Callback function
   * @param {number} delay - Throttle delay in milliseconds
   * @returns {Function} Throttled function
   */
  static throttleScroll(callback, delay = 100) {
    let isThrottled = false;
    return function(...args) {
      if (!isThrottled) {
        callback.apply(this, args);
        isThrottled = true;
        setTimeout(() => {
          isThrottled = false;
        }, delay);
      }
    };
  }
}