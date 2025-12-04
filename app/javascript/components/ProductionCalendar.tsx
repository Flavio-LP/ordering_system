import React, { useState, useEffect } from 'react';

interface Pedido {
  id: number;
  pessoa_nome: string;
  total: number;
  data_pedido: string;
  pedido_produtos: PedidoProduto[];
}

interface PedidoProduto {
  id: number;
  produto_id: number;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
}

interface ProdutoAgrupado {
  produto_id: number;
  produto_nome: string;
  quantidade_total: number;
  pedidos: {
    pedido_id: number;
    pessoa_nome: string;
    quantidade: number;
  }[];
}

const ProductionCalendar: React.FC = () => {
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtosAgrupados, setProdutosAgrupados] = useState<ProdutoAgrupado[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPedidosPorData();
  }, [dataSelecionada]);

  const fetchPedidosPorData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/producao?data=${dataSelecionada}`);
      const data = await response.json();
      setPedidos(data.pedidos || []);
      agruparProdutos(data.pedidos || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setPedidos([]);
      setProdutosAgrupados([]);
    } finally {
      setLoading(false);
    }
  };

  const agruparProdutos = (pedidosList: Pedido[]) => {
    const agrupamento: { [key: number]: ProdutoAgrupado } = {};

    pedidosList.forEach(pedido => {
      pedido.pedido_produtos.forEach(pp => {
        if (!agrupamento[pp.produto_id]) {
          agrupamento[pp.produto_id] = {
            produto_id: pp.produto_id,
            produto_nome: pp.produto_nome,
            quantidade_total: 0,
            pedidos: []
          };
        }

        agrupamento[pp.produto_id].quantidade_total += pp.quantidade;
        agrupamento[pp.produto_id].pedidos.push({
          pedido_id: pedido.id,
          pessoa_nome: pedido.pessoa_nome,
          quantidade: pp.quantidade
        });
      });
    });

    setProdutosAgrupados(Object.values(agrupamento));
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const imprimirProducao = () => {
    window.print();
  };

  return (
    <div className="producao-container">
      <div className="producao-header no-print">
        <h1>Produção Diária</h1>
        <div className="producao-controls">
          <input
            type="date"
            value={dataSelecionada}
            onChange={e => setDataSelecionada(e.target.value)}
            className="date-input"
          />
          <button onClick={imprimirProducao} className="btn-imprimir">
            Imprimir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          <div className="producao-info">
            <h2>Produção para {formatarData(dataSelecionada)}</h2>
            <p className="total-pedidos">Total de pedidos: {pedidos.length}</p>
          </div>

          {produtosAgrupados.length === 0 ? (
            <div className="sem-pedidos">
              <p>Nenhum pedido encontrado para esta data.</p>
            </div>
          ) : (
            <>
              <div className="produtos-resumo">
                <h3>Resumo de Produtos</h3>
                <table className="producao-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosAgrupados.map(produto => (
                      <tr key={produto.produto_id}>
                        <td className="produto-nome">{produto.produto_nome}</td>
                        <td className="quantidade-total">{produto.quantidade_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="produtos-detalhado">
                <h3>Detalhamento por Produto</h3>
                {produtosAgrupados.map(produto => (
                  <div key={produto.produto_id} className="produto-card">
                    <div className="produto-card-header">
                      <h4>{produto.produto_nome}</h4>
                      <span className="badge">Total: {produto.quantidade_total}</span>
                    </div>
                    <table className="detalhamento-table">
                      <thead>
                        <tr>
                          <th>Pedido #</th>
                          <th>Cliente</th>
                          <th>Quantidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {produto.pedidos.map((pedido, index) => (
                          <tr key={index}>
                            <td>{pedido.pedido_id}</td>
                            <td>{pedido.pessoa_nome}</td>
                            <td>{pedido.quantidade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              <div className="pedidos-lista">
                <h3>Lista de Pedidos</h3>
                <table className="producao-table">
                  <thead>
                    <tr>
                      <th>Pedido #</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Produtos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(pedido => (
                      <tr key={pedido.id}>
                        <td>{pedido.id}</td>
                        <td>{pedido.pessoa_nome}</td>
                        <td>R$ {Number(pedido.total).toFixed(2)}</td>
                        <td>
                          <ul className="produtos-lista">
                            {pedido.pedido_produtos.map(pp => (
                              <li key={pp.id}>
                                {pp.produto_nome} - {pp.quantidade}x
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProductionCalendar;