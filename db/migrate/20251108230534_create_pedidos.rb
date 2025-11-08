class CreatePedidos < ActiveRecord::Migration[8.0]
  def change
    create_table :pedidos do |t|
      t.decimal :total

      t.timestamps
    end
  end
end
