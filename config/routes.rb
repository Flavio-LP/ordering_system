Rails.application.routes.draw do
    devise_for :users
  get "up" => "rails/health#show", as: :rails_health_check

  authenticated :user do
    root "page#index", as: :authenticated_root

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

  root to: redirect("/users/sign_in")
end
