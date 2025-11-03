function createSidebar() {
  // Check if sidebar already exists
  if (document.getElementById('gemini-sidebar-container')) {
    return;
  }

  // Create sidebar container
  const sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'gemini-sidebar-container';
  sidebarContainer.className = 'gemini-sidebar-closed';

  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'gemini-sidebar-toggle';
  toggleButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  toggleButton.title = 'Toggle Prompts Sidebar';

  // Create sidebar content
  const sidebar = document.createElement('div');
  sidebar.id = 'gemini-sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h2>Chat Prompts</h2>
      <button id="sidebar-close" title="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="sidebar-content" id="sidebar-prompts">
      <p class="no-prompts">Loading prompts...</p>
    </div>
  `;

  sidebarContainer.appendChild(toggleButton);
  sidebarContainer.appendChild(sidebar);
  document.body.appendChild(sidebarContainer);

  // Add event listeners
  toggleButton.addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-close').addEventListener('click', closeSidebar);

  // Initial load of prompts
  loadPrompts();

  // Set up observer to detect new prompts
  observeChatChanges();
}

// Toggle sidebar open/closed
function toggleSidebar() {
  const container = document.getElementById('gemini-sidebar-container');
  if (container.classList.contains('gemini-sidebar-closed')) {
    container.classList.remove('gemini-sidebar-closed');
    container.classList.add('gemini-sidebar-open');
    loadPrompts(); // Refresh prompts when opening
  } else {
    closeSidebar();
  }
}

// Close sidebar
function closeSidebar() {
  const container = document.getElementById('gemini-sidebar-container');
  container.classList.remove('gemini-sidebar-open');
  container.classList.add('gemini-sidebar-closed');
}

// Load all prompts from the chat
function loadPrompts() {
  const promptsContainer = document.getElementById('sidebar-prompts');
  if (!promptsContainer) return;

  // Try multiple selectors to find user query elements
  let userQueryElements = [];
  
  // Try finding elements with class 'user-query-content' (most specific)
  userQueryElements = document.querySelectorAll('.user-query-content');
  
  // If not found, try 'user-query'
  if (userQueryElements.length === 0) {
    userQueryElements = document.querySelectorAll('.user-query');
  }
  
  // If still not found, try other common patterns
  if (userQueryElements.length === 0) {
    userQueryElements = document.querySelectorAll('[class*="user"]');
  }
  
  if (userQueryElements.length === 0) {
    promptsContainer.innerHTML = '<p class="no-prompts">No prompts found in this chat.</p>';
    return;
  }

  // Clear existing content
  promptsContainer.innerHTML = '';

  let promptCount = 0;
  const seenTexts = new Set(); // Track unique prompts to avoid duplicates
  
  // Process each user query element
  userQueryElements.forEach((queryElement) => {
    // Find the first <p> tag within the element
    const firstP = queryElement.querySelector('p');
    
    if (firstP && firstP.textContent.trim()) {
      const text = firstP.textContent.trim();
      
      // Skip if we've already seen this exact text (deduplication)
      if (seenTexts.has(text)) {
        return;
      }
      seenTexts.add(text);
      
      promptCount++;
      const promptItem = document.createElement('div');
      promptItem.className = 'prompt-item';
      promptItem.dataset.index = promptCount - 1;

      const promptNumber = document.createElement('span');
      promptNumber.className = 'prompt-number';
      promptNumber.textContent = `#${promptCount}`;

      const promptText = document.createElement('div');
      promptText.className = 'prompt-text';
      promptText.textContent = text;

      promptItem.appendChild(promptNumber);
      promptItem.appendChild(promptText);

      // Store reference to the original element
      promptItem.dataset.targetElement = true;
      
      // Add click handler to navigate to the prompt
      promptItem.addEventListener('click', () => {
        navigateToPrompt(queryElement, firstP);
        highlightPrompt(queryElement);
      });

      promptsContainer.appendChild(promptItem);
    }
  });

  if (promptCount === 0) {
    promptsContainer.innerHTML = '<p class="no-prompts">No prompts found in this chat.</p>';
  } else {
    // Update count in header
    const header = document.querySelector('.sidebar-header h2');
    if (header) {
      header.textContent = `Chat Prompts (${promptCount})`;
    }
  }
}

// Navigate to a specific prompt in the chat
function navigateToPrompt(element, pElement) {
  // Scroll to the paragraph element for better precision
  const targetElement = pElement || element;
  targetElement.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center'
  });
}

// Highlight the selected prompt temporarily
function highlightPrompt(element) {
  // Remove previous highlights
  document.querySelectorAll('.gemini-highlight').forEach(el => {
    el.classList.remove('gemini-highlight');
  });

  // Add highlight to current element
  element.classList.add('gemini-highlight');

  // Remove highlight after 2 seconds
  setTimeout(() => {
    element.classList.remove('gemini-highlight');
  }, 2000);
}

// Observe DOM changes to detect new prompts
function observeChatChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if new user query elements were added
    const hasNewQueries = mutations.some(mutation => {
      return Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === 1) { // Element node
          return node.classList?.contains('user-query') || 
                 node.classList?.contains('user-query-content') ||
                 node.querySelector?.('.user-query') ||
                 node.querySelector?.('.user-query-content') ||
                 (node.className && typeof node.className === 'string' && node.className.includes('user'));
        }
        return false;
      });
    });

    if (hasNewQueries) {
      // Reload prompts when new ones are detected
      setTimeout(loadPrompts, 500); // Small delay to ensure DOM is fully updated
    }
  });

  // Observe the main chat container
  const chatContainer = document.body;
  observer.observe(chatContainer, {
    childList: true,
    subtree: true
  });
}

// Track current URL to detect chat changes
let currentChatId = null;
let urlChangeTimeout = null;

// Check if URL has changed (different chat)
function checkUrlChange() {
  const urlMatch = window.location.href.match(/\/app\/([a-f0-9]+)/);
  const newChatId = urlMatch ? urlMatch[1] : null;
  
  if (newChatId !== currentChatId) {
    currentChatId = newChatId;
    
    // Clear any pending reload
    if (urlChangeTimeout) {
      clearTimeout(urlChangeTimeout);
    }
    
    // Initial immediate load
    loadPrompts();
    
    // Retry loading every second for 5 seconds (in case content is still loading)
    let retryCount = 0;
    urlChangeTimeout = setInterval(() => {
      retryCount++;
      loadPrompts();
      
      if (retryCount >= 5) {
        clearInterval(urlChangeTimeout);
      }
    }, 500);
  }
}

// Monitor URL changes for navigation between chats
function observeUrlChanges() {
  // Check URL on initial load
  checkUrlChange();
  
  // Use MutationObserver to detect navigation changes
  const observer = new MutationObserver(() => {
    checkUrlChange();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also listen for popstate (back/forward navigation)
  window.addEventListener('popstate', checkUrlChange);
  
  // Check periodically as backup
  setInterval(checkUrlChange, 2000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createSidebar();
    observeUrlChanges();
  });
} else {
  createSidebar();
  observeUrlChanges();
}

// Also try to initialize after a short delay (for dynamic content)
setTimeout(() => {
  createSidebar();
  observeUrlChanges();
}, 1000);
