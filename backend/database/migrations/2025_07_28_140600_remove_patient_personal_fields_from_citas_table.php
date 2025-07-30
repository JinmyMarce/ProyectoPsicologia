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
        Schema::table('citas', function (Blueprint $table) {
            $table->dropColumn([
                'patient_dni',
                'patient_full_name',
                'patient_age',
                'patient_gender',
                'patient_address',
                'patient_study_program',
                'patient_semester',
                'patient_phone',
                'patient_email',
                'emergency_contact_name',
                'emergency_contact_relationship',
                'emergency_contact_phone',
                'medical_history',
                'current_medications',
                'allergies',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->string('patient_dni', 8)->nullable();
            $table->string('patient_full_name')->nullable();
            $table->integer('patient_age')->nullable();
            $table->enum('patient_gender', ['masculino', 'femenino', 'otro'])->nullable();
            $table->text('patient_address')->nullable();
            $table->string('patient_study_program')->nullable();
            $table->string('patient_semester')->nullable();
            $table->string('patient_phone')->nullable();
            $table->string('patient_email')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_relationship')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->text('medical_history')->nullable();
            $table->text('current_medications')->nullable();
            $table->text('allergies')->nullable();
        });
    }
};
