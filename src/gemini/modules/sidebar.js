function createSidebar() {
  // Check if sidebar already exists
  if (document.getElementById('gemini-sidebar-container')) {
    return;
  }

  // sidebar container
  const sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'gemini-sidebar-container';
  sidebarContainer.className = 'gemini-sidebar-closed';

  // toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'gemini-sidebar-toggle';
  toggleButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  toggleButton.title = 'Toggle Prompts Sidebar';

  // sidebar content
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
  // Toggle sidebar when clicking the toggle button
  toggleButton.addEventListener('click', toggleSidebar);
  document
    .getElementById('sidebar-close')
    .addEventListener('click', closeSidebar);

  // Add key listener to close sidebar on any key press
  document.addEventListener('keydown', (e) => {
    const container = document.getElementById('gemini-sidebar-container');
    // Check if the sidebar is open, then close it
    if (container && container.classList.contains('gemini-sidebar-open')) {
      closeSidebar();
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
}

// Open sidebar
function openSidebar() {
  const container = document.getElementById('gemini-sidebar-container');
  if (container && container.classList.contains('gemini-sidebar-closed')) {
    container.classList.remove('gemini-sidebar-closed');
    container.classList.add('gemini-sidebar-open');
    // Optionally refresh prompts when opening
    loadPrompts();
  }
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
