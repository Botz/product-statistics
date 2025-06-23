# Contributing to Product Statistics Chrome Extension

Thank you for your interest in contributing to the Product Statistics Chrome Extension! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Chrome browser
- Git
- Basic knowledge of JavaScript, HTML, and CSS
- Understanding of Chrome Extension APIs

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/product-statistics.git
   cd product-statistics
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Load Extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

## Development Guidelines

### Code Style

- Follow the ESLint configuration provided
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use modern JavaScript features (ES6+)

### File Organization

- **Content scripts**: `src/content/`
- **Popup interface**: `src/popup/`
- **Utilities**: `src/utils/`
- **Icons**: `icons/`
- **Documentation**: Root directory

### Testing

1. **Manual Testing**
   - Test on kartenliebe.de with various product layouts
   - Verify overlay positioning and styling
   - Test popup functionality
   - Check console for errors

2. **Cross-browser Testing**
   - Test on different Chrome versions
   - Verify on Chromium-based browsers

3. **Performance Testing**
   - Monitor memory usage
   - Check API call frequency
   - Verify caching behavior

### Commit Guidelines

Use conventional commit messages:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

Examples:
```
feat: add product ID extraction from URL
fix: resolve overlay positioning issue
docs: update installation instructions
```

## Types of Contributions

### Bug Reports

- Use the GitHub issue template
- Include steps to reproduce
- Provide browser version and OS
- Include console errors if applicable

### Feature Requests

- Describe the feature and its benefits
- Explain the use case
- Consider implementation complexity
- Discuss potential alternatives

### Code Contributions

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

3. **Test Thoroughly**
   - Manual testing on target website
   - Check for console errors
   - Verify popup functionality

4. **Submit Pull Request**
   - Use descriptive title and description
   - Reference related issues
   - Include screenshots if UI changes

### Documentation

- Improve README clarity
- Add code comments
- Update API documentation
- Create tutorials or guides

## Code Review Process

1. **Automated Checks**
   - ESLint validation
   - Basic functionality tests

2. **Manual Review**
   - Code quality and style
   - Security considerations
   - Performance impact
   - User experience

3. **Testing**
   - Reviewer tests the changes
   - Verification on target website
   - Cross-browser compatibility

## Security Guidelines

- Never commit API keys or secrets
- Validate all user inputs
- Use HTTPS for all external requests
- Follow Chrome extension security best practices
- Sanitize all injected content

## Performance Considerations

- Minimize DOM queries
- Use efficient selectors
- Implement proper caching
- Avoid memory leaks
- Optimize API calls

## Browser Compatibility

- Primary target: Chrome 88+
- Secondary: Chromium-based browsers
- Test on different screen sizes
- Consider accessibility requirements

## Release Process

1. **Version Bump**
   - Update version in `manifest.json`
   - Update version in `package.json`
   - Update CHANGELOG

2. **Testing**
   - Comprehensive manual testing
   - Performance verification
   - Security review

3. **Documentation**
   - Update README if needed
   - Document breaking changes
   - Update API documentation

4. **Package and Release**
   - Create release package
   - Tag release in Git
   - Update Chrome Web Store listing

## Getting Help

- **Questions**: Create a GitHub issue with the "question" label
- **Discussions**: Use GitHub Discussions for general topics
- **Bugs**: Report via GitHub Issues with detailed information

## Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Credited in the Chrome Web Store description

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to the Product Statistics Chrome Extension! 🎉