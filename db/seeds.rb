
# Criar usuário admin
puts "Criando usuário admin..."
User.create!(
  email: 'admin@example.com',
  password: 'password123',
  password_confirmation: 'password123'
)


# Criar produtos
puts "Criando produtos..."
produtos = []
produtos << Produto.create!(nome: 'Pizza Margherita', preco: 35.90, descricao: 'Molho de tomate, mussarela e manjericão')
produtos << Produto.create!(nome: 'Pizza Calabresa', preco: 38.90, descricao: 'Molho de tomate, mussarela e calabresa')
produtos << Produto.create!(nome: 'Pizza Portuguesa', preco: 42.90, descricao: 'Presunto, ovos, cebola, azeitona e mussarela')
produtos << Produto.create!(nome: 'Refrigerante 2L', preco: 8.90, descricao: 'Coca-Cola, Guaraná ou Fanta')
produtos << Produto.create!(nome: 'Cerveja Lata', preco: 5.50, descricao: 'Cerveja gelada 350ml')

puts "Criando pessoas..."
pessoas = []
pessoas << Pessoa.create!(nome: 'João Silva', sobrenome: 'Silva', empresa: 'Empresa X', setor: 'Vendas')
pessoas << Pessoa.create!(nome: 'Maria Oliveira', sobrenome: 'Oliveira', empresa: 'Empresa Y', setor: 'Marketing')
pessoas << Pessoa.create!(nome: 'Carlos Pereira', sobrenome: 'Pereira', empresa: 'Empresa Z', setor: 'TI')
pessoas << Pessoa.create!(nome: 'Ana Costa', sobrenome: 'Costa', empresa: 'Empresa W', setor: 'Recursos Humanos')

puts "Criado pedidos..."

pedidos = []
pedidos << Pedido.create!(pessoa_id: pessoas[0].id, total: produtos[1].preco, pedido_produtos_attributes: [ produto_id: produtos[0].id, quantidade: 1, preco_unitario: produtos[1].preco ])
pedidos << Pedido.create!(pessoa_id: pessoas[1].id, total: produtos[2].preco, pedido_produtos_attributes: [ produto_id: produtos[1].id, quantidade: 1, preco_unitario: produtos[2].preco ])
pedidos << Pedido.create!(pessoa_id: pessoas[2].id, total: produtos[3].preco, pedido_produtos_attributes: [ produto_id: produtos[2].id, quantidade: 1, preco_unitario: produtos[3].preco ])
pedidos << Pedido.create!(pessoa_id: pessoas[3].id, total: produtos[4].preco, pedido_produtos_attributes: [ produto_id: produtos[3].id, quantidade: 1, preco_unitario: produtos[4].preco ])

puts "Seed concluído!"
puts "Login: admin@example.com"
puts "Senha: password123"
