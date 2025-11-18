class Produto < ApplicationRecord
  has_many :pedido_produtos
  has_many :pedidos, through: :pedido_produtos

  validates :nome, presence: true
  validates :preco, presence: true, numericality: { greater_than: 0 }
end
