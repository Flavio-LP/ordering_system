class AddPessoaToPedidos < ActiveRecord::Migration[8.0]
  def change
    PedidoProduto.delete_all
    Pedido.delete_all
    add_reference :pedidos, :pessoa, null: false, foreign_key: true
  end
end
