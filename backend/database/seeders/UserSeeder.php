<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear super administrador
        User::create([
            'name' => 'Super Administrador',
            'email' => 'admin@istta.edu.pe',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'verified' => true,
            'avatar' => 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);

        // Crear psicólogos
        User::create([
            'name' => 'Dr. Ana García',
            'email' => 'ana.garcia@gmail.com',
            'password' => Hash::make('psicologo123'),
            'role' => 'psychologist',
            'verified' => true,
            'specialization' => 'Psicología Clínica',
            'rating' => 4.8,
            'total_appointments' => 150,
            'avatar' => 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);

        User::create([
            'name' => 'Dr. Miguel Torres',
            'email' => 'miguel.torres@gmail.com',
            'password' => Hash::make('psicologo123'),
            'role' => 'psychologist',
            'verified' => true,
            'specialization' => 'Psicología Educativa',
            'rating' => 4.6,
            'total_appointments' => 120,
            'avatar' => 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);

        User::create([
            'name' => 'Dra. Laura Sánchez',
            'email' => 'laura.sanchez@gmail.com',
            'password' => Hash::make('psicologo123'),
            'role' => 'psychologist',
            'verified' => true,
            'specialization' => 'Psicología Organizacional',
            'rating' => 4.9,
            'total_appointments' => 200,
            'avatar' => 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);

        // Crear estudiantes
        User::create([
            'name' => 'Carlos Rodriguez',
            'email' => 'carlos.rodriguez@istta.edu.pe',
            'password' => Hash::make('estudiante123'),
            'role' => 'student',
            'verified' => true,
            'student_id' => '2024001',
            'career' => 'Ingeniería de Sistemas',
            'semester' => 6,
            'avatar' => 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);

        User::create([
            'name' => 'María López',
            'email' => 'maria.lopez@istta.edu.pe',
            'password' => Hash::make('estudiante123'),
            'role' => 'student',
            'verified' => true,
            'student_id' => '2024002',
            'career' => 'Administración',
            'semester' => 4,
            'avatar' => 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);

        User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan.perez@istta.edu.pe',
            'password' => Hash::make('estudiante123'),
            'role' => 'student',
            'verified' => true,
            'student_id' => '2024003',
            'career' => 'Contabilidad',
            'semester' => 8,
            'avatar' => 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);

        User::create([
            'name' => 'Ana Martínez',
            'email' => 'ana.martinez@istta.edu.pe',
            'password' => Hash::make('estudiante123'),
            'role' => 'student',
            'verified' => true,
            'student_id' => '2024004',
            'career' => 'Psicología',
            'semester' => 5,
            'avatar' => 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);

        User::create([
            'name' => 'Luis González',
            'email' => 'luis.gonzalez@istta.edu.pe',
            'password' => Hash::make('estudiante123'),
            'role' => 'student',
            'verified' => true,
            'student_id' => '2024005',
            'career' => 'Medicina',
            'semester' => 3,
            'avatar' => 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400'
        ]);
    }
}
