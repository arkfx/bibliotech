<?php

use BiblioTech\Core\load_env;
// Carrega as variáveis de ambiente do arquivo .env

load_env(__DIR__ . '/../.env');
// Retorna a configuração do banco de dados


return [
    'database' => [
        'host' => getenv('DB_HOST'),
        'port' => getenv('DB_PORT'),
        'dbname' => getenv('DB_NAME'),
        'user' => getenv('DB_USER'),
        'password' => getenv('DB_PASSWORD')
    ]
];
