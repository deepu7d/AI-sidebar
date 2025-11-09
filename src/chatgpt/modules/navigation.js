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
