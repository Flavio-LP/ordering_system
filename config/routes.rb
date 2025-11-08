Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "produtos#index"
  resources :produtos
  
  namespace :api do
    resources :produtos
    resources :pedidos
  end
end