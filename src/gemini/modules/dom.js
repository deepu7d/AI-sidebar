// DOM manipulation and prompt loading
function loadPrompts() {
  console.log('Inside loadPrompts');
  const promptsContainer = document.getElementById('sidebar-prompts');
  if (!promptsContainer) return;

  // Use getElementsByTagName to find user-query-content custom elements
  const userQueryElements = document.getElementsByTagName('user-query-content');

  if (userQueryElements.length === 0) {
    promptsContainer.innerHTML =
      '<p class="no-prompts">No prompts found in this chat.</p>';
    console.log('No prompts found');
    return;
  }

  promptsContainer.innerHTML = ''; // Clear existing prompts
  let promptCount = 0;
  // Convert HTMLCollection to Array and process each user query element
  Array.from(userQueryElements).forEach((queryElement) => {
    console.log('Called');
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
    promptsContainer.innerHTML =
      '<p class="no-prompts">No prompts found in this chat.</p>';
  } else {
    // Update count in header
    const header = document.querySelector('.sidebar-header h2');
    if (header) {
      header.textContent = `Chat Prompts (${promptCount})`;
    }
  }
}

// Create debounced version of loadPrompts
const debouncedLoadPrompts = debounce(loadPrompts, 500);

// Observe DOM changes to detect new prompts
function observeChatChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if new user-query-content elements were added
    const hasNewQueries = mutations.some((mutation) => {
      return Array.from(mutation.addedNodes).some((node) => {
        if (node.nodeType === 1) {
          // Element node
          // Check if it's the user-query-content custom element
          return (
            node.tagName === 'USER-QUERY-CONTENT' ||
            node.querySelector?.('user-query-content') !== null
          ); // might remove this
        }
        return false;
      });
    });

    if (hasNewQueries) {
      console.log('New prompts detected, reloading...');
      // Use debounced version to avoid multiple rapid calls
      debouncedLoadPrompts();
      // loadPrompts();
    }
  });

  // Find the specific chat container (infinite-scroller or chat-history)
  const findChatContainer = () => {
    // Try to find the infinite-scroller element
    let chatContainer = document.querySelector(
      'infinite-scroller[data-test-id="chat-history-container"]'
    );

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
      subtree: true,
    });
  } else {
    // If we can't find a specific container, retry after a short delay
    setTimeout(() => {
      const retryContainer = findChatContainer();
      if (retryContainer) {
        observer.observe(retryContainer, {
          childList: true,
          subtree: true,
        });
      }
    }, 1000);
  }
}
