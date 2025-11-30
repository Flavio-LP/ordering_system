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
    <div className="produtos-container">
      <h1>Produtos</h1>
      
      <form onSubmit={handleSubmit} className="produtos-form">
        <div className="produtos-form-fields">
          <input 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            placeholder="Nome" 
            required 
          />
          <input 
            value={preco} 
            onChange={e => setPreco(e.target.value)} 
            placeholder="Preço" 
            type="number" 
            step="0.01" 
            required 
          />
          <textarea 
            value={descricao} 
            onChange={e => setDescricao(e.target.value)} 
            placeholder="Descrição" 
          />
        </div>
        <button type="submit">Cadastrar Produto</button>
      </form>

      <div className="produtos-search">
        <input 
          value={searchTerm} 
          onChange={e => handleSearch(e.target.value)} 
          placeholder="Buscar por nome..." 
        />
      </div>

      <div className="produtos-table-wrapper">
        <table className="produtos-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(produto => (
              <tr key={produto.id}>
                <td>{produto.nome}</td>
                <td>R$ {produto.preco}</td>
                <td>{produto.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="produtos-pagination">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default ProductForm;