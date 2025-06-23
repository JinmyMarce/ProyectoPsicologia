<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'name' => 'María García López',
                'email' => 'maria.garcia@instituto.edu.pe',
                'password' => bcrypt('password123'),
                'role' => 'student',
                'dni' => '80000001',
                'active' => true,
            ],
            [
                'name' => 'Carlos Rodríguez Martínez',
                'email' => 'carlos.rodriguez@instituto.edu.pe',
                'password' => bcrypt('password123'),
                'role' => 'student',
                'dni' => '80000002',
                'active' => true,
            ],
            [
                'name' => 'Ana Fernández González',
                'email' => 'ana.fernandez@instituto.edu.pe',
                'password' => bcrypt('password123'),
                'role' => 'student',
                'dni' => '80000003',
                'active' => true,
            ],
            [
                'name' => 'Luis Pérez Sánchez',
                'email' => 'luis.perez@instituto.edu.pe',
                'password' => bcrypt('password123'),
                'role' => 'student',
                'dni' => '80000004',
                'active' => true,
            ],
            [
                'name' => 'Carmen Jiménez Ruiz',
                'email' => 'carmen.jimenez@instituto.edu.pe',
                'password' => bcrypt('password123'),
                'role' => 'student',
                'dni' => '80000005',
                'active' => true,
            ],
        ];

        foreach ($students as $student) {
            User::create($student);
        }

        $this->command->info('Estudiantes creados exitosamente!');
        $this->command->info('Credenciales de prueba:');
        foreach ($students as $student) {
            $this->command->info("Email: {$student['email']} | Contraseña: password123");
        }
    }
}
