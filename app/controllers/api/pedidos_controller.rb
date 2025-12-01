class Api::PedidosController < Api::BaseController
  skip_before_action :verify_authenticity_token

  def index
    @pedidos = Pedido.includes(:pessoa, :produtos, :pedido_produtos)

    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @pedidos = @pedidos.joins(:pessoa)
                        .where("pessoas.nome ILIKE ? OR pessoas.sobrenome ILIKE ? OR pessoas.empresa ILIKE ? OR pessoas.setor ILIKE ?",
                                search_term, search_term, search_term, search_term)
    end

    @pedidos = @pedidos.page(params[:page]).per(params[:per_page] || 10)

    render json: {
      pedidos: @pedidos.map { |p| serialize_pedido(p) },
      total_pages: (@pedidos.respond_to?(:total_pages) ? @pedidos.total_pages : 1)
    }
  end

  def create
    @pedido = Pedido.new(pedido_params)
    if @pedido.save
      render json: serialize_pedido(@pedido), status: :created
    else
      render json: @pedido.errors, status: :unprocessable_entity
    end
  end

  private

  def pedido_params
    params.require(:pedido).permit(:pessoa_id, :total, pedido_produtos_attributes: [:produto_id, :quantidade, :preco_unitario])
  end

  def serialize_pedido(p)
    first_prod = p.produtos.first
    quantidade = p.pedido_produtos.sum(:quantidade)
    {
      id: p.id,
      pessoa_id: p.pessoa&.id,
      pessoa_nome: [p.pessoa&.nome, p.pessoa&.sobrenome].compact.join(' '),
      produtos: p.produtos.map { |pr| { id: pr.id, nome: pr.nome, preco: pr.preco } },
      produto_nome: first_prod&.nome,
      quantidade: quantidade,
      valor_total: (p.total || p.pedido_produtos.sum("quantidade * preco_unitario")),
      data_pedido: p.created_at
    }
  end
end