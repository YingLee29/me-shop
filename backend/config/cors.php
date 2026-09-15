<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Cho phép Next.js frontend (port 3000) và admin (port 3001) gọi API.
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',   // Next.js Frontend
        'http://localhost:3001',   // Next.js Admin
        env('FRONTEND_URL', 'http://localhost:3000'),
        env('ADMIN_URL', 'http://localhost:3001'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
