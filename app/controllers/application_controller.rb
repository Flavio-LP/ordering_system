class ApplicationController < ActionController::Base
  before_action :authenticate_user!

  protect_from_forgery with: :exception, unless: -> { request.format.json? }
  protect_from_forgery with: :null_session, if: -> { request.format.json? }
end
