<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../repositories/UsuarioRepository.php';
require_once __DIR__ . '/../models/Usuario.php';

class UsuarioController extends BaseController
{
    private UsuarioRepository $repo;

    public function __construct(private PDO $pdo)
    {

        $this->repo = new UsuarioRepository($pdo);
    }

    #[Route('/usuarios', 'POST')]
    public function cadastrar()
    {
        $data = $this->getJsonInput();

        if (!isset($data['nome'], $data['email'], $data['senha'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'Todos os campos são obrigatórios.']);
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->response(400, ['status' => 'error', 'message' => 'E-mail inválido.']);
        }

        if (strlen($data['senha']) < 6) {
            return $this->response(400, ['status' => 'error', 'message' => 'A senha deve ter no mínimo 6 caracteres.']);
        }

        if ($this->repo->findByEmail($data['email'])) {
            return $this->response(409, ['status' => 'error', 'message' => 'Este e-mail já está em uso.']);
        }

        $usuario = new Usuario($data);
        $sucesso = $this->repo->save($usuario);

        if ($sucesso) {
            return $this->response(201, ['status' => 'success', 'message' => 'Usuário cadastrado com sucesso!']);
        }

        return $this->response(500, ['status' => 'error', 'message' => 'Erro ao cadastrar usuário.']);
    }
}
