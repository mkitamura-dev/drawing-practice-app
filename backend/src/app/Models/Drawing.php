<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Drawing extends Model
{
    protected $fillable = [
        'prompt',
        'prompt_type',
        'time_limit_seconds',
        'image_path',
    ];
}
