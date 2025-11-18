class ProdutosController < ApplicationController
  def index
    respond_to do |format|
      format.html
      format.json do
        page = params[:page]&.to_i || 1
        per_page = params[:per_page]&.to_i || 10
        offset = (page - 1) * per_page
        
        produtos = Produto.all
        produtos = produtos.where("nome ILIKE ?", "%#{params[:search]}%") if params[:search].present?
        
        total_count = produtos.count
        total_pages = (total_count.to_f / per_page).ceil
        produtos = produtos.limit(per_page).offset(offset)
        
        render json: {
          produtos: produtos,
          total_pages: total_pages,
          current_page: page
        }
      end
    end
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