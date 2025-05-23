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

    #[Route('/usuarios/{id}', 'GET')]
    public function buscar(int $id)
    {
        try {
            $usuario = $this->repo->findById($id);

            if (!$usuario) {
                return $this->response(404, ['status' => 'error', 'message' => 'Usuário não encontrado.']);
            }

            return $this->response(200, ['status' => 'success', 'data' => $usuario->toArray()]);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => 'Erro ao buscar usuário: ' . $e->getMessage()]);
        }
    }

    #[Route('/usuarios/{id}', 'PUT')]
    public function atualizar(int $id)
    {
        $data = $this->getJsonInput();

        try {
            $usuario = $this->repo->findById($id);

            if (!$usuario) {
                return $this->response(404, ['status' => 'error', 'message' => 'Usuário não encontrado.']);
            }

            // Atualizar apenas os campos permitidos
            if (isset($data['nome'])) {
                $usuario->nome = $data['nome'];
            }

            if (isset($data['email'])) {
                if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                    return $this->response(400, ['status' => 'error', 'message' => 'E-mail inválido.']);
                }

                $usuarioExistente = $this->repo->findByEmail($data['email']);
                if ($usuarioExistente && $usuarioExistente->id !== $usuario->id) {
                    return $this->response(409, ['status' => 'error', 'message' => 'E-mail já está em uso.']);
                }

                $usuario->email = $data['email'];
            }

            if (isset($data['telefone']) && $data['telefone'] !== '') {
                $usuario->telefone = $data['telefone'];
            } else {
                $usuario->telefone = null;
            }
            
            if (isset($data['data_nascimento']) && $data['data_nascimento'] !== '') {
                // Verifique se a data está no formato correto
                if (DateTime::createFromFormat('Y-m-d', $data['data_nascimento']) !== false) {
                    $usuario->data_nascimento = $data['data_nascimento'];
                } else {
                    return $this->response(400, ['status' => 'error', 'message' => 'Formato de data inválido. Use YYYY-MM-DD.']);
                }
            } else {
                $usuario->data_nascimento = null;
            }
            
            if (isset($data['cpf']) && $data['cpf'] !== '') {
                $usuario->cpf = $data['cpf'];
            } else {
                $usuario->cpf = null;
            }

            $sucesso = $this->repo->update($usuario);

            if ($sucesso) {
                return $this->response(200, ['status' => 'success', 'message' => 'Usuário atualizado com sucesso.']);
            }

            return $this->response(500, ['status' => 'error', 'message' => 'Erro ao atualizar usuário.']);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => 'Erro ao atualizar usuário: ' . $e->getMessage()]);
        }
    }
}
