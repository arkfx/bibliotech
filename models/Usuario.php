<?php

namespace BiblioTech\Models;

class Usuario
{
    public ?int $id = null;
    public string $nome;
    public string $email;
    public string $senha;
    public ?string $telefone = null;
    public ?string $data_nascimento = null;
    public ?string $cpf = null;
    public ?int $cargo_id = null;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->nome = $data['nome'];
        $this->email = $data['email'];
        $this->senha = $data['senha'];
        $this->telefone = $data['telefone'] ?? null;
        $this->data_nascimento = $data['data_nascimento'] ?? null;
        $this->cpf = $data['cpf'] ?? null;
        $this->cargo_id = $data['cargo_id'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'id'    => $this->id,
            'nome'  => $this->nome,
            'email' => $this->email,
            'telefone' => $this->telefone,
            'data_nascimento' => $this->data_nascimento,
            'cpf' => $this->cpf,
        ];
    }
}
