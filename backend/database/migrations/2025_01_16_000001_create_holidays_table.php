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
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre del feriado
            $table->date('date'); // Fecha del feriado
            $table->enum('type', ['fijo', 'movil'])->default('fijo'); // Tipo: fijo o móvil
            $table->text('description')->nullable(); // Descripción del feriado
            $table->boolean('is_national')->default(true); // Si es feriado nacional
            $table->boolean('is_regional')->default(false); // Si es feriado regional
            $table->string('region')->nullable(); // Región específica si aplica
            $table->boolean('is_active')->default(true); // Si está activo
            $table->year('year'); // Año del feriado
            $table->timestamps();

            // Índices para optimizar consultas
            $table->index(['date', 'is_active']);
            $table->index(['year', 'is_active']);
            $table->index(['is_national', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('holidays');
    }
};




