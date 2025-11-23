class Api::PessoasController < Api::BaseController
  skip_before_action :verify_authenticity_token
  def index
    @pessoas = Pessoa.all
    render json: @pessoas
  end

  def create
    @pessoa = Pessoa.new(produto_params)
    puts @pessoa.inspect
    if @pessoa.save
      render json: @pessoa, status: :created
    else
      render json: @produto.errors, status: :unprocessable_entity
    end
  end

  def update
    @pessoa = Pessoa.find(params[:id])
    if @pessoa.update(produto_params)
      render json: @pessoa
    else
      render json: @pessoa.errors, status: :unprocessable_entity
    end
  end

  private

  def produto_params
    params.require(:pessoa).permit(:nome, :sobrenome, :empresa, :setor)
  end
end
