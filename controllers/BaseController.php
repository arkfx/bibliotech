<?php

namespace BiblioTech\Controllers;

abstract class BaseController
{
    protected function response(int $status, array $data): void
    {
        header('Content-Type: application/json');
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    protected function getJsonInput(): array
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    protected function isAdmin(): bool
    {
        return isset($_SESSION['isLoggedIn'], $_SESSION['isAdmin']) && $_SESSION['isLoggedIn'] && $_SESSION['isAdmin'];
    }

    protected function isAuthenticated(): bool
    {
        return isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true;
    }
}
