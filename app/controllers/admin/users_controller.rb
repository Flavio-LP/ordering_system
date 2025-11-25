class Admin::UsersController < ApplicationController
  before_action :authenticate_user!

  def index
    @users = User.all
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    @user.password = Devise.friendly_token[0, 20] if @user.password.blank?
    
    if @user.save
      redirect_to admin_users_path, notice: 'Usuário criado com sucesso.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    
    if user_params[:password].blank?
      user_params.delete(:password)
      user_params.delete(:password_confirmation)
    end
    
    if @user.update(user_params)
      redirect_to admin_users_path, notice: 'Usuário atualizado com sucesso.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @user = User.find(params[:id])
    @user.destroy
    redirect_to admin_users_path, notice: 'Usuário removido com sucesso.'
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end