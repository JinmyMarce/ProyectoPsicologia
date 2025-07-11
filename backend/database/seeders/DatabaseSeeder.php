<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Ejecutar seeders en orden
        $this->call([
            SuperAdminSeeder::class,
            PsychologistSeeder::class,
            StudentSeeder::class,
            CitaSeeder::class,
            PsychologicalSessionSeeder::class,
            TestDataSeeder::class, // Agregado para datos de prueba
        ]);
    }
}
