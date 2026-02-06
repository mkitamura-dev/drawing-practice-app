<?php

use App\Http\Controllers\DrawingController;
use Illuminate\Support\Facades\Route;

Route::get('/drawings', [DrawingController::class, 'index']);
Route::post('/drawings', [DrawingController::class, 'store']);
Route::get('/drawings/{drawing}/image', [DrawingController::class, 'image']);
