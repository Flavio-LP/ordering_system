import React from 'react';
import { createRoot } from 'react-dom/client';
import OrderForm from '../components/OrderForm';
import '../../assets/stylesheets/pedidos.css';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pedidos-root');
  if (container) {
    const root = createRoot(container);
    root.render(<OrderForm />);
  }
});