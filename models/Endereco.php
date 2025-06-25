<?php

namespace BiblioTech\Models;

class Endereco
{
    public ?int $id = null;
    public int $usuario_id;
    public string $endereco;
    public string $numero;
    public ?string $complemento;
    public string $bairro;
    public string $cidade;
    public string $estado;
    public ?string $cep;
    public bool $is_principal;
    public ?string $created_at;
    public ?string $updated_at;

    public function __construct(array $data)
    {
        $this->id = $data['id'] ?? null;
        $this->usuario_id = (int) $data['usuario_id'];
        $this->endereco = $data['endereco'];
        $this->numero = $data['numero'];
        $this->complemento = $data['complemento'] ?? null;
        $this->bairro = $data['bairro'];
        $this->cidade = $data['cidade'];
        $this->estado = $data['estado'];
        $this->cep = $data['cep'] ?? null;
        $this->is_principal = (bool) ($data['is_principal'] ?? false);
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'endereco' => $this->endereco,
            'numero' => $this->numero,
            'complemento' => $this->complemento,
            'bairro' => $this->bairro,
            'cidade' => $this->cidade,
            'estado' => $this->estado,
            'cep' => $this->cep,
            'is_principal' => $this->is_principal,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    public function getEnderecoCompleto(): string
    {
        $endereco_completo = "{$this->endereco}, {$this->numero}";
        
        if ($this->complemento) {
            $endereco_completo .= ", {$this->complemento}";
        }
        
        $endereco_completo .= " - {$this->bairro}, {$this->cidade}/{$this->estado}";
        
        if ($this->cep) {
            $endereco_completo .= " - CEP: {$this->cep}";
        }
        
        return $endereco_completo;
    }
}