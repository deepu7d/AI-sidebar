// Get sort order from local storage
function getSortOrder() {
  const stored = localStorage.getItem('gemini-sidebar-sort-order');
  return stored === 'oldest-first' ? 'oldest-first' : 'newest-first'; // default to newest-first
}

// Set sort order in local storage
function setSortOrder(order) {
  localStorage.setItem('gemini-sidebar-sort-order', order);
}

// Toggle sort order
function toggleSortOrder() {
  const currentOrder = getSortOrder();
  const newOrder = currentOrder === 'newest-first' ? 'oldest-first' : 'newest-first';
  setSortOrder(newOrder);
  loadPrompts(); // Reload prompts with new order
}

function loadPrompts() {
  console.log('Loading prompts into sidebar...');
  const promptsContainer = document.getElementById('sidebar-prompts');
  if (!promptsContainer) return;

  const userQueryElements = document.getElementsByTagName('user-query-content');

  if (userQueryElements.length === 0) {
    promptsContainer.innerHTML =
      '<p class="no-prompts">No prompts found in this chat.</p>';
    console.log('No prompts found');
    return;
  }

  promptsContainer.innerHTML = ''; // Clear existing prompts
  let promptCount = 0;
  const promptItems = [];
  const sortOrder = getSortOrder();

  // Convert HTMLCollection to Array, reverse it, and process each user query element
  Array.from(userQueryElements).forEach((queryElement) => {
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
      promptNumber.textContent = `${promptCount}`;

      const promptText = document.createElement('div');
      promptText.className = 'prompt-text';
      promptText.textContent = text;

      promptItem.appendChild(promptNumber);
      promptItem.appendChild(promptText);

      // store reference to the original element
      promptItem.dataset.targetElement = true;

      promptItem.addEventListener('click', () => {
        navigateToPrompt(queryElement, firstP);
        highlightPrompt(queryElement);
      });

      promptItems.push(promptItem);
    }
  });

  // Apply sort order based on preference
  if (sortOrder === 'newest-first') {
    promptItems.reverse();
  }
  
  promptItems.forEach((promptItem) => {
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

