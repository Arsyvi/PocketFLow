<?php

use App\Http\Controllers\GoalController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
