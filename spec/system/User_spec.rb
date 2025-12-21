require 'rails_helper'
require 'selenium-webdriver'


RSpec.describe 'People registration', type: :system do
    people = {
        nome: 'Usuario ',
        sobrenome: '01',
        empresa: 'empresa 01',
        setor: 'setor 01'

    }

    # User.create!(
    #    email: 'user@teste.com',
    #    password: 'password123',
    #    password_confirmation: 'password123'
    # )

    before do
        driven_by(:selenium_chrome_headless)
    end

    it 'People registration without login', js: true do
        post '/pessoas', params: people

        expect(response).to have_http_status(:forbidden)
    end

    it 'People registration with login', js: true do
        success = login(email: 'user@teste.com', password: 'password123')

        expect(success).to be true
    end

    it 'People wrong password', js: true do
        
        success = login(email: 'user@teste.com', password: 'wrongpassword')

        expect(success).to be false

    end


end
