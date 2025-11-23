class Pedido < ApplicationRecord
  belongs_to :pessoa
  has_many :pedido_produtos
  has_many :produtos, through: :pedido_produtos

  accepts_nested_attributes_for :pedido_produtos
end
