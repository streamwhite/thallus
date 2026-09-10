import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { App } from './App';
import { applyExtensionUiFontSize } from '@/lib/font-size';

function renderSidePanel(): void {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) {
    throw new Error('Missing #app root');
  }

  applyExtensionUiFontSize();
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

try {
  renderSidePanel();
} catch (error) {
  console.error('Failed to start side panel', error);
}
