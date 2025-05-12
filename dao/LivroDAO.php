<?php
class LivroDAO
{
    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function createBook($titulo, $autor, $genero_id, $preco, $editora, $descricao, $imagem_url)
    {
        $sql = "INSERT INTO livros (
                    titulo, autor, genero_id, preco, editora, descricao, imagem_url, created_at, updated_at
                ) VALUES (
                    :titulo, :autor, :genero_id, :preco, :editora, :descricao, :imagem_url, NOW(), NOW()
                )";

        $stmt = $this->conn->prepare($sql);

        $stmt->bindParam(':titulo', $titulo);
        $stmt->bindParam(':autor', $autor);
        $stmt->bindParam(':genero_id', $genero_id, PDO::PARAM_INT);
        $stmt->bindParam(':preco', $preco);
        $stmt->bindParam(':editora', $editora);
        $stmt->bindParam(':descricao', $descricao);
        $stmt->bindParam(':imagem_url', $imagem_url);
        return $stmt->execute();
    }

    public function getBookById($id){
        $sql = "SELECT 
                    livros.*, 
                    generos.nome AS genero_nome 
                FROM livros
                INNER JOIN generos ON livros.genero_id = generos.id
                WHERE livros.id = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function searchBooks($termo = null, $genero_id = null, $ordem = 'DESC')
    {
        $sql = "SELECT livros.*, generos.nome AS genero_nome FROM livros
                LEFT JOIN generos ON livros.genero_id = generos.id
                WHERE 1=1";
        $params = [];

        if (!empty($termo)) {
            $sql .= " AND (LOWER(livros.titulo) LIKE :termo OR LOWER(livros.autor) LIKE :termo)";
            $params[':termo'] = '%' . strtolower($termo) . '%';
        }

        if (!empty($genero_id)) {
            $sql .= " AND livros.genero_id = :genero_id";
            $params[':genero_id'] = $genero_id;
        }

        $ordem = strtoupper($ordem) === 'ASC' ? 'ASC' : 'DESC';
        $sql .= " ORDER BY livros.created_at $ordem";

        $stmt = $this->conn->prepare($sql);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
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

    public function updateBook($id, $titulo, $autor, $genero_id, $preco, $editora, $descricao, $imagem_url)
    {
        $sql = "UPDATE livros 
                 SET titulo = :titulo, autor = :autor, genero_id = :genero_id, preco = :preco, 
                     editora = :editora, descricao = :descricao, imagem_url = :imagem_url, 
                     updated_at = NOW() 
                 WHERE id = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':titulo' => $titulo,
            ':autor' => $autor,
            ':genero_id' => $genero_id,
            ':preco' => $preco,
            ':editora' => $editora,
            ':descricao' => $descricao,
            ':imagem_url' => $imagem_url
        ]);
    }
}
