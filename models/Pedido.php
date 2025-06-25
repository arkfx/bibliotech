<?php

namespace BiblioTech\Models;

class Pedido
{
    public int $id;
    public int $usuario_id;
    public float $total;
    public string $status;
    public string $criado_em;
    public array $itens = [];
    public float $valor_frete = 0.0;
    public ?int $endereco_id = null; // ...existing code...
    public ?array $endereco = null; // Adiciona a propriedade para evitar warnings

    public function __construct(array $data)
    {
        $this->id = isset($data['id']) ? (int) $data['id'] : 0;
        $this->usuario_id = isset($data['usuario_id']) ? (int) $data['usuario_id'] : 0;
        $this->total = isset($data['total']) ? (float) $data['total'] : 0.0;
        $this->status = $data['status'] ?? 'pendente';
        $this->valor_frete = isset($data['valor_frete']) ? (float) $data['valor_frete'] : 0.0;
        $this->endereco_id = isset($data['endereco_id']) ? (int) $data['endereco_id'] : null;
        $this->criado_em = $data['criado_em'] ?? date('Y-m-d H:i:s');

        // Permite inicializar itens e endereço se vierem no array
        if (isset($data['itens']) && is_array($data['itens'])) {
            $this->itens = $data['itens'];
        }
        if (isset($data['endereco']) && is_array($data['endereco'])) {
            $this->endereco = $data['endereco'];
        }
    }

    public function toArray(): array
    {
        $arr = [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'total' => $this->total,
            'status' => $this->status,
            'valor_frete' => $this->valor_frete,
            'endereco_id' => $this->endereco_id,
            'criado_em' => $this->criado_em
        ];

        if (!empty($this->itens)) {
            $arr['itens'] = $this->itens;
        }

        if (!empty($this->endereco)) {
            $arr['endereco'] = $this->endereco;
        }

        return $arr;
    }
}
