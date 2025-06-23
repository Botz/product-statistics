# Product Statistics Chrome Extension

A Chrome extension that displays product statistics (order count and order value) as overlays on product cards when visiting kartenliebe.de.

## Features

- 🎯 **Targeted Integration**: Works specifically on kartenliebe.de product grids
- 📊 **Real-time Statistics**: Displays order count and total order value for each product
- 🎨 **Non-intrusive Overlays**: Elegant overlays that don't interfere with the existing UI
- ⚡ **Performance Optimized**: Lightweight with smart caching and debounced API calls
- 🔄 **Auto-refresh**: Automatically updates when new products are loaded
- 🎛️ **Easy Control**: Simple popup interface to toggle and refresh data

## Installation

### For Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Botz/product-statistics.git
   cd product-statistics
   ```

2. **Install dependencies** (optional, for linting)
   ```bash
   npm install
   ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the project directory
   - The extension should now appear in your extensions list

### For Production Use

*Coming soon: Chrome Web Store installation*

## Usage

1. **Navigate to kartenliebe.de**
   - Visit any page on kartenliebe.de that contains product grids
   - Look for pages with `.cards-grid` containers

2. **View Statistics**
   - Product statistics will automatically appear as overlays on each product card
   - Each overlay shows:
     - **Orders**: Total number of orders for the product
     - **Value**: Total monetary value of orders (in EUR)

3. **Control the Extension**
   - Click the extension icon in the Chrome toolbar
   - Use the popup to:
     - Toggle the extension on/off
     - Refresh data manually
     - View extension status

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension manifest version
- **Content Script Only**: Simplified architecture without background scripts
- **Direct API Integration**: Content script communicates directly with the MockAPI endpoint
- **Smart Caching**: 5-minute cache to reduce API calls
- **DOM Monitoring**: Uses MutationObserver to detect dynamically loaded content

### API Integration

**Endpoint**: `https://6858ebf3138a18086dfc43e0.mockapi.io/web-api/theme-statistics`

**Expected Response Format**:
```json
[
  {
    "id": "product-id",
    "orderCount": 150,
    "orderValue": 2500.00,
    "productName": "Product Name"
  }
]
```

### File Structure

```
product-statistics/
├── manifest.json              # Extension manifest
├── src/
│   ├── content/
│   │   ├── content.js         # Main content script
│   │   └── overlay.css        # Overlay styling
│   └── popup/
│       ├── popup.html         # Popup interface
│       ├── popup.js           # Popup functionality
│       └── popup.css          # Popup styling
├── icons/                     # Extension icons (to be added)
├── package.json              # Project configuration
└── README.md                 # This file
```

## Development

### Prerequisites

- Node.js 16+ (for development tools)
- Chrome browser
- Git

### Development Workflow

1. **Make changes** to the source files
2. **Reload the extension** in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the Product Statistics extension
3. **Test on kartenliebe.de**
4. **Check console** for any errors or debug information

### Available Scripts

```bash
# Development mode info
npm run dev

# Lint code
npm run lint

# Package for distribution
npm run package
```

### Debugging

1. **Content Script Debugging**:
   - Open Developer Tools on kartenliebe.de
   - Check the Console tab for extension logs
   - Look for messages starting with "Product Statistics"

2. **Popup Debugging**:
   - Right-click the extension icon
   - Select "Inspect popup"
   - Debug in the popup's Developer Tools

3. **Extension Management**:
   - Visit `chrome://extensions/`
   - Click "Details" on the Product Statistics extension
   - Check for any errors or warnings

## Customization

### Styling

Modify `src/content/overlay.css` to customize the appearance of the statistics overlays:

- Change colors, fonts, or positioning
- Adjust responsive breakpoints
- Modify animations and transitions

### Product ID Detection

The extension uses multiple methods to extract product IDs from the DOM:

1. Data attributes (`data-product-id`, `data-id`)
2. URL parsing from product links
3. Fallback to sequential numbering

Modify the `extractProductIds()` method in `content.js` to add custom detection logic.

### API Integration

To use a different API endpoint:

1. Update the `apiEndpoint` in `content.js`
2. Modify the `host_permissions` in `manifest.json`
3. Adjust the data processing logic if the response format differs

## Browser Compatibility

- ✅ Chrome 88+ (Manifest V3 support)
- ✅ Chromium-based browsers (Edge, Brave, etc.)
- ❌ Firefox (uses different extension API)
- ❌ Safari (uses different extension API)

## Performance

- **Lightweight**: ~50KB total size
- **Efficient**: Debounced DOM monitoring
- **Cached**: 5-minute API response caching
- **Non-blocking**: Asynchronous operations

## Security

- **Minimal Permissions**: Only requests necessary permissions
- **Content Security Policy**: Strict CSP in manifest
- **Input Sanitization**: All injected content is sanitized
- **HTTPS Only**: All API calls use secure connections

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Botz/product-statistics/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/Botz/product-statistics/issues)
- 📧 **Contact**: [Create an issue](https://github.com/Botz/product-statistics/issues/new)

## Changelog

### v1.0.0 (2025-06-23)
- Initial release
- Basic overlay functionality
- Popup interface
- MockAPI integration
- Chrome Manifest V3 support

---

**Made with ❤️ for Kartenliebe**