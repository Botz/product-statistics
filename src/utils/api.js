// API utility functions for Product Statistics Extension

/**
 * API configuration and utility functions
 */
export class ApiClient {
  constructor() {
    this.baseUrl = 'https://www-botz-dev.staging.kartenliebe.de/web-api/';
    this.endpoints = {
      statistics: '/themes-order-statistics?occasion=hochzeit&category=einladungskarte'
    };
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch statistics data with caching
   * @returns {Promise<Array>} Statistics data array with structure:
   * [{ themeId: number, orders: { count: number, value: number } }]
   */
  async getStatistics() {
    const cacheKey = 'statistics';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const url = `${this.baseUrl}${this.endpoints.statistics}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Check if data is cached and valid
   * @returns {boolean} True if valid cached data exists
   */
  hasCachedData() {
    const cached = this.cache.get('statistics');
    return cached && Date.now() - cached.timestamp < this.cacheExpiry;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();