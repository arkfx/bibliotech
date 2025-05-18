<?php

require_once __DIR__ . '/../routing/Route.php';
require_once __DIR__ . '/../repositories/LivroRepository.php';
require_once __DIR__ . '/../repositories/EditoraRepository.php';
require_once __DIR__ . '/../repositories/GeneroRepository.php';
require_once __DIR__ . '/BaseController.php';

class LivroController extends BaseController
{
    private LivroRepository $livroRepository;
    private EditoraRepository $editoraRepository;
    private GeneroRepository $generoRepository;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->livroRepository = new LivroRepository($pdo);
        $this->editoraRepository = new EditoraRepository($pdo);
        $this->generoRepository = new GeneroRepository($pdo);
    }

    #[Route('/livros', 'GET')]
    public function listar()
    {
        $termo = $_GET['q'] ?? null;
        $genero_id = isset($_GET['genero_id']) ? (int)$_GET['genero_id'] : null;
        $ordem = isset($_GET['ordem']) && in_array(strtoupper($_GET['ordem']), ['ASC', 'DESC']) ? strtoupper($_GET['ordem']) : 'DESC';

        $livros = $this->livroRepository->search($termo, $genero_id, $ordem);

        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($l) => $l->toArray(), $livros)
        ]);
    }

    #[Route('/livros/{id}', 'GET')]
    public function buscar(int $id)
    {
        $livro = $this->livroRepository->findById($id);

        if ($livro) {
            return $this->response(200, ['status' => 'success', 'data' => $livro->toArray()]);
        }

        return $this->response(404, ['status' => 'error', 'message' => 'Livro não encontrado.']);
    }

    #[Route('/livros', 'POST')]
    public function criar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem realizar essa ação.']);
        }

        $data = $this->getJsonInput();

        if (!$this->validarCampos($data)) {
            return $this->response(400, ['status' => 'error', 'message' => 'Todos os campos são obrigatórios.']);
        }

        if (!$this->editoraRepository->findById($data['editora_id'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'Editora inválida.']);
        }

        if (!$this->generoRepository->findById($data['genero_id'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'Gênero inválido.']);
        }

        $livro = new Livro($data);
        $this->livroRepository->save($livro);

        return $this->response(201, ['status' => 'success', 'message' => 'Livro cadastrado com sucesso!']);
    }

    #[Route('/livros', 'PUT')]
    public function atualizar()
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem realizar essa ação.']);
        }

        $data = $this->getJsonInput();

        if (!isset($data['id']) || !$this->validarCampos($data)) {
            return $this->response(400, ['status' => 'error', 'message' => 'Todos os campos, incluindo o ID, são obrigatórios.']);
        }

        if (!$this->editoraRepository->findById($data['editora_id'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'Editora inválida.']);
        }

        if (!$this->generoRepository->findById($data['genero_id'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'Gênero inválido.']);
        }

        $livro = new Livro($data);
        $this->livroRepository->save($livro);

        return $this->response(200, ['status' => 'success', 'message' => 'Livro atualizado com sucesso!']);
    }

    #[Route('/livros/{id}', 'DELETE')]
    public function excluir(int $id)
    {
        if (!$this->isAdmin()) {
            return $this->response(403, ['status' => 'error', 'message' => 'Acesso negado. Apenas administradores podem realizar essa ação.']);
        }

        try {
            $this->livroRepository->delete($id);
            return $this->response(200, ['status' => 'success', 'message' => 'Livro excluído com sucesso!']);
        } catch (Exception $e) {
            return $this->response(404, ['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    private function validarCampos(array $data): bool
    {
        $campos = ['titulo', 'autor', 'genero_id', 'preco', 'editora_id', 'descricao', 'imagem_url'];
        foreach ($campos as $campo) {
            if (!isset($data[$campo]) || $data[$campo] === '') return false;
        }
        return true;
    }
}
