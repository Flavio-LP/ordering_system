import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductForm from '../components/ProductForm';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<ProductForm />);
  }
});