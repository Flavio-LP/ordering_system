class Api::PedidosController < Api::BaseController
  skip_before_action :verify_authenticity_token
  def index
    @pedidos = Pedido.includes(:pessoa, :produtos)

    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @pedidos = @pedidos.joins(:pessoa)
                        .where("pessoas.nome ILIKE ? OR pessoas.sobrenome ILIKE ? OR pessoas.empresa ILIKE ? OR pessoas.setor ILIKE ?",
                                search_term, search_term, search_term, search_term)
    end

    @pedidos = @pedidos.page(params[:page])

    render json: @pedidos.as_json(
      include: {
        pessoa: { only: [ :id, :nome, :sobrenome, :empresa, :setor ] },
        produtos: { only: [ :id, :nome, :preco ] }
      }
    )
  end

  def create
    @pedido = Pedido.new(pedido_params)
    if @pedido.save
      render json: @pedido.as_json(include: { pessoa: {}, produtos: {} }), status: :created
    else
      render json: @pedido.errors, status: :unprocessable_entity
    end
  end

  private

  def pedido_params
    params.require(:pedido).permit(:pessoa_id, :total, pedido_produtos_attributes: [ :produto_id, :quantidade, :preco_unitario ])
  end
end
