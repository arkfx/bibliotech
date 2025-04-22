<?php
class LivroDAO
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function createBook($titulo, $autor, $genero, $preco, $editora, $descricao)
    {
        $sql = "INSERT INTO livros (titulo, autor, genero, preco, editora, descricao, created_at, updated_at)
                VALUES (:titulo, :autor, :genero, :preco, :editora, :descricao, NOW(), NOW())";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(':titulo', $titulo);
        $stmt->bindParam(':autor', $autor);
        $stmt->bindParam(':genero', $genero);
        $stmt->bindParam(':preco', $preco);
        $stmt->bindParam(':editora', $editora);
        $stmt->bindParam(':descricao', $descricao);

        return $stmt->execute();
    }

    public function getBookById($id)
    {
        $sql = "SELECT * FROM livros WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function searchBooks($termo = null, $genero = null)
    {
        $sql = "SELECT * FROM livros WHERE 1=1";
        $params = [];

        if (!empty($termo)) {
            $sql .= " AND (LOWER(titulo) LIKE :termo OR LOWER(autor) LIKE :termo)";
            $params[':termo'] = '%' . strtolower($termo) . '%';
        }

        if (!empty($genero)) {
            $sql .= " AND LOWER(genero) = :genero";
            $params[':genero'] = strtolower($genero);
        }

        $stmt = $this->conn->prepare($sql);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deleteBook($id)
    {
        $sql = "DELETE FROM livros WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            throw new Exception("Livro com ID $id não encontrado.");
        }

        return true;
    }


    public function updateBook($id, $titulo, $autor, $genero, $preco, $editora, $descricao)
    {
        $sql = "UPDATE livros SET titulo = :titulo, autor = :autor, genero = :genero, preco = :preco, editora = :editora, descricao = :descricao WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':titulo' => $titulo,
            ':autor' => $autor,
            ':genero' => $genero,
            ':preco' => $preco,
            ':editora' => $editora,
            ':descricao' => $descricao
        ]);
    }
}
