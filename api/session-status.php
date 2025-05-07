<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['isLoggedIn']) && $_SESSION['isLoggedIn'] === true) {
    echo json_encode([
        'status' => 'success',
        'isLoggedIn' => true,
        'isAdmin' => $_SESSION['isAdmin'] ?? false
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'isLoggedIn' => false,
        'message' => 'Usuário não está logado.'
    ]);
}