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
        // Primero cambiar la columna role para incluir tutor
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'psychologist', 'student', 'super_admin', 'tutor') DEFAULT 'student'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar usuarios con rol tutor antes de revertir
        DB::table('users')->where('role', 'tutor')->delete();
        
        // Revertir la columna role
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'psychologist', 'student', 'super_admin') DEFAULT 'student'");
    }
};