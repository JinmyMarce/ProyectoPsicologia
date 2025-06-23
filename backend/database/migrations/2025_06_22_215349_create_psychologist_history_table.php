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
        Schema::create('psychologist_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('original_user_id')->nullable();
            $table->string('name');
            $table->string('email');
            $table->string('role')->default('psychologist');
            $table->string('specialization')->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('total_appointments')->default(0);
            $table->string('avatar')->nullable();
            $table->string('google_id')->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamp('deactivated_at');
            $table->string('deactivated_by')->nullable(); // Email del super admin que lo desactivó
            $table->text('deactivation_reason')->nullable();
            $table->timestamps();
            
            $table->index('original_user_id');
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psychologist_history');
    }
};
