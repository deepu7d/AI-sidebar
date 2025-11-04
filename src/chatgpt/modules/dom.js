// DOM manipulation and prompt loading
function loadPrompts() {
  console.log('Loading prompts into sidebar...');
  const promptsContainer = document.getElementById('sidebar-prompts');
  if (!promptsContainer) return;

  // Find all user message elements using the data-turn attribute
  const userArticles = document.querySelectorAll('article[data-turn="user"]');

  if (userArticles.length === 0) {
    promptsContainer.innerHTML =
      '<p class="no-prompts">No prompts found in this chat.</p>';
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
      const displayText =
        text.length > 150 ? text.substring(0, 150) + '...' : text;
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
const debouncedLoadPrompts = debounce(loadPrompts, 500);
// Observe DOM changes to detect new prompts
function observeChatChanges() {
  const observer = new MutationObserver((mutations) => {
    // Check if new user article elements were added
    const hasNewQueries = mutations.some((mutation) => {
      return Array.from(mutation.addedNodes).some((node) => {
        if (node.nodeType === 1) {
          // Element node
          // Check if it's an article with data-turn="user"
          if (
            node.tagName === 'ARTICLE' &&
            node.getAttribute('data-turn') === 'user'
          ) {
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
      debouncedLoadPrompts();
    }
  });

  // Observe the main chat container
  const chatContainer = document.body;
  observer.observe(chatContainer, {
    childList: true,
    subtree: true,
  });
}
