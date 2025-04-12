<?php
require_once __DIR__ . '/../core/load_env.php';
loadEnv(__DIR__ . '/../.env');

return [
    'database' => [
        'host' => getenv('DB_HOST'),
        'port' => getenv('DB_PORT'),
        'dbname' => getenv('DB_NAME'),
        'user' => getenv('DB_USER'),
        'password' => getenv('DB_PASSWORD')
    ]
];
