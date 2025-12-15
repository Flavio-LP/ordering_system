class Api::PedidosController < Api::BaseController
  skip_before_action :verify_authenticity_token

  def index
    cache_key = "pedidos_page_#{params[:page]}_per_#{params[:per_page]}_search_#{params[:search]}"
    
    cached_data = Rails.cache.fetch(cache_key, expires_in: 5.minutes) do
      pedidos = Pedido.includes(:pessoa, :produtos, :pedido_produtos)

      if params[:search].present?
        search_term = "%#{params[:search]}%"
        pedidos = pedidos.joins(:pessoa)
                        .where("pessoas.nome ILIKE ? OR pessoas.sobrenome ILIKE ? OR pessoas.empresa ILIKE ? OR pessoas.setor ILIKE ?",
                                search_term, search_term, search_term, search_term)
      end

      pedidos = pedidos.page(params[:page]).per(params[:per_page] || 10)
      
      {
        pedidos: pedidos.map { |p| serialize_pedido(p) },
        total_pages: (pedidos.respond_to?(:total_pages) ? pedidos.total_pages : 1)
      }
    end

    render json: cached_data
  end

  def create
    @pedido = Pedido.new(pedido_params)
    if @pedido.save
      clear_pedidos_cache
      render json: serialize_pedido(@pedido), status: :created
    else
      render json: @pedido.errors, status: :unprocessable_entity
    end
  end

  def update
    @pedido = Pedido.find(params[:id])
    if @pedido.update(pedido_params)
      clear_pedidos_cache
      render json: serialize_pedido(@pedido)
    else
      render json: @pedido.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @pedido = Pedido.find(params[:id])
    if @pedido.destroy
      clear_pedidos_cache
      render json: { message: 'Pedido excluído com sucesso' }, status: :ok
    else
      render json: @pedido.errors, status: :unprocessable_entity
    end
  end

  private

  def pedido_params
    params.require(:pedido).permit(:pessoa_id, :total, :data_entrega, :status, pedido_produtos_attributes: [:id, :produto_id, :quantidade, :preco_unitario, :_destroy])
  end

  def serialize_pedido(p)
    {
      id: p.id,
      pessoa_id: p.pessoa&.id,
      pessoa_nome: [p.pessoa&.nome, p.pessoa&.sobrenome].compact.join(' '),
      total: (p.total || p.pedido_produtos.sum("quantidade * preco_unitario")),
      data_pedido: p.created_at,
      data_entrega: p.data_entrega,
      status: p.status || 0,
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

  def clear_pedidos_cache
    Rails.cache.delete_matched("pedidos_*")
  end
end