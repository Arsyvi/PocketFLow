<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\PocketController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

//Route Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


Route::middleware('auth:sanctum')->group(function(){
// Route Logout
Route::post('/logout', [AuthController::class, 'logout']);

Route::put('/profile', [AuthController::class, 'updateProfile']);
Route::put('/profile/password', [AuthController::class, 'changePassword']);

//Route Goals
Route::apiResource('goals', GoalController::class);
Route::post('goals/{goal}/add-money', [GoalController::class, 'editAmountGoal']);
Route::get('goals/{goal}/contributions', [GoalController::class, 'contributions']);

// Route Pockets
Route::apiResource('pockets', PocketController::class);

// Route Transactions (pemasukan & pengeluaran)
Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'show', 'destroy']);
});
