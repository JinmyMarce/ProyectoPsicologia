<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blocked_schedules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('psychologist_id');
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('is_full_day_blocked')->default(false);
            $table->text('reason'); // Cambiado a text para motivos más largos
            $table->integer('affected_appointments')->default(0);
            $table->timestamps();
            
            // Índices
            $table->foreign('psychologist_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['psychologist_id', 'date']);
            $table->index(['date', 'is_full_day_blocked']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blocked_schedules');
    }
};
