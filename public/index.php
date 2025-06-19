<?php

// 1. Carrega a inicialização da aplicação (autoloader, .env, sessão, etc.)
require_once __DIR__ . '/../bootstrap.php';

// 2. Instancia o roteador
$router = new \Bramus\Router\Router();

// Define o namespace base para os controllers para simplificar as chamadas
$router->setNamespace('\BiblioTech\Controllers');

// Middleware para proteger rotas que exigem login
$router->before('GET|POST|PUT|DELETE', '/api/.*|/admin.*', function() {
    if (!isset($_SESSION['user_id'])) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['message' => 'Acesso não autorizado. Por favor, faça o login.']);
        exit();
    }
});

// Middleware específico para rotas de administrador
$router->before('GET|POST|PUT|DELETE', '/admin.*', function() {
    if (!isset($_SESSION['is_admin']) || !$_SESSION['is_admin']) {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode(['message' => 'Acesso negado. Requer privilégios de administrador.']);
        exit();
    }
});


// --- ROTAS DE PÁGINAS (VIEWS) ---
$router->get('/', 'HomeController@index');
$router->get('/login', 'AuthController@showLoginForm');
$router->get('/admin', 'AdminController@index');


// --- ROTAS DE AUTENTICAÇÃO ---
$router->post('/login', 'AuthController@login');
$router->get('/logout', 'AuthController@logout');


// --- ROTAS DA API (JSON) ---

// API: Editoras
$router->get('/api/editoras', 'EditoraController@index');
$router->post('/api/editoras', 'EditoraController@store');
$router->put('/api/editoras/(\d+)', 'EditoraController@update');
$router->delete('/api/editoras/(\d+)', 'EditoraController@destroy');

// API: Gêneros
$router->get('/api/generos', 'GeneroController@index');
$router->post('/api/generos', 'GeneroController@store');
$router->put('/api/generos/(\d+)', 'GeneroController@update');
$router->delete('/api/generos/(\d+)', 'GeneroController@destroy');

// Adicione aqui outras rotas de API conforme necessário


// Rota para 404 - Página não encontrada
$router->set404(function() {
    header('HTTP/1.1 404 Not Found');
    // Você pode renderizar uma view de 404 aqui se desejar
    echo json_encode(['message' => 'Endpoint não encontrado.']);
});

// 3. Executa o roteador