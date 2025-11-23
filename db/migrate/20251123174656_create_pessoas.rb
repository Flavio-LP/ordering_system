class CreatePessoas < ActiveRecord::Migration[8.0]
  def change
    create_table :pessoas do |t|
      t.string :nome
      t.string :sobrenome
      t.string :empresa
      t.string :setor

      t.timestamps
    end
  end
end
