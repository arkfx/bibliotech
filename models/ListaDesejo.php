<?php

namespace BiblioTech\Models;

class ListaDesejo
{
    public int $usuario_id;
    public int $livro_id;
    public ?string $created_at;
    public ?string $updated_at;

    public function __construct(array $data)
    {
        $this->usuario_id = (int) $data['usuario_id'];
        $this->livro_id = (int) $data['livro_id'];
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'usuario_id' => $this->usuario_id,
            'livro_id' => $this->livro_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
