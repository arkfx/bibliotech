<?php

class Genero
{
    public $id;
    public $nome;

    public function __construct($data = [])
    {
        $this->id = $data['id'] ?? null;
        $this->nome = $data['nome'] ?? '';
    }

    public function toArray()
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
        ];
    }
}
