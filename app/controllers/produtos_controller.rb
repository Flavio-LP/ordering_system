class ProdutosController < ApplicationController
  def index
    respond_to do |format|
      format.html
      format.json do
        page = params[:page]&.to_i || 1
        per_page = params[:per_page]&.to_i || 10
        search = params[:search].to_s

        cache_key = "produtos:page:#{page}:per_page:#{per_page}:search:#{search}"

        cached_data = $redis.get(cache_key)

        if cached_data
          render json: JSON.parse(cached_data)
        else
          offset = (page - 1) * per_page

          produtos = Produto.all
          produtos = produtos.where("nome ILIKE ?", "%#{search}%") if search.present?

          total_count = produtos.count
          total_pages = (total_count.to_f / per_page).ceil
          produtos = produtos.limit(per_page).offset(offset)

          response_data = {
            produtos: produtos,
            total_pages: total_pages,
            current_page: page
          }

          $redis.setex(cache_key, 300, response_data.to_json)

          render json: response_data
        end
      end
    end
  end

  def create
    @produto = Produto.new(produto_params)
    if @produto.save
      $redis.keys("produtos:*").each { |key| $redis.del(key) }
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
