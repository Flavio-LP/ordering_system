Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  root "page#index"

  get "produtos", to: "produtos#index"
  resources :produtos

  get "pessoas", to: "page#pessoas"

  get "pedidos", to: "page#pedidos"

  namespace :api do
    resources :produtos
    resources :pedidos
    resources :pessoas
  end
end
