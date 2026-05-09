import React from 'react';
import { createRoot } from 'react-dom/client';
import OrbitMenu from './components/orbit-menu.jsx';

const rootElement = document.getElementById('orbit-root') || document.getElementById('app');
if (rootElement) {
  createRoot(rootElement).render(<OrbitMenu />);
} else {
  console.error('OrbitMenu: No root element found (needs #orbit-root or #app).');
}
