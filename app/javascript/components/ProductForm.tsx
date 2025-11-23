import React, { useState, useEffect } from 'react';

interface Produto {
  id: number;
  nome: string;
  preco: number;
  descricao?: string;
}

const ProductForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProdutos();
  }, [currentPage, searchTerm]);

  const fetchProdutos = async () => {
    const response = await fetch(`/produtos.json?page=${currentPage}&per_page=${itemsPerPage}&search=${searchTerm}`);
    const data = await response.json();
    setProdutos(data.produtos || data);
    setTotalPages(data.total_pages || Math.ceil(data.length / itemsPerPage));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produto: { nome, preco, descricao } }),
    });
    setNome('');
    setPreco('');
    setDescricao('');
    setCurrentPage(1);
    fetchProdutos();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 20 }}>
      <h1>Produtos</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <div style={{ marginBottom: 10 }}>
          <input 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            placeholder="Nome" 
            required 
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            value={preco} 
            onChange={e => setPreco(e.target.value)} 
            placeholder="Preço" 
            type="number" 
            step="0.01" 
            required 
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <textarea 
            value={descricao} 
            onChange={e => setDescricao(e.target.value)} 
            placeholder="Descrição" 
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>Cadastrar Produto</button>
      </form>

      <div style={{ marginBottom: 20 }}>
        <input 
          value={searchTerm} 
          onChange={e => handleSearch(e.target.value)} 
          placeholder="Buscar por nome..." 
          style={{ width: '100%', padding: 10, fontSize: 16 }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Nome</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Preço</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(produto => (
            <tr key={produto.id}>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{produto.nome}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>R$ {produto.preco}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{produto.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ padding: '8px 16px' }}
        >
          Anterior
        </button>
        <span style={{ padding: '8px 16px' }}>
          Página {currentPage} de {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{ padding: '8px 16px' }}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default ProductForm;