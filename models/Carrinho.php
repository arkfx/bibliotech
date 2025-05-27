<?php

class Carrinho
{
    public int $id;
    public int $usuario_id;
    public int $livro_id;
    public int $quantidade;

    public function __construct(array $data)
    {
        $this->id = (int) ($data['id'] ?? 0);
        $this->usuario_id = (int) ($data['usuario_id'] ?? 0);
        $this->livro_id = (int) ($data['livro_id'] ?? 0);
        $this->quantidade = (int) ($data['quantidade'] ?? 1);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'livro_id' => $this->livro_id,
            'quantidade' => $this->quantidade
        ];
    }
}
