<?php
class CarrinhoDAO
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
        $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, true);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function addItem($livroId, $userId, $quantidade)
    {
        $query = "SELECT quantidade FROM carrinho WHERE usuario_id = :userId AND livro_id = :livroId";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':livroId', $livroId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();

        if ($row) {
            $newQuantidade = $row['quantidade'] + $quantidade;
            $updateQuery = "UPDATE carrinho SET quantidade = :quantidade WHERE usuario_id = :userId AND livro_id = :livroId";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':quantidade', $newQuantidade, PDO::PARAM_INT);
            $updateStmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $updateStmt->bindParam(':livroId', $livroId, PDO::PARAM_INT);
            $result = $updateStmt->execute();
            $updateStmt->closeCursor();
            return $result;
        } else {
            $insertQuery = "INSERT INTO carrinho (usuario_id, livro_id, quantidade) VALUES (:userId, :livroId, :quantidade)";
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $insertStmt->bindParam(':livroId', $livroId, PDO::PARAM_INT);
            $insertStmt->bindParam(':quantidade', $quantidade, PDO::PARAM_INT);
            $result = $insertStmt->execute();
            $insertStmt->closeCursor();
            return $result;
        }
    }

    public function getCarrinhoPorUsuario($userId)
    {
        $query = "SELECT c.livro_id, l.titulo, l.imagem_url, l.autor, c.quantidade, l.preco 
              FROM carrinho c
              JOIN livros l ON c.livro_id = l.id
              WHERE c.usuario_id = :userId";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        return $result;
    }

    public function removeItem($livroId, $userId)
    {
        $query = "DELETE FROM carrinho WHERE usuario_id = :userId AND livro_id = :livroId";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':livroId', $livroId, PDO::PARAM_INT);
        $result = $stmt->execute();
        $stmt->closeCursor();
        return $result;
    }

    public function atualizarQuantidade($livroId, $userId, $quantidade)
    {
        $query = "UPDATE carrinho SET quantidade = :quantidade WHERE usuario_id = :userId AND livro_id = :livroId";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':quantidade', $quantidade, PDO::PARAM_INT);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':livroId', $livroId, PDO::PARAM_INT);
        $result = $stmt->execute();
        $stmt->closeCursor();
        return $result;
    }
}
