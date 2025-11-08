class Produto < ApplicationRecord
  has_many :pedido_produtos
  has_many :pedidos, through: :pedido_produtos
end