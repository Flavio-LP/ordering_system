
Rails.application.config.assets.precompile += %w(
  global/stylesheet.css
  pessoas/pessoas.css
  devise/devise.css
  usuarios/usuarios.css
  producao/producao.css
  pedidos/pedidos.css
  produtos/produtos.css
)

Rails.application.config.assets.digest = true
Rails.application.config.assets.compile = false