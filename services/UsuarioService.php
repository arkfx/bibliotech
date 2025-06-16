<?php

require_once __DIR__ . '/../repositories/UsuarioRepository.php';
require_once __DIR__ . '/../models/Usuario.php';

class UsuarioService
{
    private UsuarioRepository $usuarioRepository;

    public function __construct(private PDO $pdo)
    {
        $this->usuarioRepository = new UsuarioRepository($pdo);
    }

    public function cadastrar(array $data): void
    {
        if (!isset($data['nome'], $data['email'], $data['senha'])) {
            throw new Exception('Todos os campos são obrigatórios.');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('E-mail inválido.');
        }

        if (strlen($data['senha']) < 6) {
            throw new Exception('A senha deve ter no mínimo 6 caracteres.');
        }

        if ($this->usuarioRepository->findByEmail($data['email'])) {
            throw new Exception('Este e-mail já está em uso.');
        }

        $usuario = new Usuario($data);
        $sucesso = $this->usuarioRepository->save($usuario);

        if (!$sucesso) {
            throw new Exception('Erro ao cadastrar usuário.');
        }
    }

    public function buscar(int $id): ?Usuario
    {
        return $this->usuarioRepository->findById($id);
    }

    public function atualizar(int $id, array $data): void
    {
        $usuario = $this->usuarioRepository->findById($id);
        if (!$usuario) {
            throw new Exception('Usuário não encontrado.');
        }

        if (isset($data['nome'])) {
            $usuario->nome = $data['nome'];
        }

        if (isset($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception('E-mail inválido.');
            }

            $usuarioExistente = $this->usuarioRepository->findByEmail($data['email']);
            if ($usuarioExistente && $usuarioExistente->id !== $usuario->id) {
                throw new Exception('E-mail já está em uso.');
            }

            $usuario->email = $data['email'];
        }

        $usuario->telefone = $data['telefone'] ?? null;
        $usuario->cpf = $data['cpf'] ?? null;

        if (!empty($data['data_nascimento'])) {
            if (DateTime::createFromFormat('Y-m-d', $data['data_nascimento']) === false) {
                throw new Exception('Formato de data inválido. Use YYYY-MM-DD.');
            }
            $usuario->data_nascimento = $data['data_nascimento'];
        } else {
            $usuario->data_nascimento = null;
        }

        if (!$this->usuarioRepository->update($usuario)) {
            throw new Exception('Erro ao atualizar usuário.');
        }
    }

    public function alterarSenha(int $id, string $senhaAtual, string $novaSenha): void
    {
        $usuario = $this->usuarioRepository->findById($id);
        if (!$usuario) {
            throw new Exception('Usuário não encontrado.');
        }

        if (!password_verify($senhaAtual, $usuario->senha)) {
            throw new Exception('Senha atual incorreta.');
        }

        if (strlen($novaSenha) < 6) {
            throw new Exception('A nova senha deve ter no mínimo 6 caracteres.');
        }

        if (!$this->usuarioRepository->alterarSenha($id, $novaSenha)) {
            throw new Exception('Erro ao alterar senha.');
        }
    }
}
