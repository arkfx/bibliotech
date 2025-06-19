<?php

namespace Tests\Integration\Repositories;

use BiblioTech\Models\Usuario;
use BiblioTech\Repositories\UsuarioRepository;
use PDO;
use PHPUnit\Framework\TestCase;

class UsuarioRepositoryTest extends TestCase
{
    private ?PDO $pdo;
    private ?UsuarioRepository $repository;

    /**
     * Configura um banco de dados SQLite em memória antes de cada teste.
     */
    protected function setUp(): void
    {
        $this->pdo = new PDO('sqlite::memory:');
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $this->pdo->sqliteCreateFunction('NOW', 'time', 0);

        $this->pdo->exec("CREATE TABLE usuario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL,
            telefone TEXT,
            data_nascimento TEXT,
            cpf TEXT
        );");

        $this->repository = new UsuarioRepository($this->pdo);
    }

    /**
     * Limpa o ambiente após cada teste.
     */
    protected function tearDown(): void
    {
        $this->pdo = null;
        $this->repository = null;
    }

    public function testSaveDeveInserirNovoUsuario()
    {
        $usuario = new Usuario([
            'nome' => 'João Silva',
            'email' => 'joao@teste.com',
            'senha' => 'senha123',
            'telefone' => '11999998888',
            'data_nascimento' => '1990-01-15',
            'cpf' => '12345678900'
        ]);

        $success = $this->repository->save($usuario);
        $this->assertTrue($success, "O método save deveria retornar true.");

        $savedUser = $this->repository->findByEmail('joao@teste.com');
        $this->assertNotNull($savedUser);
        $this->assertEquals('João Silva', $savedUser->nome);
        $this->assertEquals('12345678900', $savedUser->cpf);
    }

    public function testUpdateDeveAtualizarUsuarioExistente()
    {
        $this->pdo->exec("INSERT INTO usuario (id, nome, email, senha, telefone, data_nascimento, cpf)
                          VALUES (1, 'Nome Antigo', 'antigo@teste.com', 'hash', '111', '1980-01-01', '111')");

        $usuario = new Usuario([
            'id' => 1,
            'nome' => 'Nome Novo',
            'email' => 'novo@teste.com',
            'telefone' => '222',
            'data_nascimento' => '1995-05-10',
            'cpf' => '222'
        ]);

        $success = $this->repository->update($usuario);
        $this->assertTrue($success, "O método update deveria retornar true.");

        $updatedUser = $this->repository->findById(1);
        $this->assertEquals('Nome Novo', $updatedUser->nome);
        $this->assertEquals('novo@teste.com', $updatedUser->email);
        $this->assertEquals('222', $updatedUser->cpf);
    }

    public function testFindByEmailDeveRetornarUsuarioCorreto()
    {
        $this->pdo->exec("INSERT INTO usuario (id, nome, email, senha) VALUES (1, 'Carlos', 'carlos@teste.com', 'hash')");
        $usuario = $this->repository->findByEmail('carlos@teste.com');
        $this->assertInstanceOf(Usuario::class, $usuario);
    }

    public function testAlterarSenhaDeveAtualizarHashDaSenha()
    {
        $senhaAntiga = 'senha123';
        $senhaNova = 'senha456';
        $hashAntigo = password_hash($senhaAntiga, PASSWORD_DEFAULT);
        $this->pdo->exec("INSERT INTO usuario (id, nome, email, senha) VALUES (1, 'Usuario', 'email@teste.com', '$hashAntigo')");

        $this->repository->alterarSenha(1, $senhaNova);

        $data = $this->pdo->query("SELECT senha FROM usuario WHERE id = 1")->fetch(PDO::FETCH_ASSOC);
        $hashNovo = $data['senha'];

        $this->assertTrue(password_verify($senhaNova, $hashNovo));
    }
}