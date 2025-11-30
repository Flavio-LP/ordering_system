import React, { useState, useEffect } from 'react';

interface Pedido {
  id: number;
  produto_id: number;
  pessoa_id: number;
  quantidade: number;
  valor_total: number;
  data_pedido: string;
  produto_nome?: string;
  pessoa_nome?: string;
}

const PedidoForm: React.FC = () => {
  const [produtoId, setProdutoId] = useState('');
  const [pessoaId, setPessoaId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState<{id: number, nome: string}[]>([]);
  const [pessoas, setPessoas] = useState<{id: number, nome: string}[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPedidos();
    fetchProdutos();
    fetchPessoas();
  }, [currentPage, searchTerm]);

  const fetchPedidos = async () => {
    const response = await fetch(`/api/pedidos?page=${currentPage}&per_page=${itemsPerPage}&search=${searchTerm}`);
    const data = await response.json();
    setPedidos(data.pedidos || data);
    setTotalPages(data.total_pages || Math.ceil(data.length / itemsPerPage));
  };

  const fetchProdutos = async () => {
    const response = await fetch('/api/produtos');
    const data = await response.json();
    setProdutos(data);
  };

  const fetchPessoas = async () => {
    const response = await fetch('/api/pessoas');
    const data = await response.json();
    setPessoas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        pedido: { 
          produto_id: parseInt(produtoId), 
          pessoa_id: parseInt(pessoaId), 
          quantidade: parseInt(quantidade) 
        } 
      }),
    });
    setProdutoId('');
    setPessoaId('');
    setQuantidade('');
    setCurrentPage(1);
    fetchPedidos();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="pedidos-container">
      <h1>Cadastro de Pedidos</h1>
      
      <form onSubmit={handleSubmit} className="pedidos-form">
        <div className="pedidos-form-fields">
          <select 
            value={produtoId} 
            onChange={e => setProdutoId(e.target.value)} 
            required
          >
            <option value="">Selecione um Produto</option>
            {produtos.map(produto => (
              <option key={produto.id} value={produto.id}>{produto.nome}</option>
            ))}
          </select>
          
          <select 
            value={pessoaId} 
            onChange={e => setPessoaId(e.target.value)} 
            required
          >
            <option value="">Selecione uma Pessoa</option>
            {pessoas.map(pessoa => (
              <option key={pessoa.id} value={pessoa.id}>{pessoa.nome}</option>
            ))}
          </select>
          
          <input 
            value={quantidade} 
            onChange={e => setQuantidade(e.target.value)} 
            placeholder="Quantidade" 
            type="number" 
            required 
          />
        </div>
        <button type="submit">Cadastrar Pedido</button>
      </form>

      <div className="pedidos-search">
        <input 
          value={searchTerm} 
          onChange={e => handleSearch(e.target.value)} 
          placeholder="Buscar por produto ou pessoa..." 
        />
      </div>

      <div className="pedidos-table-wrapper">
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Pessoa</th>
              <th>Quantidade</th>
              <th>Valor Total</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(pedido => (
              <tr key={pedido.id}>
                <td>{pedido.produto_nome}</td>
                <td>{pedido.pessoa_nome}</td>
                <td>{pedido.quantidade}</td>
                <td>R$ {pedido.valor_total}</td>
                <td>{new Date(pedido.data_pedido).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pedidos-pagination">
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

export default PedidoForm;