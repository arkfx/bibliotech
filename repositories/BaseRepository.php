<?php

abstract class BaseRepository
{
    protected PDO $conn;

    public function __construct(PDO $conn)
    {
        $this->conn = $conn;
    }
}
