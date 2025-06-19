<?php

namespace BiblioTech\Services;

use BiblioTech\Repositories\BibliotecaRepository;

class BibliotecaService
{
    private BibliotecaRepository $bibliotecaRepository;

    public function __construct(BibliotecaRepository $bibliotecaRepository)
    {
        $this->bibliotecaRepository = $bibliotecaRepository;
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
