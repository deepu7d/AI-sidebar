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
  const promptItems = [];

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
      promptNumber.textContent = `${promptCount}`;

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

      promptItems.push(promptItem);
    }
  });

  // Reverse the order to show most recent prompts first
  promptItems.reverse().forEach((promptItem) => {
    promptsContainer.appendChild(promptItem);
  });

  if (promptCount === 0) {
    promptsContainer.innerHTML =
      '<p class="no-prompts">No prompts found in this chat.</p>';
  } else {
    // Update count in header
    const header = document.querySelector('.sidebar-header h2');
    if (header) {
      header.textContent = `Recent Chats (${promptCount})`;
    }
  }
}

