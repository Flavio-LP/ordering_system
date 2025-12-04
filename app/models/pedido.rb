class Pedido < ApplicationRecord
  belongs_to :pessoa
  has_many :pedido_produtos, dependent: :destroy
  has_many :produtos, through: :pedido_produtos

  accepts_nested_attributes_for :pedido_produtos, allow_destroy: true
end