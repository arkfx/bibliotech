<?php

require_once __DIR__ . '/../services/UsuarioService.php';
require_once __DIR__ . '/BaseController.php';

class UsuarioController extends BaseController
{
    private UsuarioService $usuarioService;

    public function __construct(private PDO $pdo)
    {
        $this->usuarioService = new UsuarioService($pdo);
    }

    #[Route('/usuarios', 'POST')]
    public function cadastrar()
    {
        try {
            $data = $this->getJsonInput();
            $this->usuarioService->cadastrar($data);
            return $this->response(201, ['status' => 'success', 'message' => 'Usuário cadastrado com sucesso!']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/usuarios/{id}', 'GET')]
    public function buscar(int $id)
    {
        try {
            $usuario = $this->usuarioService->buscar($id);
            if (!$usuario) {
                return $this->response(404, ['status' => 'error', 'message' => 'Usuário não encontrado.']);
            }
            return $this->response(200, ['status' => 'success', 'data' => $usuario->toArray()]);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/usuarios/{id}', 'PUT')]
    public function atualizar(int $id)
    {
        try {
            $data = $this->getJsonInput();
            $this->usuarioService->atualizar($id, $data);
            return $this->response(200, ['status' => 'success', 'message' => 'Usuário atualizado com sucesso.']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/usuarios/{id}/senha', 'PUT')]
    public function alterarSenha(int $id)
    {
        try {
            $data = $this->getJsonInput();
            if (
                empty($data['senha_atual']) ||
                empty($data['nova_senha'])
            ) {
                return $this->response(400, ['status' => 'error', 'message' => 'Dados incompletos.']);
            }

            $this->usuarioService->alterarSenha($id, $data['senha_atual'], $data['nova_senha']);
            return $this->response(200, ['status' => 'success', 'message' => 'Senha alterada com sucesso.']);
        } catch (Exception $e) {
            return $this->response(400, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
