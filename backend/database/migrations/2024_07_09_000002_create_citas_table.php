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
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('psychologist_id');
            $table->date('fecha');
            $table->time('hora');
            $table->integer('duracion')->default(60); // duración en minutos
            $table->text('motivo_consulta');
            $table->enum('estado', ['pendiente', 'confirmada', 'cancelada', 'completada'])->default('pendiente');
            $table->text('notas')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('psychologist_id')->references('id')->on('users')->onDelete('cascade');

            // Índices
            $table->index(['psychologist_id', 'fecha', 'hora']);
            $table->index(['student_id', 'fecha']);
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
