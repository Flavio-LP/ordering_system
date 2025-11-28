import React, { useState, useEffect } from 'react';

interface Produto {
  id: number;
  nome: string;
  preco: number;
}

interface Pessoa {
  id: number;
  nome: string;
  sobrenome: string;
}

interface PedidoProduto {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
}

interface Pedido {
  id: number;
  pessoa: Pessoa;
  total: number;
  produtos: Produto[];
}

const OrderForm: React.FC = () => {
  const [pessoaId, setPessoaId] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itensPedido, setItensPedido] = useState<PedidoProduto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProdutos();
    fetchPessoas();
    fetchPedidos();
  }, [currentPage, searchTerm]);

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

  const fetchPedidos = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    params.append('page', currentPage.toString());
    
    const response = await fetch(`/api/pedidos?${params.toString()}`);
    const data = await response.json();
    setPedidos(data);
  };

  const adicionarItem = () => {
    if (!produtoSelecionado || !quantidade) return;
    
    const produto = produtos.find(p => p.id === parseInt(produtoSelecionado));
    if (!produto) return;

    setItensPedido([...itensPedido, {
      produto_id: produto.id,
      quantidade: parseInt(quantidade),
      preco_unitario: produto.preco
    }]);
    setProdutoSelecionado('');
    setQuantidade('1');
  };

  const removerItem = (index: number) => {
    setItensPedido(itensPedido.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return itensPedido.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itensPedido.length === 0) {
      alert('Adicione pelo menos um produto ao pedido');
      return;
    }

    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pedido: {
          pessoa_id: pessoaId,
          total: calcularTotal(),
          pedido_produtos_attributes: itensPedido
        }
      }),
    });
    
    setPessoaId('');
    setItensPedido([]);
    fetchPedidos();
  };

  return (
    <div>
      <h1>Cadastro de Pedidos</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Cliente:</label>
          <select 
            value={pessoaId} 
            onChange={e => setPessoaId(e.target.value)} 
            required 
          >
            <option value="">Selecione um cliente</option>
            {pessoas.map(pessoa => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.nome} {pessoa.sobrenome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3>Adicionar Produtos</h3>
          <div>
            <select 
              value={produtoSelecionado} 
              onChange={e => setProdutoSelecionado(e.target.value)}
              style={{ flex: 2, padding: 8 }}
            >
              <option value="">Selecione um produto</option>
              {produtos.map(produto => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome} - R$ {produto.preco}
                </option>
              ))}
            </select>
            <input 
              type="number" 
              value={quantidade} 
              onChange={e => setQuantidade(e.target.value)}
              min="1"
              placeholder="Qtd"
            />
            <button type="button" onClick={adicionarItem}>
              Adicionar
            </button>
          </div>

          {itensPedido.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {itensPedido.map((item, index) => {
                  const produto = produtos.find(p => p.id === item.produto_id);
                  return (
                    <tr key={index}>
                      <td>{produto?.nome}</td>
                      <td>{item.quantidade}</td>
                      <td>R$ {item.preco_unitario}</td>
                      <td>
                        R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                      </td>
                      <td>
                        <button type="button" onClick={() => removerItem(index)}>Remover</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div>
            Total: R$ {calcularTotal().toFixed(2)}
          </div>
        </div>

        <button type="submit">
          Finalizar Pedido
        </button>
      </form>

      <div>
        <input 
          value={searchTerm} 
          onChange={e => handleSearch(e.target.value)} 
          placeholder="Buscar por nome..." 
        />
      </div>

      <h2>Pedidos Realizados</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Produtos</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(pedido => (
            <tr key={pedido.id}>
              <td>{pedido.id}</td>
              <td>
                {pedido.pessoa?.nome} {pedido.pessoa?.sobrenome}
              </td>
              <td>R$ {pedido.total}</td>
              <td>
                {pedido.produtos?.map(p => p.nome).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderForm;