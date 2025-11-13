import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
// --- הוסף את הקוד הזה החל משורה 11 ואילך ---

// Function to toggle between light and dark themes and save the preference
function toggleDarkMode() {
    // 1. Determine the current theme set on the root HTML element
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // 2. Apply the new theme attribute (triggers the CSS variables change)
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 3. Save the preference locally so it persists across user sessions
    localStorage.setItem('theme', newTheme);

    // 4. Update the icon for visual feedback
    const iconElement = document.getElementById('toggle-icon');
    if (iconElement) {
        iconElement.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Function to load the saved preference when the page loads
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    // Apply the saved theme immediately
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Default to light mode
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// --- Event Handlers (Connecting the JS to the HTML) ---
// We use DOMContentLoaded to ensure the button element is available before we attach the listener.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load the user's saved theme preference immediately
    loadSavedTheme(); 

    // 2. Attach the toggle function to the button click event
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleDarkMode);
    }
});
