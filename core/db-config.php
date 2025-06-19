<?php

use function BiblioTech\Core\loadEnv;

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
