// Navigation and highlighting functions
function navigateToPrompt(element, pElement) {
  closeSidebar();
  // Scroll to the paragraph element for better precision
  const targetElement = pElement || element;
  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

// Highlight the selected prompt temporarily
function highlightPrompt(element) {
  // Remove previous highlights
  document.querySelectorAll('.gemini-highlight').forEach((el) => {
    el.classList.remove('gemini-highlight');
  });

  // Add highlight to current element
  element.classList.add('gemini-highlight');

  // Remove highlight after 2 seconds
  setTimeout(() => {
    element.classList.remove('gemini-highlight');
  }, 1000);
}

// Track current URL to detect chat changes
let currentChatId = null;
let urlChangeTimeout = null;

// Check if URL has changed (different chat)
function checkUrlChange() {
  const urlMatch = window.location.href.match(/\/app\/([a-f0-9]+)/);
  const newChatId = urlMatch ? urlMatch[1] : null;

  if (newChatId !== currentChatId) {
    console.log('URL changed');
    closeSidebar();
    currentChatId = newChatId;
  }
}

function observeUrlChanges() {
  checkUrlChange();

  // Listen for popstate (back/forward navigation)
  window.addEventListener('popstate', checkUrlChange);

  // Use navigation API if available (modern browsers)
  if ('navigation' in window) {
    window.navigation.addEventListener('navigate', checkUrlChange);
  }
}
