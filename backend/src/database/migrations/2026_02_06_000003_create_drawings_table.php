<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drawings', function (Blueprint $table) {
            $table->id();
            $table->string('prompt');
            $table->enum('prompt_type', ['today', 'random']);
            $table->unsignedInteger('time_limit_seconds');
            $table->string('image_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drawings');
    }
};
