<?php

require_once __DIR__ . '/BaseRepository.php';
require_once __DIR__ . '/../models/ReadingProgress.php';

class ReadingProgressRepository extends BaseRepository
{
    public function saveProgress(ReadingProgress $progress): bool
    {
        try {
            $sql = "INSERT INTO reading_progress 
                    (usuario_id, livro_id, current_page, total_pages, progress_percentage, last_read_at) 
                    VALUES (:usuario_id, :livro_id, :current_page, :total_pages, :progress_percentage, CURRENT_TIMESTAMP)
                    ON CONFLICT (usuario_id, livro_id) 
                    DO UPDATE SET 
                        current_page = EXCLUDED.current_page,
                        total_pages = EXCLUDED.total_pages,
                        progress_percentage = EXCLUDED.progress_percentage,
                        last_read_at = CURRENT_TIMESTAMP,
                        updated_at = CURRENT_TIMESTAMP";

            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([
                ':usuario_id' => $progress->usuario_id,
                ':livro_id' => $progress->livro_id,
                ':current_page' => $progress->current_page,
                ':total_pages' => $progress->total_pages,
                ':progress_percentage' => $progress->progress_percentage
            ]);
        } catch (PDOException $e) {
            error_log("Erro ao salvar progresso de leitura: " . $e->getMessage());
            return false;
        }
    }

    public function getProgress(int $usuarioId, int $livroId): ?ReadingProgress
    {
        try {
            $sql = "SELECT * FROM reading_progress WHERE usuario_id = :usuario_id AND livro_id = :livro_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':usuario_id' => $usuarioId,
                ':livro_id' => $livroId
            ]);

            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            return $data ? new ReadingProgress($data) : null;
        } catch (PDOException $e) {
            error_log("Erro ao buscar progresso de leitura: " . $e->getMessage());
            return null;
        }
    }

    public function getBooksInProgress(int $usuarioId): array
    {
        try {
            $sql = "SELECT rp.*, l.titulo, l.autor, l.imagem_url, l.genero_id, g.nome as nome_genero, b.data_adquirido
                    FROM reading_progress rp
                    INNER JOIN livros l ON rp.livro_id = l.id
                    INNER JOIN biblioteca b ON b.livro_id = l.id AND b.usuario_id = rp.usuario_id
                    LEFT JOIN generos g ON l.genero_id = g.id
                    WHERE rp.usuario_id = :usuario_id 
                    AND rp.progress_percentage > 0 
                    AND rp.progress_percentage < 100
                    ORDER BY rp.last_read_at DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':usuario_id' => $usuarioId]);

            $results = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $results[] = $row;
            }

            return $results;
        } catch (PDOException $e) {
            error_log("Erro ao buscar livros em progresso: " . $e->getMessage());
            return [];
        }
    }

    public function getRecentlyReadBooks(int $usuarioId, int $limit = 5): array
    {
        try {
            $sql = "SELECT rp.*, l.titulo, l.autor, l.imagem_url, l.genero_id, g.nome as nome_genero, b.data_adquirido
                    FROM reading_progress rp
                    INNER JOIN livros l ON rp.livro_id = l.id
                    INNER JOIN biblioteca b ON b.livro_id = l.id AND b.usuario_id = rp.usuario_id
                    LEFT JOIN generos g ON l.genero_id = g.id
                    WHERE rp.usuario_id = :usuario_id 
                    AND rp.progress_percentage > 0
                    ORDER BY rp.last_read_at DESC
                    LIMIT :limit";

            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            $results = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $results[] = $row;
            }

            return $results;
        } catch (PDOException $e) {
            error_log("Erro ao buscar livros lidos recentemente: " . $e->getMessage());
            return [];
        }
    }

    public function deleteProgress(int $usuarioId, int $livroId): bool
    {
        try {
            $sql = "DELETE FROM reading_progress WHERE usuario_id = :usuario_id AND livro_id = :livro_id";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([
                ':usuario_id' => $usuarioId,
                ':livro_id' => $livroId
            ]);
        } catch (PDOException $e) {
            error_log("Erro ao deletar progresso de leitura: " . $e->getMessage());
            return false;
        }
    }
} 