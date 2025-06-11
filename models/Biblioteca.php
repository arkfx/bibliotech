<?php

class Biblioteca
{
    public $id;
    public $usuario_id;
    public $livro_id;
    public $data_adquirido;

    public function __construct($data = [])
    {
        $this->id = $data['id'] ?? null;
        $this->usuario_id = $data['usuario_id'] ?? null;
        $this->livro_id = $data['livro_id'] ?? null;
        $this->data_adquirido = $data['data_adquirido'] ?? null;
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'livro_id' => $this->livro_id,
            'data_adquirido' => $this->data_adquirido,
        ];
    }
}