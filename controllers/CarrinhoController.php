<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../repositories/CarrinhoRepository.php';
require_once __DIR__ . '/../repositories/UsuarioRepository.php';
require_once __DIR__ . '/../repositories/LivroRepository.php';
require_once __DIR__ . '/../repositories/BibliotecaRepository.php';
require_once __DIR__ . '/../models/Carrinho.php';

class CarrinhoController extends BaseController
{
    private CarrinhoRepository $carrinhoRepository;
    private UsuarioRepository $usuarioRepository;
    private LivroRepository $livroRepository;
    private BibliotecaRepository $bibliotecaRepository;

    public function __construct(private PDO $pdo)
    {
        session_start();
        $this->carrinhoRepository = new CarrinhoRepository($pdo);
        $this->usuarioRepository = new UsuarioRepository($pdo);
        $this->livroRepository = new LivroRepository($pdo);
        $this->bibliotecaRepository = new BibliotecaRepository($pdo);
    }

    #[Route('/carrinho', 'GET')]
    public function listar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $usuarioId = $_SESSION['userId'];

        $items = $this->carrinhoRepository->listarPorUsuario((int)$usuarioId);

        return $this->response(200, [
            'status' => 'success',
            'data' => array_map(fn($item) => $item instanceof Carrinho ? $item->toArray() : $item, $items)
        ]);
    }

    #[Route('/carrinho', 'POST')]
    public function adicionar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput(); 
        $usuarioId = $_SESSION['userId'];
        $livroId = $data['id'] ?? null; 
        $quantidade = $data['quantidade'] ?? 1;
        $tipo = $data['tipo'] ?? null;


        if (!$livroId || !isset($data['quantidade']) || !$tipo) {
            return $this->response(400, ['status' => 'error', 'message' => 'ID do livro, quantidade e tipo são obrigatórios.']);
        }
        
        $quantidade = (int)$quantidade;
        $livroId = (int)$livroId;

        if (!in_array($tipo, ['ebook', 'fisico'])) {
            return $this->response(400, ['status' => 'error', 'message' => "Tipo inválido. Deve ser 'ebook' ou 'fisico'."]);
        }

        $livro = $this->livroRepository->findById($livroId);
        if (!$livro) {
            return $this->response(404, ['status' => 'error', 'message' => 'Livro não encontrado.']);
        }

        // VERIFICAÇÃO PARA E-BOOKS
        if ($tipo === 'ebook') {
            $itemBiblioteca = new Biblioteca(['usuario_id' => $usuarioId, 'livro_id' => $livroId]);
            if ($this->bibliotecaRepository->existeNaBiblioteca($itemBiblioteca)) {
                return $this->response(409, [ 
                    'status' => 'error',
                    'message' => 'Você já possui este e-book em sua biblioteca.'
                ]);
            }
            
            if ($quantidade > 1) {
                 return $this->response(400, [
                    'status' => 'error',
                    'message' => 'Não é possível adicionar mais de uma unidade de um e-book ao carrinho.'
                ]);
            }
        }


        $carrinho = new Carrinho([
            'livro_id' => $livroId,
            'usuario_id' => (int)$usuarioId,
            'quantidade' => $quantidade,
            'tipo' => $tipo,
        ]);

        if ($this->carrinhoRepository->adicionar($carrinho)) {
            return $this->response(200, ['status' => 'success', 'message' => 'Livro adicionado ao carrinho com sucesso!']);
        }

        return $this->response(500, ['status' => 'error', 'message' => 'Erro ao adicionar livro ao carrinho.']); // Mudado para 500
    }

    #[Route('/carrinho', 'PUT')]
    public function atualizar()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        // Validação de entrada
        $livroId = $data['id'] ?? null;
        $quantidade = $data['quantidade'] ?? null;
        $tipo = $data['tipo'] ?? null;

        if ($livroId === null || $quantidade === null || $tipo === null) {
            return $this->response(400, ['status' => 'error', 'message' => 'ID do livro, nova quantidade e tipo são obrigatórios.']);
        }
        
        $livroId = (int)$livroId;
        $quantidade = (int)$quantidade;

        if ($quantidade <= 0) {
             return $this->response(400, ['status' => 'error', 'message' => 'A quantidade deve ser maior que zero. Para remover o item, utilize a rota DELETE.']);
        }

        if (!in_array($tipo, ['ebook', 'fisico'])) {
            return $this->response(400, ['status' => 'error', 'message' => "Tipo inválido. Deve ser 'ebook' ou 'fisico'."]);
        }
        
        // VERIFICAÇÃO PARA E-BOOKS AO ATUALIZAR
        if ($tipo === 'ebook' && $quantidade > 1) {
            return $this->response(400, [
               'status' => 'error',
               'message' => 'Não é possível ter mais de uma unidade de um e-book no carrinho.'
           ]);
        }

        $carrinho = new Carrinho([
            'livro_id' => $livroId,
            'usuario_id' => (int)$usuarioId,
            'quantidade' => $quantidade,
            'tipo' => $tipo,
        ]);

        if ($this->carrinhoRepository->atualizarQuantidade($carrinho)) {
            return $this->response(200, ['status' => 'success', 'message' => 'Quantidade atualizada com sucesso.']);
        }

        return $this->response(404, ['status' => 'error', 'message' => 'Falha ao atualizar quantidade. Verifique se o item existe no carrinho com o tipo especificado.']);
    }

    #[Route('/carrinho', 'DELETE')]
    public function remover()
    {
        if (!$this->isAuthenticated()) {
            return $this->response(401, ['status' => 'error', 'message' => 'Usuário não autenticado.']);
        }

        $data = $this->getJsonInput();
        $usuarioId = $_SESSION['userId'];

        if (!isset($data['id'], $data['tipo'])) {
            return $this->response(400, ['status' => 'error', 'message' => 'ID do livro e tipo são obrigatórios.']);
        }

        if (!in_array($data['tipo'], ['ebook', 'fisico'])) {
            return $this->response(400, ['status' => 'error', 'message' => "Tipo inválido. Deve ser 'ebook' ou 'fisico'."]);
        }

        $carrinhoParaRemover = new Carrinho([
            'usuario_id' => (int)$usuarioId,
            'livro_id' => (int)$data['id'],
            'tipo' => $data['tipo']
        ]);

        if ($this->carrinhoRepository->remover($carrinhoParaRemover)) {
            return $this->response(200, ['status' => 'success', 'message' => 'Livro removido do carrinho com sucesso!']);
        }

        return $this->response(404, ['status' => 'error', 'message' => 'Erro ao remover livro do carrinho.']);
    }
}
