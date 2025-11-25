
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


puts "Seed concluído!"
puts "Login: admin@example.com"
puts "Senha: password123"