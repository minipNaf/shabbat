import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  const iconElement = document.getElementById('toggle-icon');
  if (iconElement) {
    iconElement.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  }
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    const iconElement = document.getElementById('toggle-icon');
    if (iconElement) {
      iconElement.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadSavedTheme();
  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleDarkMode);
  }
});
