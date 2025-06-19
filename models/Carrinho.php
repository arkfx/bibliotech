<?php

namespace BiblioTech\Models;

class Carrinho
{
    public int $id;
    public int $usuario_id;
    public int $livro_id;
    public int $quantidade;
    public string $tipo;

    public ?string $titulo = null;
    public ?float $preco = null;
    public ?string $imagem_url = null;
    public ?string $autor = null;

    public function __construct(array $data)
    {
        $this->id = (int) ($data['id'] ?? 0);
        $this->usuario_id = (int) ($data['usuario_id'] ?? 0); 
        $this->livro_id = (int) ($data['livro_id'] ?? 0);
        $this->quantidade = (int) ($data['quantidade'] ?? 1);
        $this->tipo = $data['tipo'] ?? 'fisico';

        $this->titulo = $data['titulo'] ?? null;
        $this->preco = isset($data['preco']) ? (float)$data['preco'] : null;
        $this->imagem_url = $data['imagem_url'] ?? null;
        $this->autor = $data['autor'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'livro_id' => $this->livro_id,
            'quantidade' => $this->quantidade,
            'tipo' => $this->tipo,

            'titulo' => $this->titulo,
            'preco' => $this->preco,
            'imagem_url' => $this->imagem_url,
            'autor' => $this->autor,
        ];
    }
}