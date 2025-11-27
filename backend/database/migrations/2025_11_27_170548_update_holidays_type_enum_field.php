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
        // En MySQL, necesitamos modificar la columna ENUM
        DB::statement("ALTER TABLE holidays MODIFY COLUMN type ENUM('fijo', 'movil', 'Cívico', 'Religioso', 'Sector Público') DEFAULT 'fijo'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir a los valores originales
        DB::statement("ALTER TABLE holidays MODIFY COLUMN type ENUM('fijo', 'movil') DEFAULT 'fijo'");
    }
};
