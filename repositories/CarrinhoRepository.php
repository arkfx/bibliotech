<?php

namespace BiblioTech\Repositories;
use BiblioTech\Models\Carrinho;
use PDO;

class CarrinhoRepository extends BaseRepository
{
    public function adicionar(Carrinho $carrinho): bool
    {
        $sql = "SELECT quantidade FROM carrinho WHERE usuario_id = :usuario_id AND livro_id = :livro_id AND tipo = :tipo";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':usuario_id', $carrinho->usuario_id, PDO::PARAM_INT);
        $stmt->bindValue(':livro_id', $carrinho->livro_id, PDO::PARAM_INT);
        $stmt->bindValue(':tipo', $carrinho->tipo, PDO::PARAM_STR);
        $stmt->execute();

        $existente = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        if ($existente) {
            $novaQuantidade = $existente['quantidade'] + $carrinho->quantidade;
            $update = "UPDATE carrinho SET quantidade = :quantidade WHERE usuario_id = :usuario_id AND livro_id = :livro_id AND tipo = :tipo";
            $stmt = $this->conn->prepare($update);
            $stmt->bindValue(':quantidade', $novaQuantidade, PDO::PARAM_INT);
            $stmt->bindValue(':usuario_id', $carrinho->usuario_id, PDO::PARAM_INT);
            $stmt->bindValue(':livro_id', $carrinho->livro_id, PDO::PARAM_INT);
            $stmt->bindValue(':tipo', $carrinho->tipo, PDO::PARAM_STR);
        } else {
            $insert = "INSERT INTO carrinho (usuario_id, livro_id, quantidade, tipo) VALUES (:usuario_id, :livro_id, :quantidade, :tipo)";
            $stmt = $this->conn->prepare($insert);
            $stmt->bindValue(':usuario_id', $carrinho->usuario_id, PDO::PARAM_INT);
            $stmt->bindValue(':livro_id', $carrinho->livro_id, PDO::PARAM_INT);
            $stmt->bindValue(':quantidade', $carrinho->quantidade, PDO::PARAM_INT);
            $stmt->bindValue(':tipo', $carrinho->tipo, PDO::PARAM_STR);
        }

        $stmt->bindValue(':usuario_id', $carrinho->usuario_id, PDO::PARAM_INT);
        $stmt->bindValue(':livro_id', $carrinho->livro_id, PDO::PARAM_INT);
        $stmt->bindValue(':tipo', $carrinho->tipo, PDO::PARAM_STR);

        $result = $stmt->execute();
        $stmt->closeCursor();

        return $result;
    }

    public function atualizarQuantidade(Carrinho $carrinho): bool
    {
        $sql = "UPDATE carrinho SET quantidade = :quantidade WHERE usuario_id = :usuario_id AND livro_id = :livro_id AND tipo = :tipo";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':quantidade', $carrinho->quantidade);
        $stmt->bindValue(':usuario_id', $carrinho->usuario_id);
        $stmt->bindValue(':livro_id', $carrinho->livro_id);
        $stmt->bindValue(':tipo', $carrinho->tipo, PDO::PARAM_STR);
        $result = $stmt->execute();
        $stmt->closeCursor();

        return $result;
    }

    public function remover(Carrinho $carrinho): bool 
    {
        $sql = "DELETE FROM carrinho WHERE usuario_id = :usuario_id AND livro_id = :livro_id AND tipo = :tipo";
        $stmt = $this->conn->prepare($sql);
        
        $stmt->bindValue(':usuario_id', $carrinho->usuario_id, PDO::PARAM_INT);
        $stmt->bindValue(':livro_id', $carrinho->livro_id, PDO::PARAM_INT);
        $stmt->bindValue(':tipo', $carrinho->tipo, PDO::PARAM_STR);
        $result = $stmt->execute();
        $stmt->closeCursor();

        return $result;
    }

    public function listarPorUsuario($usuarioId) 
    {
        $sql = "SELECT c.livro_id, c.quantidade, c.tipo, l.titulo, l.preco, l.imagem_url, l.autor 
                FROM carrinho c
                JOIN livros l ON c.livro_id = l.id
                WHERE c.usuario_id = :usuario_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        
        $itensCarrinho = [];
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($resultados as $row) {
            $item = new Carrinho($row); 
            $itensCarrinho[] = $item;
        }
        
        return $itensCarrinho; // Retorna um array de objetos Carrinho
    }

    public function limparCarrinho(int $usuarioId): bool
    {
        $sql = "DELETE FROM carrinho WHERE usuario_id = :usuario_id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindValue(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $result = $stmt->execute();
        $stmt->closeCursor();

        return $result;
    }
}
