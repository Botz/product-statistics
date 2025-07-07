// Product Statistics Chrome Extension - Popup Script

class PopupController {
  constructor() {
    this.elements = {
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      toggleBtn: document.getElementById('toggleBtn'),
      toggleText: document.getElementById('toggleText'),
      refreshBtn: document.getElementById('refreshBtn'),
      resetOrderBtn: document.getElementById('resetOrderBtn'),
      saveOrderBtn: document.getElementById('saveOrderBtn'),
      reportIssue: document.getElementById('reportIssue')
    };
    
    this.init();
  }

  async init() {
    // Set up event listeners
    this.elements.toggleBtn.addEventListener('click', () => this.handleToggle());
    this.elements.refreshBtn.addEventListener('click', () => this.handleRefresh());
    this.elements.resetOrderBtn.addEventListener('click', () => this.handleResetOrder());
    this.elements.saveOrderBtn.addEventListener('click', () => this.handleSaveOrder());
    this.elements.reportIssue.addEventListener('click', () => this.handleReportIssue());
    
    // Initialize status
    await this.updateStatus();
  }

  async updateStatus() {
    try {
      // Check if we're on the correct site
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab.url.includes('kartenliebe.de')) {
        this.setStatus('inactive', 'Not on kartenliebe.de');
        this.elements.toggleBtn.disabled = true;
        this.elements.refreshBtn.disabled = true;
        this.elements.resetOrderBtn.disabled = true;
        this.elements.saveOrderBtn.disabled = true;
        return;
      }
      
      // Get extension status from content script
      const response = await this.sendMessageToContentScript({ action: 'getStatus' });
      
      if (response && response.enabled !== undefined) {
        // Check for tileCount error
        if (response.tileCountError) {
          this.setStatus('error', 'TileCount Error');
          this.showTileCountError(response.tileCountError);
          this.elements.toggleBtn.disabled = true;
          this.elements.refreshBtn.disabled = true;
          this.elements.resetOrderBtn.disabled = true;
          this.elements.saveOrderBtn.disabled = true;
        } else {
          this.setStatus(
            response.enabled ? 'active' : 'disabled',
            response.enabled ? 'Active' : 'Disabled'
          );
          this.updateToggleButton(response.enabled);
          this.elements.toggleBtn.disabled = false;
          this.elements.refreshBtn.disabled = false;
          this.elements.resetOrderBtn.disabled = false;
          this.elements.saveOrderBtn.disabled = false;
        }
      } else {
        this.setStatus('error', 'Extension not loaded');
      }
      
    } catch (error) {
      console.error('Failed to update status:', error);
      this.setStatus('error', 'Connection error');
    }
  }

  setStatus(type, text) {
    this.elements.statusDot.className = `status-dot ${type}`;
    this.elements.statusText.textContent = text;
  }

  updateToggleButton(isEnabled) {
    if (isEnabled) {
      this.elements.toggleText.textContent = 'Disable';
      this.elements.toggleBtn.querySelector('.btn-icon').textContent = '⏸️';
      this.elements.toggleBtn.className = 'btn btn-primary';
    } else {
      this.elements.toggleText.textContent = 'Enable';
      this.elements.toggleBtn.querySelector('.btn-icon').textContent = '▶️';
      this.elements.toggleBtn.className = 'btn btn-success';
    }
  }

  async handleToggle() {
    try {
      this.elements.toggleBtn.disabled = true;
      
      const response = await this.sendMessageToContentScript({ action: 'toggle' });
      
      if (response && response.enabled !== undefined) {
        this.setStatus(
          response.enabled ? 'active' : 'disabled',
          response.enabled ? 'Active' : 'Disabled'
        );
        this.updateToggleButton(response.enabled);
        
        // Show feedback
        this.showFeedback(response.enabled ? 'Extension enabled' : 'Extension disabled');
      } else {
        // Check if toggle failed due to tileCount error
        const statusResponse = await this.sendMessageToContentScript({ action: 'getStatus' });
        if (statusResponse && statusResponse.tileCountError) {
          this.showFeedback('Cannot enable: TileCount must be 999 or higher', 'error');
        } else {
          this.showFeedback('Failed to toggle extension', 'error');
        }
      }
      
    } catch (error) {
      console.error('Failed to toggle extension:', error);
      this.showFeedback('Failed to toggle extension', 'error');
    } finally {
      this.elements.toggleBtn.disabled = false;
    }
  }

  async handleRefresh() {
    try {
      this.elements.refreshBtn.disabled = true;
      this.elements.refreshBtn.querySelector('.btn-text').textContent = 'Refreshing...';
      
      const response = await this.sendMessageToContentScript({ action: 'refresh' });
      
      if (response && response.success) {
        this.showFeedback('Data refreshed successfully');
      } else {
        this.showFeedback('Failed to refresh data', 'error');
      }
      
    } catch (error) {
      console.error('Failed to refresh:', error);
      this.showFeedback('Failed to refresh data', 'error');
    } finally {
      this.elements.refreshBtn.disabled = false;
      this.elements.refreshBtn.querySelector('.btn-text').textContent = 'Refresh Data';
    }
  }

  async handleResetOrder() {
    try {
      this.elements.resetOrderBtn.disabled = true;
      this.elements.resetOrderBtn.querySelector('.btn-text').textContent = 'Resetting...';
      
      const response = await this.sendMessageToContentScript({ action: 'resetOrder' });
      
      if (response && response.success) {
        this.showFeedback('Card order reset successfully');
        
        // Update UI to reflect the new enabled state
        if (response.enabled !== undefined) {
          this.setStatus(
            response.enabled ? 'active' : 'disabled',
            response.enabled ? 'Active' : 'Disabled'
          );
          this.updateToggleButton(response.enabled);
        }
      } else {
        this.showFeedback('Failed to reset card order', 'error');
      }
      
    } catch (error) {
      console.error('Failed to reset order:', error);
      this.showFeedback('Failed to reset card order', 'error');
    } finally {
      this.elements.resetOrderBtn.disabled = false;
      this.elements.resetOrderBtn.querySelector('.btn-text').textContent = 'Reset Order';
    }
  }

  async handleSaveOrder() {
    try {
      this.elements.saveOrderBtn.disabled = true;
      this.elements.saveOrderBtn.querySelector('.btn-text').textContent = 'Saving...';
      
      const response = await this.sendMessageToContentScript({ action: 'saveOrder' });
      
      if (response && response.success) {
        this.showFeedback('Order saved to server successfully');
      } else {
        this.showFeedback(response?.error || 'Failed to save order to server', 'error');
      }
      
    } catch (error) {
      console.error('Failed to save order:', error);
      this.showFeedback('Failed to save order to server', 'error');
    } finally {
      this.elements.saveOrderBtn.disabled = false;
      this.elements.saveOrderBtn.querySelector('.btn-text').textContent = 'Save Order';
    }
  }

  handleReportIssue() {
    const issueUrl = 'https://github.com/Botz/product-statistics/issues/new';
    chrome.tabs.create({ url: issueUrl });
  }

  async sendMessageToContentScript(message) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        } else {
          reject(new Error('No active tab found'));
        }
      });
    });
  }

  showFeedback(message, type = 'success') {
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    
    // Insert at top of popup
    const container = document.querySelector('.popup-container');
    container.insertBefore(feedback, container.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 3000);
  }

  showTileCountError(errorMessage) {
    // Remove any existing error message
    const existingError = document.querySelector('.tilecount-error');
    if (existingError) {
      existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'tilecount-error';
    errorDiv.innerHTML = `
      <div class="error-header">
        <span class="error-icon">⚠️</span>
        <span class="error-title">TileCount Requirement Not Met</span>
      </div>
      <div class="error-message">${errorMessage}</div>
      <div class="error-help">
        <strong>How to fix:</strong> <a href="#" class="fix-tilecount-link">Click here to add tileCount=999</a> to the current page, or manually add <code>?tileCount=999</code> to the URL.
      </div>
    `;
    
    // Add click handler for the fix link
    const fixLink = errorDiv.querySelector('.fix-tilecount-link');
    fixLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleFixTileCount();
    });
    
    // Insert after status section
    const statusSection = document.querySelector('.status-section');
    statusSection.insertAdjacentElement('afterend', errorDiv);
  }

  async handleFixTileCount() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab.url.includes('kartenliebe.de')) {
        this.showFeedback('Please navigate to kartenliebe.de first', 'error');
        return;
      }
      
      const url = new URL(currentTab.url);
      const urlParams = new URLSearchParams(url.search);
      
      // Set or update tileCount parameter
      urlParams.set('tileCount', '999');
      
      // Construct new URL
      const newUrl = `${url.origin}${url.pathname}?${urlParams.toString()}${url.hash}`;
      
      // Navigate to the new URL
      await chrome.tabs.update(currentTab.id, { url: newUrl });
      
      this.showFeedback('Redirecting with tileCount=999...');
      
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to fix tileCount:', error);
      this.showFeedback('Failed to update URL', 'error');
    }
  }
}

// Initialize popup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PopupController());
} else {
  new PopupController();
}