Rails.application.routes.draw do
   devise_for :users, skip: [:registrations]
  
  devise_scope :user do
    authenticated :user do
      resource :registration,
        only: [:edit, :update],
        path: 'users',
        path_names: { edit: 'edit' },
        controller: 'devise/registrations',
        as: :user_registration
    end
  end
  
  get "up" => "rails/health#show", as: :rails_health_check

  authenticated :user do
    root "page#index", as: :authenticated_root

    get "produtos", to: "produtos#index"
    resources :produtos

    get "pessoas", to: "page#pessoas"

    get "pedidos", to: "page#pedidos"

    namespace :admin do
      resources :users
    end

    namespace :api do
      resources :produtos
      resources :pedidos
      resources :pessoas
    end
  end

  root to: redirect("/users/sign_in")
end