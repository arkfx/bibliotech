<?php

namespace Tests\Unit\Services;

use BiblioTech\Models\Usuario;
use BiblioTech\Repositories\UsuarioRepository;
use BiblioTech\Services\UsuarioService;
use PHPUnit\Framework\TestCase;
use Exception;

class UsuarioServiceTest extends TestCase
{
    private $usuarioRepositoryMock;
    private UsuarioService $usuarioService;

    protected function setUp(): void
    {
        $this->usuarioRepositoryMock = $this->createMock(UsuarioRepository::class);
        $this->usuarioService = new UsuarioService($this->usuarioRepositoryMock);
    }

    public function testCadastrarComSucesso()
    {
        $data = ['nome' => 'Usuario Teste', 'email' => 'teste@email.com', 'senha' => 'senha123'];

        $this->usuarioRepositoryMock->method('findByEmail')->with($data['email'])->willReturn(null);
        $this->usuarioRepositoryMock->expects($this->once())->method('save')->willReturn(true);

        $this->usuarioService->cadastrar($data);
    }

    public function testCadastrarDeveLancarExcecaoSeEmailJaExiste()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Este e-mail já está em uso.');

        $data = ['nome' => 'Usuario Teste', 'email' => 'existente@email.com', 'senha' => 'senha123'];
        $usuarioExistente = new Usuario($data);

        $this->usuarioRepositoryMock->method('findByEmail')->with($data['email'])->willReturn($usuarioExistente);

        $this->usuarioService->cadastrar($data);
    }

    public function testCadastrarDeveLancarExcecaoSeSenhaCurta()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('A senha deve ter no mínimo 6 caracteres.');

        $data = ['nome' => 'Usuario Teste', 'email' => 'teste@email.com', 'senha' => '123'];
        $this->usuarioService->cadastrar($data);
    }

    // --- Testes para atualizar ---

    public function testAtualizarComSucesso()
    {
        $id = 1;
        $data = ['nome' => 'Nome Atualizado', 'email' => 'novo@email.com'];
        $usuarioOriginal = new Usuario(['id' => $id, 'nome' => 'Nome Antigo', 'email' => 'antigo@email.com', 'senha' => 'senha_antiga']);

        $this->usuarioRepositoryMock->method('findById')->with($id)->willReturn($usuarioOriginal);
        $this->usuarioRepositoryMock->method('findByEmail')->with($data['email'])->willReturn(null);
        $this->usuarioRepositoryMock->expects($this->once())->method('update')->willReturn(true);

        $this->usuarioService->atualizar($id, $data);
    }

    public function testAtualizarDeveLancarExcecaoSeUsuarioNaoEncontrado()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Usuário não encontrado.');

        $id = 999;
        $this->usuarioRepositoryMock->method('findById')->with($id)->willReturn(null);

        $this->usuarioService->atualizar($id, ['nome' => 'Novo Nome']);
    }

    public function testAtualizarDeveLancarExcecaoSeEmailJaEmUsoPorOutroUsuario()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('E-mail já está em uso.');

        $id = 1;
        $data = ['email' => 'email.de.outro@usuario.com'];
        $usuarioAtual = new Usuario(['id' => $id, 'nome' => 'Usuario Atual', 'email' => 'meu.email@usuario.com', 'senha' => 'senha1']);
        $outroUsuario = new Usuario(['id' => 2, 'nome' => 'Outro Usuario', 'email' => 'email.de.outro@usuario.com', 'senha' => 'senha2']);

        $this->usuarioRepositoryMock->method('findById')->with($id)->willReturn($usuarioAtual);
        $this->usuarioRepositoryMock->method('findByEmail')->with($data['email'])->willReturn($outroUsuario);

        $this->usuarioService->atualizar($id, $data);
    }


    public function testAlterarSenhaComSucesso()
    {
        $id = 1;
        $senhaAtual = 'senhaAntiga123';
        $novaSenha = 'senhaNova456';
        $hashSenhaAntiga = password_hash($senhaAtual, PASSWORD_DEFAULT);
        $usuario = new Usuario(['id' => $id, 'nome' => 'Usuario Teste', 'email' => 'teste@email.com', 'senha' => $hashSenhaAntiga]);

        $this->usuarioRepositoryMock->method('findById')->with($id)->willReturn($usuario);
        $this->usuarioRepositoryMock->expects($this->once())->method('alterarSenha')->with($id, $novaSenha)->willReturn(true);

        $this->usuarioService->alterarSenha($id, $senhaAtual, $novaSenha);
    }

    public function testAlterarSenhaDeveLancarExcecaoSeSenhaAtualIncorreta()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Senha atual incorreta.');

        $id = 1;
        $senhaCorreta = 'senhaCorreta123';
        $senhaIncorreta = 'senhaErrada456';
        $novaSenha = 'senhaNova789';
        $hashSenhaCorreta = password_hash($senhaCorreta, PASSWORD_DEFAULT);
        $usuario = new Usuario(['id' => $id, 'nome' => 'Usuario Teste', 'email' => 'teste@email.com', 'senha' => $hashSenhaCorreta]);

        $this->usuarioRepositoryMock->method('findById')->with($id)->willReturn($usuario);

        $this->usuarioService->alterarSenha($id, $senhaIncorreta, $novaSenha);
    }
}