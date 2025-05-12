<?php
class CarrinhoDAO
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function addItem($livroId, $userId, $quantidade)
    {
        //Verifica se o item já existe no carrinho
        $query = "SELECT quantidade FROM carrinho WHERE usuario_id = :userId AND livro_id = :livroId";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':livroId', $livroId, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Item existe, atualiza a quantidade
            $newQuantidade = $row['quantidade'] + $quantidade;
            $updateQuery = "UPDATE carrinho SET quantidade = :quantidade WHERE usuario_id = :userId AND livro_id = :livroId";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':quantidade', $newQuantidade, PDO::PARAM_INT);
            $updateStmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $updateStmt->bindParam(':livroId', $livroId, PDO::PARAM_INT);
            return $updateStmt->execute();
        } else {
            // Item não existe, insere nova linha
            $insertQuery = "INSERT INTO carrinho (usuario_id, livro_id, quantidade) VALUES (:userId, :livroId, :quantidade)";
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->bindParam(':userId', $userId, PDO::PARAM_INT);
            $insertStmt->bindParam(':livroId', $livroId, PDO::PARAM_INT);
            $insertStmt->bindParam(':quantidade', $quantidade, PDO::PARAM_INT);
            return $insertStmt->execute();
        }
    }
}