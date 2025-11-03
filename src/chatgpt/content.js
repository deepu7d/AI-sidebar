function createSidebar() {
  // Check if sidebar already exists
  if (document.getElementById('chatgpt-sidebar-container')) {
    return;
  }

  // Create sidebar container
  const sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'chatgpt-sidebar-container';
  sidebarContainer.className = 'chatgpt-sidebar-closed';

  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'chatgpt-sidebar-toggle';
  toggleButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  toggleButton.title = 'Toggle Prompts Sidebar';

  // Create sidebar content
  const sidebar = document.createElement('div');
  sidebar.id = 'chatgpt-sidebar';
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

  // Add ESC key listener to close sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const container = document.getElementById('chatgpt-sidebar-container');
      if (container && container.classList.contains('chatgpt-sidebar-open')) {
        closeSidebar();
      }
    }
  });

  // Initial load of prompts
  loadPrompts();

  // Set up observer to detect new prompts
  observeChatChanges();
}

// Toggle sidebar open/closed
function toggleSidebar() {
  const container = document.getElementById('chatgpt-sidebar-container');
  if (container.classList.contains('chatgpt-sidebar-closed')) {
    container.classList.remove('chatgpt-sidebar-closed');
    container.classList.add('chatgpt-sidebar-open');
    loadPrompts(); // Refresh prompts when opening
  } else {
    closeSidebar();
  }
}

// Close sidebar
function closeSidebar() {
  const container = document.getElementById('chatgpt-sidebar-container');
  container.classList.remove('chatgpt-sidebar-open');
  container.classList.add('chatgpt-sidebar-closed');
}

// Load all prompts from the chat
function loadPrompts() {
  const promptsContainer = document.getElementById('sidebar-prompts');
  if (!promptsContainer) return;

  // Find all user message elements using the data-turn attribute
  const userArticles = document.querySelectorAll('article[data-turn="user"]');
  
  if (userArticles.length === 0) {
    promptsContainer.innerHTML = '<p class="no-prompts">No prompts found in this chat.</p>';
    return;
  }

  // Clear existing content
  promptsContainer.innerHTML = '';

  let promptCount = 0;
  
  // Process each user article element
  userArticles.forEach((article) => {
    // Find the message content within the article
    // Look for the whitespace-pre-wrap div which contains the actual message text
    const messageDiv = article.querySelector('.whitespace-pre-wrap');
    
    if (messageDiv && messageDiv.textContent.trim()) {
      const text = messageDiv.textContent.trim();
      
      
      promptCount++;
      const promptItem = document.createElement('div');
      promptItem.className = 'prompt-item';
      promptItem.dataset.index = promptCount - 1;

      const promptNumber = document.createElement('span');
      promptNumber.className = 'prompt-number';
      promptNumber.textContent = `#${promptCount}`;

      const promptText = document.createElement('div');
      promptText.className = 'prompt-text';
      // Truncate long messages for display
      const displayText = text.length > 150 ? text.substring(0, 150) + '...' : text;
      promptText.textContent = displayText;
      promptText.title = text; // Show full text on hover

      promptItem.appendChild(promptNumber);
      promptItem.appendChild(promptText);

      // Store reference to the original element
      promptItem.dataset.targetElement = true;
      
      // Add click handler to navigate to the prompt
      promptItem.addEventListener('click', () => {
        navigateToPrompt(article);
        highlightPrompt(article);
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
function navigateToPrompt(element) {
  // Scroll to the article element
  element.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center'
  });
  closeSidebar()
}

// Highlight the selected prompt temporarily
function highlightPrompt(element) {
  // Remove previous highlights
  document.querySelectorAll('.chatgpt-highlight').forEach(el => {
    el.classList.remove('chatgpt-highlight');
  });

  // Add highlight to current element
  element.classList.add('chatgpt-highlight');

  // Remove highlight after 2 seconds
  setTimeout(() => {
    element.classList.remove('chatgpt-highlight');
  }, 1000);
}

// Observe DOM changes to detect new prompts
function observeChatChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if new user article elements were added
    const hasNewQueries = mutations.some(mutation => {
      return Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === 1) { // Element node
          // Check if it's an article with data-turn="user"
          if (node.tagName === 'ARTICLE' && node.getAttribute('data-turn') === 'user') {
            return true;
          }
          // Or if it contains such an article
          return node.querySelector?.('article[data-turn="user"]') !== null;
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
  // ChatGPT URL pattern: https://chatgpt.com/c/{chat-id}
  const urlMatch = window.location.href.match(/\/c\/([a-f0-9-]+)/);
  const newChatId = urlMatch ? urlMatch[1] : null;
  
  if (newChatId !== currentChatId) {
    currentChatId = newChatId;
    closeSidebar();
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
