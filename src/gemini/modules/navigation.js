function navigateToPrompt(element, pElement) {
  closeSidebar();
  // Scroll to the paragraph element for better precision
  const targetElement = pElement || element;
  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

function highlightPrompt(element) {
  // Remove previous highlights
  document.querySelectorAll('.gemini-highlight').forEach((el) => {
    el.classList.remove('gemini-highlight');
  });

  // Add highlight to current element
  element.classList.add('gemini-highlight');

  setTimeout(() => {
    element.classList.remove('gemini-highlight');
  }, 1000);
}
