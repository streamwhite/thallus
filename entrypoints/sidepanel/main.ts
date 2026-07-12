import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';
import { applyExtensionUiFontSize } from '@/lib/font-size';

function main(): void {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) {
    throw new Error('Missing #app root');
  }

  applyExtensionUiFontSize();
}

try {
  main();
} catch (error) {
  console.error('Failed to start side panel', error);
}
