// Main initialization
function init() {
  createSidebar();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also try to initialize after a short delay (for dynamic content)
setTimeout(() => {
  init();
}, 1000);
