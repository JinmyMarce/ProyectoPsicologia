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
        Schema::table('users', function (Blueprint $table) {
            // Verificar si las columnas no existen antes de agregarlas
            if (!Schema::hasColumn('users', 'classroom')) {
                $table->string('classroom')->nullable()->comment('Aula o salón asignado al tutor');
            }
            if (!Schema::hasColumn('users', 'study_program')) {
                $table->string('study_program')->nullable()->comment('Programa de estudios del tutor');
            }
            if (!Schema::hasColumn('users', 'course')) {
                $table->string('course')->nullable()->comment('Curso o materia que enseña el tutor');
            }
            if (!Schema::hasColumn('users', 'total_students')) {
                $table->integer('total_students')->nullable()->default(0)->comment('Total de estudiantes a cargo del tutor');
            }
            if (!Schema::hasColumn('users', 'active_derivations')) {
                $table->integer('active_derivations')->nullable()->default(0)->comment('Derivaciones activas del tutor');
            }
        });

        // Modificar la columna semester existente para que sea compatible con tutores
        // Cambiar de integer a string para permitir tanto números como texto
        DB::statement('ALTER TABLE users MODIFY COLUMN semester VARCHAR(255) NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Solo eliminar las columnas que agregamos en esta migración
            $columnsToDrop = [];
            
            if (Schema::hasColumn('users', 'classroom')) {
                $columnsToDrop[] = 'classroom';
            }
            if (Schema::hasColumn('users', 'study_program')) {
                $columnsToDrop[] = 'study_program';
            }
            if (Schema::hasColumn('users', 'course')) {
                $columnsToDrop[] = 'course';
            }
            if (Schema::hasColumn('users', 'total_students')) {
                $columnsToDrop[] = 'total_students';
            }
            if (Schema::hasColumn('users', 'active_derivations')) {
                $columnsToDrop[] = 'active_derivations';
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        // Revertir la columna semester a integer
        DB::statement('ALTER TABLE users MODIFY COLUMN semester INT NULL');
    }
};