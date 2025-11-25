import React from 'react';
import { createRoot } from 'react-dom/client';
import PessoaForm from '../components/PeopleForm';
import '../../assets/stylesheets/pessoas.css';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pessoas-root');
  if (container) {
    const root = createRoot(container);
    root.render(<PessoaForm />);
  }
});