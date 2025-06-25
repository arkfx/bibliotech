<?php

namespace Tests\Integration\Repositories;

use BiblioTech\Models\Livro;
use BiblioTech\Repositories\LivroRepository;
use PDO;
use PHPUnit\Framework\TestCase;
use Exception;

class LivroRepositoryTest extends TestCase
{
    private ?PDO $pdo;
    private ?LivroRepository $repository;

    /**
     * Este método é executado antes de cada teste.
     * Ele configura um banco de dados SQLite em memória e cria o schema necessário.
     */
    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->pdo->sqliteCreateFunction('NOW', 'time', 0);

        $this->pdo->exec("CREATE TABLE generos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT);");
        $this->pdo->exec("CREATE TABLE editoras (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT);");
        $this->pdo->exec("CREATE TABLE livros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT, autor TEXT, genero_id INTEGER, preco REAL, editora_id INTEGER,
            descricao TEXT, imagem_url TEXT, pdf_url TEXT,
            created_at TEXT, updated_at TEXT
        );");
        $this->pdo->exec("CREATE TABLE carrinho (id INTEGER PRIMARY KEY, livro_id INTEGER);");
        $this->pdo->exec("CREATE TABLE pedidos (id INTEGER PRIMARY KEY);");
        $this->pdo->exec("CREATE TABLE pedido_itens (id INTEGER PRIMARY KEY, pedido_id INTEGER, livro_id INTEGER);");

        $this->pdo->exec("INSERT INTO generos (id, nome) VALUES (1, 'Ficção Científica');");
        $this->pdo->exec("INSERT INTO editoras (id, nome) VALUES (1, 'Editora Teste');");

        $this->repository = new LivroRepository($this->pdo);
    }

    /**
     * Limpa o ambiente após cada teste.
     */
    protected function tearDown(): void
    {
        $this->pdo = null;
        $this->repository = null;
    }

    public function testSaveDeveInserirNovoLivro()
    {
        $livro = new Livro([
            'titulo' => 'Duna', 'autor' => 'Frank Herbert', 'genero_id' => 1, 'preco' => 59.90,
            'editora_id' => 1, 'descricao' => 'Um épico.', 'imagem_url' => 'url', 'pdf_url' => null
        ]);

        $result = $this->repository->save($livro);

        $this->assertNotNull($result->id, "O ID do livro não deveria ser nulo após salvar.");
        $this->assertEquals(1, $result->id);

        $stmt = $this->pdo->query("SELECT * FROM livros WHERE id = 1");
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->assertEquals('Duna', $data['titulo']);
    }

    public function testSaveDeveAtualizarUmLivroExistente()
    {
        $this->pdo->exec("INSERT INTO livros (id, titulo, autor, genero_id, preco, editora_id, descricao, imagem_url, pdf_url) VALUES (1, 'Duna', 'Autor Antigo', 1, 59.90, 1, 'Desc', 'url', null)");

        $livro = new Livro([
            'id' => 1, 'titulo' => 'Duna: Título Atualizado', 'autor' => 'Frank Herbert', 'genero_id' => 1,
            'preco' => 69.90, 'editora_id' => 1, 'descricao' => 'Desc Atualizada', 'imagem_url' => 'url2', 'pdf_url' => 'pdf_url'
        ]);

        $this->repository->save($livro);

        $data = $this->pdo->query("SELECT * FROM livros WHERE id = 1")->fetch(PDO::FETCH_ASSOC);
        $this->assertEquals('Duna: Título Atualizado', $data['titulo']);
        $this->assertEquals(69.90, $data['preco']);
    }

    public function testFindByIdDeveRetornarLivroComDadosDasTabelasRelacionadas()
    {
        $this->pdo->exec("INSERT INTO livros (id, titulo, autor, genero_id, preco, editora_id, descricao, imagem_url, pdf_url) VALUES (1, 'Duna', 'Frank Herbert', 1, 59.90, 1, 'Desc', 'url', null)");

        $livro = $this->repository->findById(1);

        $this->assertInstanceOf(Livro::class, $livro);
        $this->assertEquals('Duna', $livro->titulo);
        $this->assertEquals('Ficção Científica', $livro->genero_nome, "Deveria ter feito o JOIN com a tabela de gêneros.");
        $this->assertEquals('Editora Teste', $livro->editora_nome, "Deveria ter feito o JOIN com a tabela de editoras.");
    }

    public function testFindByIdDeveRetornarNullSeNaoEncontrar()
    {
        $livro = $this->repository->findById(999);
        $this->assertNull($livro);
    }

    public function testDeleteDeveRemoverLivroEDadosRelacionados()
    {
        $this->pdo->exec("INSERT INTO livros (id, titulo, autor, genero_id, preco, editora_id, descricao, imagem_url, pdf_url) VALUES (5, 'A ser deletado', 'Autor', 1, 10, 1, 'd', 'u', null)");
        $this->pdo->exec("INSERT INTO pedidos (id) VALUES (100)");
        $this->pdo->exec("INSERT INTO pedido_itens (id, pedido_id, livro_id) VALUES (1, 100, 5)");
        $this->pdo->exec("INSERT INTO carrinho (id, livro_id) VALUES (1, 5)");

        $result = $this->repository->delete(5);

        $this->assertTrue($result);
        $this->assertEquals(0, $this->pdo->query("SELECT COUNT(*) FROM livros WHERE id = 5")->fetchColumn());
        $this->assertEquals(0, $this->pdo->query("SELECT COUNT(*) FROM pedido_itens WHERE livro_id = 5")->fetchColumn());
        $this->assertEquals(0, $this->pdo->query("SELECT COUNT(*) FROM carrinho WHERE livro_id = 5")->fetchColumn());
    }

    public function testDeleteDeveLancarExcecaoSeLivroNaoExistir()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Livro com ID 999 não encontrado.");

        $this->repository->delete(999);
    }
}