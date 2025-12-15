import React, { useState, useEffect, useRef, useMemo } from 'react';

interface Pedido {
  id: number;
  pessoa_id: number;
  total: number;
  data_pedido: string;
  pessoa_nome?: string;
  data_entrega: string;
  status: number;
  pedido_produtos: PedidoProduto[];
}

interface PedidoProduto {
  id?: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  produto_nome?: string;
  _destroy?: boolean;
}

interface ItemCarrinho {
  id?: number;
  produto_id: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
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

  const selectedItem = useMemo(() => {
    return value ? items.find(i => i.id === parseInt(value)) : null;
  }, [value, items]);

  useEffect(() => {
    if (selectedItem && query !== selectedItem.nome) {
      setQuery(selectedItem.nome);
    } else if (!value && query) {
      setQuery('');
    }
  }, [selectedItem, value, query]);

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
    <div ref={ref} className="searchable-select">
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
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {filtered.length === 0 ? (
            <div>Nenhum resultado</div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                role="option"
                onClick={() => { onChange(String(item.id)); setOpen(false); }}
              >
                <span>{item.nome}</span>
                {item.preco !== undefined && item.preco !== null && (
                  <small>R$ {Number(item.preco).toFixed(2)}</small>
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
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState<{id: number, nome: string, preco: number}[]>([]);
  const [pessoas, setPessoas] = useState<{id: number, nome: string}[]>([]);
  const [editandoPedido, setEditandoPedido] = useState<Pedido | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataEntrega, setDataEntrega] = useState('');
  const [status, setStatus] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProdutos(), fetchPessoas()]);
      await fetchPedidos();
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [currentPage, searchTerm]);

  const fetchPedidos = async () => {
    try {
      const response = await fetch(`/api/pedidos?page=${currentPage}&per_page=${itemsPerPage}&search=${searchTerm}`);
      const data = await response.json();
      setPedidos(data.pedidos ? data.pedidos.filter((p: Pedido) => p.status === 0) : (data || []));
      setTotalPages(data.total_pages || Math.ceil((data.pedidos || data || []).length / itemsPerPage) || 1);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setPedidos([]);
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      const data = await response.json();
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos([]);
    }
  };

  const fetchPessoas = async () => {
    try {
      const response = await fetch('/api/pessoas');
      const data = await response.json();
      setPessoas(data || []);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
      setPessoas([]);
    }
  };

  const adicionarAoCarrinho = () => {
    if (!produtoId || !quantidade) return;

    const produto = produtos.find(p => p.id === parseInt(produtoId));
    if (!produto) return;

    const itemExistente = carrinho.find(item => item.produto_id === produto.id);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item.produto_id === produto.id
          ? { ...item, quantidade: item.quantidade + parseInt(quantidade) }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        produto_id: produto.id,
        produto_nome: produto.nome,
        quantidade: parseInt(quantidade),
        preco_unitario: Number(produto.preco)
      }]);
    }

    setProdutoId('');
    setQuantidade('');
  };

  const editarQuantidade = (produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) return;
    setCarrinho(carrinho.map(item =>
      item.produto_id === produtoId
        ? { ...item, quantidade: novaQuantidade }
        : item
    ));
  };

  const removerDoCarrinho = (produtoId: number) => {
    if (editandoPedido && carrinho.length === 1) {
      setShowDeleteModal(true);
    } else {
      setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
    }
  };

  const excluirPedido = async () => {
    if (!editandoPedido) return;

    try {
      const response = await fetch(`/api/pedidos/${editandoPedido.id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setShowDeleteModal(false);
        cancelarEdicao();
        await fetchPedidos();
      } else {
        const error = await response.json();
        console.error('Erro ao excluir pedido:', error);
        alert('Erro ao excluir pedido. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      alert('Erro ao excluir pedido. Tente novamente.');
    }
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.quantidade * Number(item.preco_unitario)), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pessoaId || carrinho.length === 0) return;

    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pedido: {
          pessoa_id: parseInt(pessoaId),
          total: calcularTotal(),
          data_entrega: dataEntrega,
          status: status,
          pedido_produtos_attributes: carrinho.map(item => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: Number(item.preco_unitario)
          }))
        }
      }),
    });

    setPessoaId('');
    setCarrinho([]);
    setDataEntrega('');
    setStatus(0);
    setCurrentPage(1);
    await fetchPedidos();
  };

  const editarPedido = (pedido: Pedido) => {
    setEditandoPedido(pedido);
    setPessoaId(String(pedido.pessoa_id));
    setDataEntrega(pedido.data_entrega ? pedido.data_entrega.split('T')[0] : '');
    setStatus(pedido.status || 0);
    setCarrinho(pedido.pedido_produtos.map(pp => ({
      id: pp.id,
      produto_id: pp.produto_id,
      produto_nome: pp.produto_nome || '',
      quantidade: pp.quantidade,
      preco_unitario: Number(pp.preco_unitario)
    })));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editandoPedido || !pessoaId || carrinho.length === 0) return;

    const pedidoProdutosAttributes = carrinho.map(item => ({
      id: item.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      preco_unitario: Number(item.preco_unitario)
    }));

    const idsNoCarrinho = carrinho.map(item => item.id).filter(id => id !== undefined);
    const pedidoProdutosRemovidos = editandoPedido.pedido_produtos
      .filter(pp => pp.id && !idsNoCarrinho.includes(pp.id))
      .map(pp => ({
        id: pp.id,
        _destroy: true
      }));

    const response = await fetch(`/api/pedidos/${editandoPedido.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pedido: {
          pessoa_id: parseInt(pessoaId),
          total: calcularTotal(),
          data_entrega: dataEntrega,
          status: status,
          pedido_produtos_attributes: [...pedidoProdutosAttributes, ...pedidoProdutosRemovidos]
        }
      }),
    });

    if (response.ok) {
      cancelarEdicao();
      await fetchPedidos();
    }
  };

  const cancelarEdicao = () => {
    setEditandoPedido(null);
    setPessoaId('');
    setCarrinho([]);
    setDataEntrega('');
    setStatus(0);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="pedidos-container">
      <h1>{editandoPedido ? 'Editar Pedido' : 'Cadastro de Pedidos'}</h1>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Excluir Pedido</h2>
            <p>Este é o último item do pedido. Deseja excluir o pedido completo?</p>
            <div className="modal-actions">
              <button onClick={excluirPedido} className="btn-confirmar">Sim, excluir</button>
              <button onClick={() => setShowDeleteModal(false)} className="btn-cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={editandoPedido ? handleUpdate : handleSubmit} className="pedidos-form">
        <div className="pedidos-form-fields">
          <SearchableSelect
            items={pessoas}
            value={pessoaId}
            onChange={id => setPessoaId(id)}
            placeholder="Pesquisar/Selecionar Pessoa"
            maxVisible={10}
          />

          <div className="form-row">
            <div className="form-group">
              <label>Data de Entrega</label>
              <input
                type="date"
                value={dataEntrega}
                onChange={e => setDataEntrega(e.target.value)}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={status}
                onChange={e => setStatus(parseInt(e.target.value))}
                className="input"
              >
                <option value={0}>Pendente</option>
                <option value={1}>Entregue</option>
              </select>
            </div>
          </div>

          <div className="adicionar-item">
            <SearchableSelect
              items={produtos}
              value={produtoId}
              onChange={id => setProdutoId(id)}
              placeholder="Pesquisar/Selecionar Produto"
              maxVisible={10}
            />
            <input
              type="number"
              value={quantidade}
              onChange={e => setQuantidade(e.target.value)}
              placeholder="Quantidade"
              min="1"
            />
            <button type="button" onClick={adicionarAoCarrinho} className="btn-adicionar">
              Adicionar
            </button>
          </div>
        </div>

        {carrinho.length > 0 && (
          <div className="carrinho">
            <h3>Itens do Pedido</h3>
            <table className="carrinho-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {carrinho.map(item => (
                  <tr key={item.produto_id}>
                    <td>{item.produto_nome}</td>
                    <td>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={e => editarQuantidade(item.produto_id, parseInt(e.target.value))}
                        min="1"
                        style={{ width: '80px', padding: '5px' }}
                      />
                    </td>
                    <td>R$ {Number(item.preco_unitario).toFixed(2)}</td>
                    <td>R$ {(item.quantidade * Number(item.preco_unitario)).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removerDoCarrinho(item.produto_id)}
                        className="btn-remover"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total</td>
                  <td colSpan={2}>R$ {calcularTotal().toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={!pessoaId || carrinho.length === 0}>
            {editandoPedido ? 'Atualizar Pedido' : 'Criar Pedido'}
          </button>
          {editandoPedido && (
            <button type="button" onClick={cancelarEdicao} className="btn-cancelar">
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      <div className="pedidos-search">
        <input
          type="text"
          placeholder="Buscar por nome, sobrenome, empresa ou setor..."
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      <div className="pedidos-table-wrapper">
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pessoa</th>
              <th>Total</th>
              <th>Data Pedido</th>
              <th>Data Entrega</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(pedido => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.pessoa_nome}</td>
                <td>R$ {Number(pedido.total).toFixed(2)}</td>
                <td>{new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</td>
                <td>{pedido.data_entrega ? new Date(pedido.data_entrega).toLocaleDateString('pt-BR') : '-'}</td>
                <td>
                  <span className={`status-badge ${pedido.status === 1 ? 'entregue' : 'pendente'}`}>
                    {pedido.status === 1 ? 'Entregue' : 'Pendente'}
                  </span>
                </td>
                <td>
                  <button onClick={() => editarPedido(pedido)} className="btn-editar">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pedidos-pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default PedidoForm;