class AddStatusToOrders < ActiveRecord::Migration[8.0]
  def change
    add_column :pedidos, :status, :integer, default: 0, null: false
    add_column :pedidos, :data_entrega, :date
  end
end
