<?php

namespace BiblioTech\Controllers;

use BiblioTech\Core\Route;
use BiblioTech\Core\AppFactory;
use BiblioTech\Services\EnderecoService;
use Exception;

class EnderecoController extends BaseController
{
    private EnderecoService $enderecoService;

    public function __construct(private AppFactory $appFactory)
    {
        session_start();
        $this->enderecoService = $this->appFactory->createEnderecoService();
    }

    #[Route('/endereco', 'POST')]
    public function criar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        try {
            $enderecoId = $this->enderecoService->criar($data, $usuarioId);

            return $this->response(201, [
                'status' => 'success',
                'message' => 'Endereço criado com sucesso!',
                'endereco_id' => $enderecoId
            ]);

        } catch (Exception $e) {
            return $this->response(400, [
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    #[Route('/endereco', 'GET')]
    public function listar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];

        try {
            $enderecos = $this->enderecoService->listarPorUsuario($usuarioId);

            return $this->response(200, [
                'status' => 'success',
                'data' => array_map(fn($endereco) => $endereco->toArray(), $enderecos)
            ]);

        } catch (Exception $e) {
            return $this->response(500, [
                'status' => 'error',
                'message' => 'Erro ao listar endereços: ' . $e->getMessage()
            ]);
        }
    }

    #[Route('/endereco/{id}', 'GET')]
    public function buscar(int $id)
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];

        try {
            $endereco = $this->enderecoService->buscarPorId($id, $usuarioId);

            if (!$endereco) {
                return $this->response(404, ['status' => 'error', 'message' => 'Endereço não encontrado.']);
            }

            return $this->response(200, [
                'status' => 'success',
                'data' => $endereco->toArray()
            ]);

        } catch (Exception $e) {
            return $this->response(500, [
                'status' => 'error',
                'message' => 'Erro ao buscar endereço: ' . $e->getMessage()
            ]);
        }
    }

    #[Route('/endereco/principal', 'GET')]
    public function buscarPrincipal()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];

        try {
            $endereco = $this->enderecoService->buscarPrincipal($usuarioId);

            if (!$endereco) {
                return $this->response(404, ['status' => 'error', 'message' => 'Nenhum endereço principal encontrado.']);
            }

            return $this->response(200, [
                'status' => 'success',
                'data' => $endereco->toArray()
            ]);

        } catch (Exception $e) {
            return $this->response(500, [
                'status' => 'error',
                'message' => 'Erro ao buscar endereço principal: ' . $e->getMessage()
            ]);
        }
    }

    #[Route('/endereco/{id}', 'PUT')]
    public function atualizar(int $id)
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        try {
            $success = $this->enderecoService->atualizar($id, $data, $usuarioId);

            if ($success) {
                return $this->response(200, [
                    'status' => 'success',
                    'message' => 'Endereço atualizado com sucesso!'
                ]);
            } else {
                return $this->response(500, [
                    'status' => 'error',
                    'message' => 'Erro ao atualizar endereço.'
                ]);
            }

        } catch (Exception $e) {
            return $this->response(400, [
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    #[Route('/endereco/{id}/principal', 'PUT')]
    public function definirComoPrincipal(int $id)
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];

        try {
            $success = $this->enderecoService->definirComoPrincipal($id, $usuarioId);

            if ($success) {
                return $this->response(200, [
                    'status' => 'success',
                    'message' => 'Endereço definido como principal com sucesso!'
                ]);
            } else {
                return $this->response(500, [
                    'status' => 'error',
                    'message' => 'Erro ao definir endereço como principal.'
                ]);
            }

        } catch (Exception $e) {
            return $this->response(400, [
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    #[Route('/endereco/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];

        try {
            $success = $this->enderecoService->excluir($id, $usuarioId);

            if ($success) {
                return $this->response(200, [
                    'status' => 'success',
                    'message' => 'Endereço excluído com sucesso!'
                ]);
            } else {
                return $this->response(500, [
                    'status' => 'error',
                    'message' => 'Erro ao excluir endereço.'
                ]);
            }

        } catch (Exception $e) {
            return $this->response(400, [
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    #[Route('/endereco/validar', 'GET')]
    public function validarEnderecoCompleto()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];

        try {
            $enderecoValido = $this->enderecoService->validarEnderecoCompleto($usuarioId);

            return $this->response(200, [
                'status' => 'success',
                'endereco_valido' => $enderecoValido
            ]);

        } catch (Exception $e) {
            return $this->response(500, [
                'status' => 'error',
                'message' => 'Erro ao validar endereço: ' . $e->getMessage()
            ]);
        }
    }

    #[Route('/endereco/formulario', 'POST')]
    public function salvarDoFormulario()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        try {
            $endereco = $this->enderecoService->buscarOuCriarPadrao($usuarioId, $data);

            return $this->response(200, [
                'status' => 'success',
                'message' => 'Endereço salvo com sucesso!',
                'data' => $endereco->toArray()
            ]);

        } catch (Exception $e) {
            return $this->response(400, [
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
}