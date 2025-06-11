<?php

require_once 'BaseRepository.php';
require_once __DIR__ . '/../models/PedidoItem.php';

class PedidoItemRepository extends BaseRepository
{
    public function criar(PedidoItem $item): bool
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO pedido_itens (pedido_id, livro_id, quantidade, preco_unitario, tipo)
             VALUES (:pedido_id, :livro_id, :quantidade, :preco_unitario, :tipo)"
        );

        return $stmt->execute([
            ':pedido_id' => $item->pedido_id,
            ':livro_id' => $item->livro_id,
            ':quantidade' => $item->quantidade,
            ':preco_unitario' => $item->preco_unitario,
            ':tipo' => $item->tipo,
        ]);
    }

    
    public function buscarPorPedido(int $pedidoId): array
    {
        $stmt = $this->conn->prepare('SELECT * FROM pedido_itens WHERE pedido_id = :pedido_id');
        $stmt->execute(['pedido_id' => $pedidoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function listarPorPedido(int $pedidoId): array
    {
        $stmt = $this->conn->prepare("SELECT * FROM pedido_itens WHERE pedido_id = :pedido_id");
        $stmt->execute([':pedido_id' => $pedidoId]);

        $itens = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $itens[] = new PedidoItem($row);
        }

        return $itens;
    }
}
