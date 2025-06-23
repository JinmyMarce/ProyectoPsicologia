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
        Schema::create('psychological_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('psychologist_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('fecha_sesion');
            $table->text('temas_tratados')->nullable();
            $table->text('notas')->nullable();
            $table->enum('estado', ['Programada', 'Realizada', 'Cancelada'])->default('Programada');
            $table->integer('duracion_minutos')->nullable();
            $table->string('tipo_sesion')->nullable();
            $table->text('objetivos')->nullable();
            $table->text('conclusiones')->nullable();
            $table->timestamps();

            // Índices
            $table->index(['patient_id', 'fecha_sesion']);
            $table->index(['psychologist_id', 'fecha_sesion']);
            $table->index('estado');
            $table->index('fecha_sesion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psychological_sessions');
    }
};
