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
            $table->enum('role', ['admin', 'psychologist', 'student', 'super_admin'])->default('student')->after('email');
            $table->string('google_id')->nullable()->after('role');
            $table->string('avatar')->nullable()->after('google_id');
            $table->boolean('verified')->default(false)->after('avatar');
            $table->string('student_id')->nullable()->after('verified'); // Para estudiantes
            $table->string('career')->nullable()->after('student_id'); // Para estudiantes
            $table->integer('semester')->nullable()->after('career'); // Para estudiantes
            $table->string('specialization')->nullable()->after('semester'); // Para psicólogos
            $table->decimal('rating', 3, 2)->default(0.00)->after('specialization'); // Para psicólogos
            $table->integer('total_appointments')->default(0)->after('rating'); // Para psicólogos
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'google_id',
                'avatar',
                'verified',
                'student_id',
                'career',
                'semester',
                'specialization',
                'rating',
                'total_appointments'
            ]);
        });
    }
};
