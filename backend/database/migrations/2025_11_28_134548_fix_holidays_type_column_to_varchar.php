<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Cambiar la columna type de ENUM a VARCHAR para permitir valores con acentos y más flexibilidad
        DB::statement("ALTER TABLE holidays MODIFY COLUMN type VARCHAR(50) DEFAULT 'fijo'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir a ENUM con los valores permitidos
        DB::statement("ALTER TABLE holidays MODIFY COLUMN type ENUM('fijo', 'movil', 'Cívico', 'Religioso', 'Sector Público') DEFAULT 'fijo'");
    }
};
