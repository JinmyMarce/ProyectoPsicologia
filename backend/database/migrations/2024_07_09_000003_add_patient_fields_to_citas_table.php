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
            // Datos personales del paciente
            $table->string('patient_dni', 8)->nullable()->after('notas');
            $table->string('patient_full_name')->nullable()->after('patient_dni');
            $table->integer('patient_age')->nullable()->after('patient_full_name');
            $table->enum('patient_gender', ['masculino', 'femenino', 'otro'])->nullable()->after('patient_age');
            $table->text('patient_address')->nullable()->after('patient_gender');
            
            // Datos de contacto del paciente
            $table->string('patient_phone')->nullable()->after('patient_address');
            $table->string('patient_email')->nullable()->after('patient_phone');
            
            // Contacto de emergencia
            $table->string('emergency_contact_name')->nullable()->after('patient_email');
            $table->string('emergency_contact_relationship')->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_relationship');
            
            // Información médica
            $table->text('medical_history')->nullable()->after('emergency_contact_phone');
            $table->text('current_medications')->nullable()->after('medical_history');
            $table->text('allergies')->nullable()->after('current_medications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->dropColumn([
                'patient_dni',
                'patient_full_name',
                'patient_age',
                'patient_gender',
                'patient_address',
                'patient_phone',
                'patient_email',
                'emergency_contact_name',
                'emergency_contact_relationship',
                'emergency_contact_phone',
                'medical_history',
                'current_medications',
                'allergies'
            ]);
        });
    }
}; 