class Pedido < ApplicationRecord
  has_many :pedido_produtos
  has_many :produtos, through: :pedido_produtos
end