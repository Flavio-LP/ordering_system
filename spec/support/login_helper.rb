module AuthHelper
  def login(email:, password:)
    visit new_user_session_path
    fill_in 'E-mail', with: email
    fill_in 'Senha', with: password
    click_button 'Entrar'

    page.has_link?('Sair')
  end
end
    