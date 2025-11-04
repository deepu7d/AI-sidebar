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

  // Add ESC key listener to close sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const container = document.getElementById('gemini-sidebar-container');
      if (container && container.classList.contains('gemini-sidebar-open')) {
        closeSidebar();
      }
    }
  });

  // Add click outside listener to close sidebar
  document.addEventListener('click', (e) => {
    const container = document.getElementById('gemini-sidebar-container');
    if (container && container.classList.contains('gemini-sidebar-open')) {
      // Check if click is outside the sidebar
      if (!sidebarContainer.contains(e.target)) {
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
  const container = document.getElementById('gemini-sidebar-container');
  if (container.classList.contains('gemini-sidebar-closed')) {
    container.classList.remove('gemini-sidebar-closed');
    container.classList.add('gemini-sidebar-open');
    // loadPrompts(); // Refresh prompts when opening
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
  console.log("Inside loadPrompts");
  const promptsContainer = document.getElementById('sidebar-prompts');
  if (!promptsContainer) return;

  // Use getElementsByTagName to find user-query-content custom elements
  const userQueryElements = document.getElementsByTagName('user-query-content');
  
  if (userQueryElements.length === 0) {
    promptsContainer.innerHTML = '<p class="no-prompts">No prompts found in this chat.</p>';
    console.log("No prompts found");
    return;
  }

  promptsContainer.innerHTML = ''; // Clear existing prompts
  let promptCount = 0;
  // Convert HTMLCollection to Array and process each user query element
  Array.from(userQueryElements).forEach((queryElement) => {
    console.log("Called")
    // Find the first <p> tag within the element
    const firstP = queryElement.querySelector('p');
    
    if (firstP && firstP.textContent.trim()) {
      const text = firstP.textContent.trim();
      
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
  closeSidebar();
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
  }, 1000);
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Create debounced version of loadPrompts
const debouncedLoadPrompts = debounce(loadPrompts, 500);

// Observe DOM changes to detect new prompts
function observeChatChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if new user-query-content elements were added
    const hasNewQueries = mutations.some(mutation => {
      return Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === 1) { // Element node
          // Check if it's the user-query-content custom element
          return node.tagName === 'USER-QUERY-CONTENT' || 
                 node.querySelector?.('user-query-content') !== null; // might remove this
        }
        return false;
      });
    });

    if (hasNewQueries) {
      console.log("New prompts detected, reloading...");
      // Use debounced version to avoid multiple rapid calls
      debouncedLoadPrompts();
      // loadPrompts();
    }
  });

  // Find the specific chat container (infinite-scroller or chat-history)
  const findChatContainer = () => {
    // Try to find the infinite-scroller element
    let chatContainer = document.querySelector('infinite-scroller[data-test-id="chat-history-container"]');
    
    // Fallback to other possible containers
    if (!chatContainer) {
      chatContainer = document.querySelector('infinite-scroller');
    }
    if (!chatContainer) {
      chatContainer = document.querySelector('.chat-history');
    }
    if (!chatContainer) {
      chatContainer = document.querySelector('[class*="conversation"]');
    }
    
    return chatContainer;
  };

  // Try to find the chat container
  const chatContainer = findChatContainer();
  
  if (chatContainer) {
    // Observe only the specific chat container, not the entire body
    observer.observe(chatContainer, {
      childList: true,
      subtree: true
    });
  } else {
    // If we can't find a specific container, retry after a short delay
    setTimeout(() => {
      const retryContainer = findChatContainer();
      if (retryContainer) {
        observer.observe(retryContainer, {
          childList: true,
          subtree: true
        });
      }
    }, 1000);
  }
}

// Track current URL to detect chat changes
// let currentChatId = null;
// let urlChangeTimeout = null;

// // Check if URL has changed (different chat)
// function checkUrlChange() {
//   const urlMatch = window.location.href.match(/\/app\/([a-f0-9]+)/);
//   const newChatId = urlMatch ? urlMatch[1] : null;
  
//   if (newChatId !== currentChatId) {
//     console.log("URL changed");
//     closeSidebar();
//     processedPrompts.clear();
//     currentChatId = newChatId;
//   }
// }

// function observeUrlChanges() {
//   checkUrlChange();
  
//   // Listen for popstate (back/forward navigation)
//   window.addEventListener('popstate', checkUrlChange);
  
//   // Use navigation API if available (modern browsers)
//   if ('navigation' in window) {
//     window.navigation.addEventListener('navigate', checkUrlChange);
//   }
  
// }

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createSidebar();
    observeUrlChanges();
  });
} else {
  // DOM is already loaded
  createSidebar();
  observeUrlChanges();
}
