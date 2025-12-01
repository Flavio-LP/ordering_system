import React, { useState, useEffect, useRef } from 'react';

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

const SearchableSelect: React.FC<{
  items: { id: number; nome: string; preco?: number }[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  maxVisible?: number;
}> = ({ items, value, onChange, placeholder = 'Selecione...', maxVisible = 10 }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const selected = items.find(i => i.id === parseInt(value));
    setQuery(selected ? selected.nome : '');
  }, [value, items]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const filtered = query.trim()
    ? items.filter(i => i.nome.toLowerCase().includes(query.toLowerCase()))
    : items;

  const itemHeight = 42;
  const maxHeight = Math.min(filtered.length, maxVisible) * itemHeight;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }} className="searchable-select">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input"
        aria-haspopup="listbox"
        aria-expanded={open}
      />
      <input type="hidden" value={value} />
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            zIndex: 30,
            left: 0,
            right: 0,
            marginTop: 6,
            background: 'white',
            borderRadius: 8,
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 10px 30px rgba(2,6,23,0.12)',
            maxHeight: `${maxHeight}px`,
            overflowY: filtered.length > maxVisible ? 'auto' : 'auto'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', color: '#6b7280' }}>Nenhum resultado</div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                role="option"
                onClick={() => { onChange(String(item.id)); setQuery(item.nome); setOpen(false); }}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid rgba(15,23,42,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{item.nome}</span>
                {typeof item.preco !== 'undefined' && (
                  <small style={{ color: '#6b7280' }}>R$ {item.preco}</small>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const PedidoForm: React.FC = () => {
  const [produtoId, setProdutoId] = useState('');
  const [pessoaId, setPessoaId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState<{id: number, nome: string, preco: number}[]>([]);
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

    const precoUnitario = produtos.find(p => p.id === parseInt(produtoId))?.preco || 0;
    const quantidadeNum = parseInt(quantidade);

    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pedido: {
          pessoa_id: parseInt(pessoaId),
          total: quantidadeNum * precoUnitario,
          pedido_produtos_attributes: [
            {
              produto_id: parseInt(produtoId),
              quantidade: quantidadeNum,
              preco_unitario: precoUnitario
            }
          ]
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
          <SearchableSelect
            items={produtos}
            value={produtoId}
            onChange={id => setProdutoId(id)}
            placeholder="Pesquisar/Selecionar Produto"
            maxVisible={10}
          />

          <SearchableSelect
            items={pessoas}
            value={pessoaId}
            onChange={id => setPessoaId(id)}
            placeholder="Pesquisar/Selecionar Pessoa"
            maxVisible={10}
          />

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