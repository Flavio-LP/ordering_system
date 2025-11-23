require "test_helper"

class ProdutosApiTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    sign_in @user
  end

  test "should get all produtos" do
    get "/api/produtos"
    assert_response :success
    assert_equal "application/json; charset=utf-8", @response.content_type
  end

  test "should create produto" do
    assert_difference("Produto.count", 1) do
      post "/api/produtos",
        params: { produto: { nome: "Teste", preco: 10.50, descricao: "Descrição teste" } },
        as: :json
    end
    assert_response :created
    json_response = JSON.parse(@response.body)
    assert_equal "Teste", json_response["nome"]
    assert_equal "10.5", json_response["preco"].to_s
  end

  test "should not create produto without nome" do
    assert_no_difference("Produto.count") do
      post "/api/produtos",
        params: { produto: { preco: 10.50 } },
        as: :json
    end
    assert_response :unprocessable_entity
  end
end
