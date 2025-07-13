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

        // Superadministrador
        \App\Models\User::updateOrCreate(
            ['email' => 'marcelojinmy2024@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'role' => 'super_admin',
                'active' => 1,
                'verified' => 1
            ]
        );

        // Psicólogo
        \App\Models\User::updateOrCreate(
            ['email' => 'psicologo.demo@gmail.com'],
            [
                'name' => 'Psicólogo Demo',
                'password' => bcrypt('password'),
                'role' => 'psychologist',
                'specialization' => 'Clínica',
                'active' => 1,
                'verified' => 1
            ]
        );

        // Administrador
        \App\Models\User::updateOrCreate(
            ['email' => 'admin.demo@gmail.com'],
            [
                'name' => 'Admin Demo',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'active' => 1,
                'verified' => 1
            ]
        );

        // Estudiante
        \App\Models\User::updateOrCreate(
            ['email' => 'estudiante@istta.edu.pe'],
            [
                'name' => 'Estudiante Demo',
                'password' => bcrypt('password'),
                'role' => 'student',
                'active' => 1,
                'verified' => 1
            ]
        );

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
