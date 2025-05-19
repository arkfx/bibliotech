<?php
class Usuario
{
    public ?int $id = null;
    public string $nome;
    public string $email;
    public string $senha;
    public ?int $cargo_id = null;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->nome = $data['nome'];
        $this->email = $data['email'];
        $this->senha = $data['senha'];
        $this->cargo_id = $data['cargo_id'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'id'    => $this->id,
            'nome'  => $this->nome,
            'email' => $this->email,
        ];
    }
}
