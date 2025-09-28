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
        Schema::create('derivations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade')->comment('ID del estudiante derivado');
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade')->comment('ID del tutor que realiza la derivación');
            $table->foreignId('psychologist_id')->nullable()->constrained('users')->onDelete('set null')->comment('ID del psicólogo asignado');
            $table->text('reason')->comment('Motivo de la derivación');
            $table->enum('urgency', ['low', 'medium', 'high', 'critical'])->default('medium')->comment('Nivel de urgencia');
            $table->enum('status', ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])->default('pending')->comment('Estado de la derivación');
            $table->text('notes')->nullable()->comment('Notas adicionales');
            $table->text('psychologist_notes')->nullable()->comment('Notas del psicólogo');
            $table->timestamp('assigned_at')->nullable()->comment('Fecha de asignación');
            $table->timestamp('started_at')->nullable()->comment('Fecha de inicio del tratamiento');
            $table->timestamp('completed_at')->nullable()->comment('Fecha de finalización');
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['tutor_id', 'status']);
            $table->index(['psychologist_id', 'status']);
            $table->index(['student_id']);
            $table->index(['urgency', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('derivations');
    }
};




































