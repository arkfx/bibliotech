<?php

namespace BiblioTech\Repositories;

use BiblioTech\Models\Pedido;
use PDO;

class PedidoRepository extends BaseRepository
{
    public function criar(Pedido $pedido): int
    {
        $stmt = $this->conn->prepare(
            "INSERT INTO pedidos (usuario_id, total, status, valor_frete, endereco_id, criado_em)
             VALUES (:usuario_id, :total, :status, :valor_frete, :endereco_id, :criado_em)"
        );

        $stmt->execute([
            ':usuario_id' => $pedido->usuario_id,
            ':total' => $pedido->total,
            ':status' => $pedido->status,
            ':valor_frete' => $pedido->valor_frete,
            ':endereco_id' => $pedido->endereco_id,
            ':criado_em' => $pedido->criado_em,
        ]);

        return (int) $this->conn->lastInsertId();
    }

    public function buscarPorUsuario(int $usuarioId): array
    {
        $sql = "
            SELECT 
                p.id AS pedido_id, p.total, p.status, p.valor_frete, p.criado_em, p.endereco_id,
                i.livro_id, i.quantidade, i.preco_unitario, i.tipo,
                l.titulo, l.autor, l.imagem_url,
                e.endereco, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep
            FROM pedidos p
            INNER JOIN pedido_itens i ON p.id = i.pedido_id
            INNER JOIN livros l ON i.livro_id = l.id
            LEFT JOIN endereco e ON p.endereco_id = e.id
            WHERE p.usuario_id = :usuario_id
            ORDER BY p.criado_em DESC, p.id DESC
        ";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':usuario_id' => $usuarioId]);

        $pedidos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $pedidoId = $row['pedido_id'];

            // Se o pedido ainda não foi adicionado ao array, crie a estrutura base
            if (!isset($pedidos[$pedidoId])) {
                $pedidos[$pedidoId] = [
                    'id' => $pedidoId,
                    'total' => (float)$row['total'],
                    'status' => $row['status'],
                    'valor_frete' => (float)$row['valor_frete'],
                    'criado_em' => $row['criado_em'],
                    'endereco_id' => $row['endereco_id'],
                    'itens' => [],
                    'endereco' => null
                ];

                // Adiciona o endereço apenas uma vez por pedido
                if ($row['endereco_id'] && $row['endereco']) {
                    $pedidos[$pedidoId]['endereco'] = [
                        'endereco' => $row['endereco'],
                        'numero' => $row['numero'],
                        'complemento' => $row['complemento'],
                        'bairro' => $row['bairro'],
                        'cidade' => $row['cidade'],
                        'estado' => $row['estado'],
                        'cep' => $row['cep'],
                    ];
                }
            }

            // Adiciona o item atual ao pedido correspondente
            $pedidos[$pedidoId]['itens'][] = [
                'livro_id' => $row['livro_id'],
                'quantidade' => (int)$row['quantidade'],
                'preco_unitario' => (float)$row['preco_unitario'],
                'tipo' => $row['tipo'],
                'titulo' => $row['titulo'],
                'autor' => $row['autor'],
                'imagem_url' => $row['imagem_url']
            ];
        }

        // Retorna apenas os valores do array, reindexando para uma lista simples
        return array_values($pedidos);
    }

    public function buscarPorId(int $id): ?Pedido
    {
        $stmt = $this->conn->prepare("SELECT * FROM pedidos WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? new Pedido($row) : null;
    }

    public function buscarPedidoCompletoPorId(int $pedidoId): ?array
    {
        $sql = "
        SELECT 
            p.id AS pedido_id,
            p.usuario_id,
            p.total,      
            p.valor_frete,
            p.endereco_id,
            p.status,
            p.criado_em,
            i.id AS item_id,
            i.livro_id,
            i.quantidade,
            i.preco_unitario,
            i.tipo AS item_tipo,
            l.titulo,
            l.imagem_url,
            e.endereco,
            e.numero,
            e.complemento,
            e.bairro,
            e.cidade,
            e.estado,
            e.cep
        FROM pedidos p
        INNER JOIN pedido_itens i ON p.id = i.pedido_id
        INNER JOIN livros l ON l.id = i.livro_id
        LEFT JOIN endereco e ON e.id = p.endereco_id
        WHERE p.id = :pedido_id
";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute([':pedido_id' => $pedidoId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$rows) {
            return null;
        }

        $pedidoCompleto = [
            'id' => $rows[0]['pedido_id'],
            'pedido_id' => $rows[0]['pedido_id'],
            'usuario_id' => $rows[0]['usuario_id'],
            'total' => (float)$rows[0]['total'],
            'valor_frete' => (float)$rows[0]['valor_frete'],
            'endereco_id' => $rows[0]['endereco_id'],
            'status' => $rows[0]['status'],
            'criado_em' => $rows[0]['criado_em'],
            'itens' => [],
            'endereco' => null
        ];

        // Adiciona informações do endereço se existir
        if ($rows[0]['endereco_id'] && $rows[0]['endereco']) {
            $pedidoCompleto['endereco'] = [
                'endereco' => $rows[0]['endereco'],
                'numero' => $rows[0]['numero'],
                'complemento' => $rows[0]['complemento'],
                'bairro' => $rows[0]['bairro'],
                'cidade' => $rows[0]['cidade'],
                'estado' => $rows[0]['estado'],
                'cep' => $rows[0]['cep'],
            ];
        }

        foreach ($rows as $row) {
            $pedidoCompleto['itens'][] = [
                'id' => $row['item_id'],
                'pedido_id' => $row['pedido_id'],
                'livro_id' => $row['livro_id'],
                'quantidade' => (int)$row['quantidade'],
                'preco_unitario' => (float)$row['preco_unitario'],
                'tipo' => $row['item_tipo'],
                'titulo' => $row['titulo'],
                'imagem_url' => $row['imagem_url'],
            ];
        }

        return $pedidoCompleto;
    }

    public function buscarPedidoPendenteDoUsuario(int $usuarioId): ?Pedido
    {
        $sql = "SELECT * FROM pedidos WHERE usuario_id = :usuario_id AND status = 'pendente' LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':usuario_id', $usuarioId);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data) {
            return new Pedido($data);
        }

        return null;
    }

    public function atualizarStatus(int $pedidoId, string $novoStatus): void
    {
        $stmt = $this->conn->prepare(
            "UPDATE pedidos SET status = :status WHERE id = :id"
        );

        $stmt->execute([
            ':status' => $novoStatus,
            ':id' => $pedidoId
        ]);
    }
}