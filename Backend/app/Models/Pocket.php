<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pocket extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'icon',
        'color',
        'balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2'
    ];
}
