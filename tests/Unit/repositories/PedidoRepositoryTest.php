<?php

namespace Tests\Integration\Repositories;

use BiblioTech\Models\Pedido;
use BiblioTech\Repositories\PedidoRepository;
use PDO;
use PHPUnit\Framework\TestCase;

class PedidoRepositoryTest extends TestCase
{
    private ?PDO $pdo;
    private ?PedidoRepository $repository;

    /**
     * Configura um banco de dados SQLite em memória antes de cada teste.
     */
    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->pdo->exec("CREATE TABLE usuarios (id INTEGER PRIMARY KEY);");
        $this->pdo->exec("CREATE TABLE endereco (id INTEGER PRIMARY KEY, usuario_id INTEGER, cep TEXT, endereco TEXT, numero TEXT, complemento TEXT, bairro TEXT, cidade TEXT, estado TEXT);");
        $this->pdo->exec("CREATE TABLE livros (id INTEGER PRIMARY KEY, titulo TEXT, autor TEXT, imagem_url TEXT);");
        $this->pdo->exec("CREATE TABLE pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            endereco_id INTEGER,
            total REAL,
            status TEXT,
            valor_frete REAL,
            criado_em TEXT,
            FOREIGN KEY (endereco_id) REFERENCES endereco(id)
        );");
        $this->pdo->exec("CREATE TABLE pedido_itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER,
            livro_id INTEGER,
            quantidade INTEGER,
            preco_unitario REAL,
            tipo TEXT
        );");

        $this->pdo->exec("INSERT INTO usuarios (id) VALUES (1), (2);");
        $this->pdo->exec("INSERT INTO endereco (id, usuario_id, cep, endereco, numero, complemento, bairro, cidade, estado) VALUES (1, 1, '12345-678', 'Rua Teste', '123', 'Apto 101', 'Bairro Exemplo', 'Cidade Teste', 'TS');");
        $this->pdo->exec("INSERT INTO livros (id, titulo, autor, imagem_url) VALUES (10, 'Livro A', 'Autor A', 'url_a'), (11, 'Livro B', 'Autor B', 'url_b');");

        $this->repository = new PedidoRepository($this->pdo);
    }

    /**
     * Limpa o ambiente após cada teste.
     */
    protected function tearDown(): void
    {
        $this->pdo = null;
        $this->repository = null;
    }

    public function testCriarDeveInserirPedidoERetornarId()
    {
        $pedido = new Pedido([
            'usuario_id' => 1,
            'endereco_id' => 1,
            'total' => 124.99,
            'status' => 'confirmado',
            'valor_frete' => 25.00,
            'criado_em' => date('Y-m-d H:i:s')
        ]);

        $pedidoId = $this->repository->criar($pedido);

        $this->assertEquals(1, $pedidoId);

        $stmt = $this->pdo->query("SELECT * FROM pedidos WHERE id = 1");
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->assertEquals(1, $data['endereco_id']);
        $this->assertEquals(124.99, $data['total']);
        $this->assertEquals('confirmado', $data['status']);
    }

    public function testBuscarPorUsuarioDeveRetornarApenasSeusPedidos()
    {
        $pedidoId1 = $this->repository->criar(new Pedido(['usuario_id' => 1, 'endereco_id' => 1, 'total' => 10, 'status' => 'a', 'valor_frete' => 0, 'criado_em' => '2025-01-01']));
        $this->pdo->exec("INSERT INTO pedido_itens (pedido_id, livro_id, quantidade, preco_unitario, tipo) VALUES ($pedidoId1, 10, 1, 10, 'fisico')");

        $pedidoId2 = $this->repository->criar(new Pedido(['usuario_id' => 1, 'endereco_id' => 1, 'total' => 20, 'status' => 'b', 'valor_frete' => 0, 'criado_em' => '2025-01-02']));
        $this->pdo->exec("INSERT INTO pedido_itens (pedido_id, livro_id, quantidade, preco_unitario, tipo) VALUES ($pedidoId2, 11, 1, 20, 'ebook')");

        $pedidoId3 = $this->repository->criar(new Pedido(['usuario_id' => 2, 'endereco_id' => null, 'total' => 30, 'status' => 'c', 'valor_frete' => 0, 'criado_em' => '2025-01-03']));
        $this->pdo->exec("INSERT INTO pedido_itens (pedido_id, livro_id, quantidade, preco_unitario, tipo) VALUES ($pedidoId3, 10, 1, 30, 'fisico')");

        $pedidos = $this->repository->buscarPorUsuario(1);

        $this->assertCount(2, $pedidos);
        $this->assertEquals(20, $pedidos[0]['total'], "Deve ordenar pelo mais recente (criado_em DESC).");
        $this->assertEquals(10, $pedidos[1]['total']);
    }

    public function testBuscarPedidoCompletoPorIdDeveRetornarArrayComItens()
    {
        $pedidoId = $this->repository->criar(new Pedido(['usuario_id' => 1, 'endereco_id' => 1, 'total' => 75, 'status' => 'confirmado', 'valor_frete' => 0, 'criado_em' => '2025-01-01']));
        $this->pdo->exec("INSERT INTO pedido_itens (pedido_id, livro_id, quantidade, preco_unitario, tipo) VALUES ($pedidoId, 10, 1, 50, 'fisico')");
        $this->pdo->exec("INSERT INTO pedido_itens (pedido_id, livro_id, quantidade, preco_unitario, tipo) VALUES ($pedidoId, 11, 1, 25, 'ebook')");

        $pedidoCompleto = $this->repository->buscarPedidoCompletoPorId($pedidoId);

        $this->assertIsArray($pedidoCompleto);
        $this->assertEquals($pedidoId, $pedidoCompleto['id']);
        $this->assertEquals(1, $pedidoCompleto['endereco_id']);
        $this->assertCount(2, $pedidoCompleto['itens']);
        $this->assertEquals('Livro A', $pedidoCompleto['itens'][0]['titulo']);
        $this->assertEquals(25, $pedidoCompleto['itens'][1]['preco_unitario']);
    }
}