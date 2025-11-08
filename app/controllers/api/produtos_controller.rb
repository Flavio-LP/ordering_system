class Api::ProdutosController < ApplicationController
  skip_before_action :verify_authenticity_token

  def index
    @produtos = Produto.all
    render json: @produtos
  end

  def create
    @produto = Produto.new(produto_params)
    if @produto.save
      render json: @produto, status: :created
    else
      render json: @produto.errors, status: :unprocessable_entity
    end
  end

  private

  def produto_params
    params.require(:produto).permit(:nome, :preco, :descricao)
  end
end