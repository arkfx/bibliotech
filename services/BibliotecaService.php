<?php

require_once __DIR__ . '/../repositories/BibliotecaRepository.php';

class BibliotecaService
{
    private BibliotecaRepository $bibliotecaRepository;

    public function __construct(private PDO $pdo)
    {
        $this->bibliotecaRepository = new BibliotecaRepository($pdo);
    }

    public function listarLivrosPorUsuario(int $usuarioId): array
    {
        return $this->bibliotecaRepository->listarPorUsuario($usuarioId);
    }

    public function buscarLivroParaLeitura(int $usuarioId, int $livroId)
    {
        return $this->bibliotecaRepository->buscarLivroDaBiblioteca($usuarioId, $livroId);
    }
}
