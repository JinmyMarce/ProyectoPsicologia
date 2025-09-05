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
            // Campos específicos para tutores
            $table->string('classroom')->nullable()->comment('Aula o salón asignado al tutor');
            $table->string('study_program')->nullable()->comment('Programa de estudios del tutor');
            // $table->string('semester')->nullable()->comment('Semestre que enseña el tutor'); // Ya se agrega en otra migración
            $table->string('course')->nullable()->comment('Curso o materia que enseña el tutor');
            $table->integer('total_students')->nullable()->default(0)->comment('Total de estudiantes a cargo del tutor');
            $table->integer('active_derivations')->nullable()->default(0)->comment('Derivaciones activas del tutor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'classroom',
                'study_program',
                // 'semester', // Ya se maneja en otra migración
                'course',
                'total_students',
                'active_derivations'
            ]);
        });
    }
};
