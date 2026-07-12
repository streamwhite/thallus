import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import { applyExtensionUiFontSize } from '@/lib/font-size';

function renderApp(root: HTMLElement): void {
  root.innerHTML = `
    <header class="mb-3">
      <h1 class="h4 mb-1">Extension Dev Template</h1>
      <p class="text-secondary small mb-0">
        Side panel stays open until you close it.
      </p>
    </header>
  `;
}

function main(): void {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) {
    throw new Error('Missing #app root');
  }

  applyExtensionUiFontSize();
  renderApp(root);
}

try {
  main();
} catch (error) {
  console.error('Failed to start side panel', error);
}
