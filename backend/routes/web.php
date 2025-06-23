<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Ruta de callback para Google OAuth
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
