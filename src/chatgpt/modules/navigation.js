// Navigation and highlighting functions
function navigateToPrompt(element) {
  // Scroll to the article element
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
  closeSidebar();
}

// Highlight the selected prompt temporarily
function highlightPrompt(element) {
  // Remove previous highlights
  document.querySelectorAll('.chatgpt-highlight').forEach((el) => {
    el.classList.remove('chatgpt-highlight');
  });

  // Add highlight to current element
  element.classList.add('chatgpt-highlight');

  // Remove highlight after 2 seconds
  setTimeout(() => {
    element.classList.remove('chatgpt-highlight');
  }, 1000);
}

// Track current URL to detect chat changes
let currentChatId = null;
let urlChangeTimeout = null;

// Check if URL has changed (different chat)
function checkUrlChange() {
  // ChatGPT URL pattern: https://chatgpt.com/c/{chat-id}
  const urlMatch = window.location.href.match(/\/c\/([a-f0-9-]+)/);
  const newChatId = urlMatch ? urlMatch[1] : null;

  if (newChatId !== currentChatId) {
    currentChatId = newChatId;
    closeSidebar();
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
