<?php

require_once __DIR__ . '/../routing/Route.php';
require_once __DIR__ . '/../repositories/GeneroRepository.php';
require_once __DIR__ . '/../models/Genero.php';

class GeneroController extends BaseController
{
    private GeneroRepository $repo;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->repo = new GeneroRepository($pdo);
    }

    #[Route('/generos', 'GET')]
    public function listar()
    {
        if (isset($_GET['id'])) {
            $genero = $this->repo->findById((int)$_GET['id']);
            if ($genero) {
                return $this->response(200, ['status' => 'success', 'data' => $genero->toArray()]);
            }
            return $this->response(404, ['status' => 'error', 'message' => 'Gênero não encontrado.']);
        }

        $generos = $this->repo->findAll();
        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($g) => $g->toArray(), $generos)
        ]);
    }

    #[Route('/generos/{id}', 'GET')]
    public function buscar(int $id)
    {
        $genero = $this->repo->findById($id);
        if ($genero) {
            return $this->response(200, ['status' => 'success', 'data' => $genero->toArray()]);
        }
        return $this->response(404, ['status' => 'error', 'message' => 'Gênero não encontrado.']);
    }

    #[Route('/generos', 'POST')]
    public function criar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem criar gêneros.']);
        }

        $data = $this->getJsonInput();
        
        // Validate that $data is not null and 'nome' is set and not empty
        if (!$data || !isset($data['nome']) || empty(trim($data['nome']))) {
            return $this->response(400, ['status' => 'error', 'message' => 'Nome do gênero é obrigatório e não pode ser vazio.']);
        }

        try {
            $nomeGenero = trim($data['nome']);
            // Assuming Genero constructor can take an array of properties
            // or you might instantiate and set properties: e.g., $genero = new Genero(); $genero->nome = $nomeGenero;
            $genero = new Genero(['nome' => $nomeGenero]); 
            
            $savedGenero = $this->repo->save($genero); // Expecting this to handle INSERT and return the saved Genero object

            // Check if save returned a valid Genero object with an ID
            if ($savedGenero && $savedGenero instanceof Genero && !empty($savedGenero->id)) {
                return $this->response(201, [
                    'status' => 'success', // Consistent status field
                    'message' => 'Gênero cadastrado com sucesso.', 
                    'data' => $savedGenero->toArray() // Return the full created object, similar to update
                ]);
            } else {
                // This case handles if repo->save returns false, null, or an object without a valid ID after creation
                // You might want to log the actual value of $savedGenero here for debugging
                // error_log('GeneroController::criar - Falha ao salvar. Retorno do save: ' . print_r($savedGenero, true));
                return $this->response(500, ['status' => 'error', 'message' => 'Erro ao cadastrar o gênero. A operação de salvar falhou ou não retornou um ID válido.']);
            }
        } catch (PDOException $e) { // More specific catch for database errors
            // Log error: error_log("PDOException in GeneroController::criar(): " . $e->getMessage());
            return $this->response(500, ['status' => 'error', 'message' => 'Erro de banco de dados ao criar gênero: Verifique os logs do servidor.']);
        } catch (Exception $e) { // Catch any other exceptions
            // Log error: error_log("Exception in GeneroController::criar(): " . $e->getMessage());
            return $this->response(500, ['status' => 'error', 'message' => 'Erro interno do servidor ao tentar criar gênero: ' . $e->getMessage()]);
        }
    }

    #[Route('/generos/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem excluir gêneros.']);
        }

        try {
            $this->repo->delete($id);
            return $this->response(200, ['status' => 'success', 'message' => 'Gênero excluído com sucesso.']);
        } catch (Exception $e) {
            return $this->response(500, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    #[Route('/generos/{id}', 'PUT')] 
    public function atualizar(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem atualizar gêneros.']);
        }

        $data = $this->getJsonInput();
        $nome = trim($data['nome'] ?? '');

        if (empty($nome)) {
            return $this->response(400, ['status' => 'error', 'message' => 'Nome do gênero é obrigatório.']);
        }

        $genero = $this->repo->findById($id);
        if (!$genero) {
            return $this->response(404, ['status' => 'error', 'message' => 'Gênero não encontrado.']);
        }

        $genero->nome = $nome;
        $updatedGenero = $this->repo->save($genero); // save agora lida com update

        if ($updatedGenero) {
            return $this->response(200, ['status' => 'success', 'message' => 'Gênero atualizado com sucesso.', 'data' => $updatedGenero->toArray()]);
        }
        return $this->response(500, ['status' => 'error', 'message' => 'Erro ao atualizar o gênero.']);
    }

}
