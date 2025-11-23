class AlterTableProdutos < ActiveRecord::Migration[8.0]
  def change
    rename_column :produtos, :preco_unidade, :preco
    add_column :produtos, :descricao, :string
    add_index :produtos, :nome
  end
end
