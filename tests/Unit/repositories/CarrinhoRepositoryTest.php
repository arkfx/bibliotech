<?php

namespace Tests\Integration\Repositories;

use BiblioTech\Models\Carrinho;
use BiblioTech\Repositories\CarrinhoRepository;
use PDO;
use PHPUnit\Framework\TestCase;

class CarrinhoRepositoryTest extends TestCase
{
    private ?PDO $pdo;
    private ?CarrinhoRepository $repository;

    /**
     * Configura um banco de dados SQLite em memória antes de cada teste.
     */
    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->pdo->exec("CREATE TABLE usuarios (id INTEGER PRIMARY KEY, nome TEXT, email TEXT, senha TEXT);");
        $this->pdo->exec("CREATE TABLE livros (
            id INTEGER PRIMARY KEY, titulo TEXT, autor TEXT, preco REAL, imagem_url TEXT
        );");
        $this->pdo->exec("CREATE TABLE carrinho (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            livro_id INTEGER,
            quantidade INTEGER,
            tipo TEXT,
            UNIQUE(usuario_id, livro_id, tipo)
        );");

        $this->pdo->exec("INSERT INTO usuarios (id, nome, email, senha) VALUES (1, 'Usuario A', 'a@test.com', 'senha')");
        $this->pdo->exec("INSERT INTO usuarios (id, nome, email, senha) VALUES (2, 'Usuario B', 'b@test.com', 'senha')");
        $this->pdo->exec("INSERT INTO livros (id, titulo, autor, preco) VALUES (10, 'Livro Fisico', 'Autor 1', 50.00)");
        $this->pdo->exec("INSERT INTO livros (id, titulo, autor, preco) VALUES (11, 'Livro Digital', 'Autor 2', 25.00)");

        $this->repository = new CarrinhoRepository($this->pdo);
    }

    /**
     * Limpa o ambiente após cada teste.
     */
    protected function tearDown(): void
    {
        $this->pdo = null;
        $this->repository = null;
    }

    public function testAdicionarDeveInserirItemNoCarrinho()
    {
        $carrinho = new Carrinho([
            'usuario_id' => 1,
            'livro_id' => 10,
            'quantidade' => 2,
            'tipo' => 'fisico'
        ]);

        $result = $this->repository->adicionar($carrinho);
        $this->assertTrue($result);

        $stmt = $this->pdo->query("SELECT * FROM carrinho WHERE usuario_id = 1 AND livro_id = 10");
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->assertEquals(2, $data['quantidade']);
        $this->assertEquals('fisico', $data['tipo']);
    }

    public function testListarPorUsuarioDeveRetornarItensComDadosDoLivro()
    {
        $this->repository->adicionar(new Carrinho(['usuario_id' => 1, 'livro_id' => 10, 'quantidade' => 1, 'tipo' => 'fisico']));
        $this->repository->adicionar(new Carrinho(['usuario_id' => 1, 'livro_id' => 11, 'quantidade' => 1, 'tipo' => 'ebook']));
        $this->repository->adicionar(new Carrinho(['usuario_id' => 2, 'livro_id' => 10, 'quantidade' => 5, 'tipo' => 'fisico']));

        $itens = $this->repository->listarPorUsuario(1);

        $this->assertCount(2, $itens, "Deveria retornar apenas os 2 itens do usuário 1.");
        $this->assertEquals('Livro Fisico', $itens[0]->titulo, "Os dados do livro deveriam ser juntados na consulta.");
        $this->assertEquals(50.00, $itens[0]->preco);
        $this->assertEquals('Livro Digital', $itens[1]->titulo);
    }

    public function testAtualizarQuantidadeDeveModificarItemExistente()
    {
        $this->repository->adicionar(new Carrinho(['usuario_id' => 1, 'livro_id' => 10, 'quantidade' => 1, 'tipo' => 'fisico']));

        $carrinhoAtualizado = new Carrinho(['usuario_id' => 1, 'livro_id' => 10, 'quantidade' => 5, 'tipo' => 'fisico']);
        $result = $this->repository->atualizarQuantidade($carrinhoAtualizado);
        $this->assertTrue($result);

        $stmt = $this->pdo->query("SELECT quantidade FROM carrinho WHERE usuario_id = 1 AND livro_id = 10");
        $this->assertEquals(5, $stmt->fetchColumn());
    }

    public function testRemoverDeveExcluirItemDoCarrinho()
    {
        $this->repository->adicionar(new Carrinho(['usuario_id' => 1, 'livro_id' => 10, 'quantidade' => 1, 'tipo' => 'fisico']));
        $this->repository->adicionar(new Carrinho(['usuario_id' => 1, 'livro_id' => 11, 'quantidade' => 1, 'tipo' => 'ebook']));

        $itemParaRemover = new Carrinho(['usuario_id' => 1, 'livro_id' => 10, 'tipo' => 'fisico']);
        $result = $this->repository->remover($itemParaRemover);
        $this->assertTrue($result);

        $itensRestantes = $this->repository->listarPorUsuario(1);
        $this->assertCount(1, $itensRestantes);
        $this->assertEquals(11, $itensRestantes[0]->livro_id);
    }

    public function testLimparCarrinhoDeveRemoverTodosOsItensDeUmUsuario()
    {
        $this->repository->adicionar(new Carrinho(['usuario_id' => 1, 'livro_id' => 10, 'quantidade' => 1, 'tipo' => 'fisico']));
        $this->repository->adicionar(new Carrinho(['usuario_id' => 1, 'livro_id' => 11, 'quantidade' => 1, 'tipo' => 'ebook']));
        $this->repository->adicionar(new Carrinho(['usuario_id' => 2, 'livro_id' => 10, 'quantidade' => 5, 'tipo' => 'fisico']));

        $result = $this->repository->limparCarrinho(1);
        $this->assertTrue($result);

        $itensUsuario1 = $this->repository->listarPorUsuario(1);
        $itensUsuario2 = $this->repository->listarPorUsuario(2);

        $this->assertCount(0, $itensUsuario1, "Carrinho do usuário 1 deveria estar vazio.");
        $this->assertCount(1, $itensUsuario2, "Carrinho do usuário 2 deveria permanecer intacto.");
    }
}