class ProdutosController < ApplicationController
  def index
    @produtos = Produto.all
  end

  def new
    @produto = Produto.new
  end

  def create
    @produto = Produto.new(produto_params)
    if @produto.save
      redirect_to produtos_path, notice: 'Produto criado com sucesso.'
    else
      render :new
    end
  end

  private

  def produto_params
    params.require(:produto).permit(:nome, :preco, :descricao)
  end
end