// Product Statistics Chrome Extension - Popup Script

class PopupController {
  constructor() {
    this.elements = {
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      toggleBtn: document.getElementById('toggleBtn'),
      toggleText: document.getElementById('toggleText'),
      refreshBtn: document.getElementById('refreshBtn'),
      reportIssue: document.getElementById('reportIssue')
    };
    
    this.init();
  }

  async init() {
    // Set up event listeners
    this.elements.toggleBtn.addEventListener('click', () => this.handleToggle());
    this.elements.refreshBtn.addEventListener('click', () => this.handleRefresh());
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
        return;
      }
      
      // Get extension status from content script
      const response = await this.sendMessageToContentScript({ action: 'getStatus' });
      
      if (response && response.enabled !== undefined) {
        this.setStatus(
          response.enabled ? 'active' : 'disabled',
          response.enabled ? 'Active' : 'Disabled'
        );
        this.updateToggleButton(response.enabled);
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
    } else {
      this.elements.toggleText.textContent = 'Enable';
      this.elements.toggleBtn.querySelector('.btn-icon').textContent = '▶️';
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
}

// Initialize popup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PopupController());
} else {
  new PopupController();
}