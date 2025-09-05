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
        Schema::create('group_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade')->comment('ID del tutor que organiza la sesión');
            $table->string('classroom')->comment('Aula donde se realizará la sesión');
            $table->date('date')->comment('Fecha de la sesión');
            $table->time('start_time')->default('01:00:00')->comment('Hora de inicio (1:00 AM)');
            $table->time('end_time')->default('02:00:00')->comment('Hora de fin (2:00 AM)');
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])->comment('Día de la semana');
            $table->string('topic')->comment('Tema de la sesión');
            $table->integer('max_students')->default(30)->comment('Máximo número de estudiantes');
            $table->json('registered_students')->default('[]')->comment('IDs de estudiantes registrados');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled')->comment('Estado de la sesión');
            $table->text('notes')->nullable()->comment('Notas adicionales sobre la sesión');
            $table->text('session_summary')->nullable()->comment('Resumen de la sesión completada');
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['tutor_id', 'status']);
            $table->index(['date', 'status']);
            $table->index(['day_of_week', 'status']);
            $table->unique(['tutor_id', 'date', 'start_time'], 'unique_tutor_session');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_sessions');
    }
};































