class Api::PedidosController < ApplicationController
  skip_before_action :verify_authenticity_token
  def index
    @pedidos = Pedido.includes(:pessoa, :produtos).all
    render json: @pedidos.as_json(include: { pessoa: {}, produtos: {} })
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
