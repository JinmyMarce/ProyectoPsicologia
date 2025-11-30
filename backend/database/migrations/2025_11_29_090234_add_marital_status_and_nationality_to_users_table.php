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
        Schema::table('users', function (Blueprint $table) {
            // Verificar si las columnas no existen antes de agregarlas
            if (!Schema::hasColumn('users', 'marital_status')) {
                $table->string('marital_status', 50)->nullable()->after('gender')->comment('Estado civil del usuario');
            }
            if (!Schema::hasColumn('users', 'nationality')) {
                $table->string('nationality', 100)->nullable()->after('marital_status')->comment('Nacionalidad del usuario');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'marital_status')) {
                $table->dropColumn('marital_status');
            }
            if (Schema::hasColumn('users', 'nationality')) {
                $table->dropColumn('nationality');
            }
        });
    }
};
