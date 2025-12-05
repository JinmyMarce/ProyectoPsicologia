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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name')->nullable();
            $table->string('user_email')->nullable();
            $table->string('action'); // create, update, delete, login, view, etc.
            $table->string('resource_type'); // User, Cita, Appointment, etc.
            $table->unsignedBigInteger('resource_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('details')->nullable(); // JSON o texto con detalles adicionales
            $table->json('old_values')->nullable(); // Valores anteriores (para updates)
            $table->json('new_values')->nullable(); // Valores nuevos (para updates)
            $table->string('status')->default('success'); // success, failed, warning
            $table->timestamps();
            
            // Índices para mejorar el rendimiento de las consultas
            $table->index('user_id');
            $table->index('action');
            $table->index('resource_type');
            $table->index('resource_id');
            $table->index('created_at');
            $table->index(['resource_type', 'resource_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
