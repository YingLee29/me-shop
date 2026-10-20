<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Cho phép Next.js frontend (port 5000) và admin (port 5002) gọi API.
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5000',   // Next.js Frontend
        'http://localhost:5002',   // Next.js Admin
        env('FRONTEND_URL', 'http://localhost:5000'),
        env('ADMIN_URL', 'http://localhost:5002'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
