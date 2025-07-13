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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('users')->onDelete('cascade');
            $table->string('subject');
            $table->text('content');
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->json('attachments')->nullable(); // Para archivos adjuntos
            $table->enum('type', ['general', 'appointment', 'session', 'system'])->default('general');
            $table->unsignedBigInteger('related_id')->nullable(); // ID de cita o sesión relacionada
            $table->string('related_type')->nullable(); // Tipo de relación (cita, sesion, etc.)
            $table->timestamps();

            // Índices para mejorar el rendimiento
            $table->index(['recipient_id', 'read']);
            $table->index(['sender_id', 'created_at']);
            $table->index(['recipient_id', 'created_at']);
            $table->index(['type', 'related_id']);
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
}; 