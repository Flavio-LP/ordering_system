class Api::ProducaoController < Api::BaseController
  skip_before_action :verify_authenticity_token

  def index
    data = params[:data].present? ? Date.parse(params[:data]) : Date.today
    
    pedidos = Pedido.includes(:pessoa, pedido_produtos: :produto)
                    .where('DATE(created_at) = ?', data)
                    .order(created_at: :asc)

    render json: {
      pedidos: pedidos.map { |p| serialize_pedido(p) }
    }
  end

  private

  def serialize_pedido(p)
    {
      id: p.id,
      pessoa_id: p.pessoa&.id,
      pessoa_nome: [p.pessoa&.nome, p.pessoa&.sobrenome].compact.join(' '),
      total: (p.total || p.pedido_produtos.sum("quantidade * preco_unitario")),
      data_pedido: p.created_at,
      pedido_produtos: p.pedido_produtos.map { |pp| 
        {
          id: pp.id,
          produto_id: pp.produto_id,
          produto_nome: pp.produto&.nome,
          quantidade: pp.quantidade,
          preco_unitario: pp.preco_unitario
        }
      }
    }
  end
end