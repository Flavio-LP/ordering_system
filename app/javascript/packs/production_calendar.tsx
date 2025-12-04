import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductionCalendar from '../components/ProductionCalendar';

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('production-calendar-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<ProductionCalendar />);
  }
});