import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductForm from '../components/ProductForm';

global.fetch = jest.fn();

describe('ProductForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ produtos: [], total_pages: 1 }),
    });
  });

  test('renders form fields', () => {
    render(<ProductForm />);
    expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Preço')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument();
  });

  test('submits form with correct data', async () => {
    render(<ProductForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByPlaceholderText('Preço'), { target: { value: '10.5' } });
    fireEvent.change(screen.getByPlaceholderText('Descrição'), { target: { value: 'Desc' } });
    
    fireEvent.click(screen.getByText('Cadastrar Produto'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto: { nome: 'Teste', preco: '10.5', descricao: 'Desc' } }),
      });
    });
  });

  test('clears form after submission', async () => {
    render(<ProductForm />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument();
    });

    const nomeInput = screen.getByPlaceholderText('Nome') as HTMLInputElement;
    const precoInput = screen.getByPlaceholderText('Preço') as HTMLInputElement;
    
    fireEvent.change(nomeInput, { target: { value: 'Teste' } });
    fireEvent.change(precoInput, { target: { value: '10.5' } });
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ id: 1 }),
    }).mockResolvedValueOnce({
      json: async () => ({ produtos: [], total_pages: 1 }),
    });

    fireEvent.click(screen.getByText('Cadastrar Produto'));

    await waitFor(() => {
      expect(nomeInput.value).toBe('');
    });
  });

});