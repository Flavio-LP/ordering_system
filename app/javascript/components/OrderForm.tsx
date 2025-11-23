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

  useEffect(() => {
    fetchProdutos();
    fetchPessoas();
    fetchPedidos();
  }, []);

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
    const response = await fetch('/api/pedidos');
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
    <div style={{ maxWidth: 1000, margin: 'auto', padding: 20 }}>
      <h1>Cadastro de Pedidos</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: 30, border: '1px solid #ddd', padding: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', marginBottom: 5 }}>Cliente:</label>
          <select 
            value={pessoaId} 
            onChange={e => setPessoaId(e.target.value)} 
            required 
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">Selecione um cliente</option>
            {pessoas.map(pessoa => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.nome} {pessoa.sobrenome}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20, border: '1px solid #ddd', padding: 15 }}>
          <h3>Adicionar Produtos</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
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
              style={{ flex: 1, padding: 8 }}
              placeholder="Qtd"
            />
            <button type="button" onClick={adicionarItem} style={{ padding: '8px 16px' }}>
              Adicionar
            </button>
          </div>

          {itensPedido.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Produto</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Quantidade</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Preço Unit.</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Subtotal</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {itensPedido.map((item, index) => {
                  const produto = produtos.find(p => p.id === item.produto_id);
                  return (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{produto?.nome}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.quantidade}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>R$ {item.preco_unitario}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>
                        R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>
                        <button type="button" onClick={() => removerItem(index)}>Remover</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 10, textAlign: 'right', fontSize: 18, fontWeight: 'bold' }}>
            Total: R$ {calcularTotal().toFixed(2)}
          </div>
        </div>

        <button type="submit" style={{ padding: '10px 20px', fontSize: 16 }}>
          Finalizar Pedido
        </button>
      </form>

      <h2>Pedidos Realizados</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Cliente</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Total</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Produtos</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(pedido => (
            <tr key={pedido.id}>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>{pedido.id}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>
                {pedido.pessoa?.nome} {pedido.pessoa?.sobrenome}
              </td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>R$ {pedido.total}</td>
              <td style={{ border: '1px solid #ddd', padding: 8 }}>
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