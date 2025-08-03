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
            // Emergency contact fields
            $table->string('emergency_name')->nullable()->after('address');
            $table->string('emergency_phone')->nullable()->after('emergency_name');
            $table->string('emergency_relationship')->nullable()->after('emergency_phone');
            
            // Medical information fields
            $table->text('allergies')->nullable()->after('emergency_relationship');
            $table->text('current_medications')->nullable()->after('allergies');
            $table->text('medical_conditions')->nullable()->after('current_medications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'emergency_name',
                'emergency_phone', 
                'emergency_relationship',
                'allergies',
                'current_medications',
                'medical_conditions'
            ]);
        });
    }
};
