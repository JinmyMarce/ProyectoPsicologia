<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Cita;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear psicólogos de prueba
        $psychologists = [
            [
                'name' => 'Dr. Ana García',
                'email' => 'ana.garcia@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'psychologist',
                'specialization' => 'Psicología Clínica',
                'rating' => 4.8,
                'total_appointments' => 45,
                'verified' => true,
                'active' => true,
            ],
            [
                'name' => 'Dr. Carlos Mendoza',
                'email' => 'carlos.mendoza@hotmail.com',
                'password' => Hash::make('password123'),
                'role' => 'psychologist',
                'specialization' => 'Psicología Educativa',
                'rating' => 4.6,
                'total_appointments' => 32,
                'verified' => true,
                'active' => true,
            ],
            [
                'name' => 'Dra. María López',
                'email' => 'maria.lopez@outlook.com',
                'password' => Hash::make('password123'),
                'role' => 'psychologist',
                'specialization' => 'Psicología Organizacional',
                'rating' => 4.9,
                'total_appointments' => 28,
                'verified' => true,
                'active' => true,
            ],
        ];

        foreach ($psychologists as $psychologist) {
            User::create($psychologist);
        }

        // Crear estudiantes de prueba
        $students = [
            [
                'name' => 'Juan Pérez',
                'email' => 'juan.perez@istta.edu.pe',
                'password' => Hash::make('password123'),
                'role' => 'student',
                'student_id' => '2024001',
                'career' => 'Ingeniería de Sistemas',
                'semester' => 6,
                'verified' => true,
                'active' => true,
            ],
            [
                'name' => 'María Rodríguez',
                'email' => 'maria.rodriguez@istta.edu.pe',
                'password' => Hash::make('password123'),
                'role' => 'student',
                'student_id' => '2024002',
                'career' => 'Administración',
                'semester' => 4,
                'verified' => true,
                'active' => true,
            ],
            [
                'name' => 'Luis Torres',
                'email' => 'luis.torres@istta.edu.pe',
                'password' => Hash::make('password123'),
                'role' => 'student',
                'student_id' => '2024003',
                'career' => 'Contabilidad',
                'semester' => 8,
                'verified' => true,
                'active' => true,
            ],
        ];

        foreach ($students as $student) {
            User::create($student);
        }

        // Crear citas de prueba
        $psychologist1 = User::where('email', 'ana.garcia@gmail.com')->first();
        $psychologist2 = User::where('email', 'carlos.mendoza@hotmail.com')->first();
        $student1 = User::where('email', 'juan.perez@istta.edu.pe')->first();
        $student2 = User::where('email', 'maria.rodriguez@istta.edu.pe')->first();

        if ($psychologist1 && $psychologist2 && $student1 && $student2) {
            $citas = [
                [
                    'student_id' => $student1->id,
                    'psychologist_id' => $psychologist1->id,
                    'fecha' => now()->addDays(2)->format('Y-m-d'),
                    'hora' => '10:00:00',
                    'duracion' => 60,
                    'motivo_consulta' => 'Problemas de ansiedad académica',
                    'estado' => 'confirmada',
                ],
                [
                    'student_id' => $student2->id,
                    'psychologist_id' => $psychologist2->id,
                    'fecha' => now()->addDays(3)->format('Y-m-d'),
                    'hora' => '14:30:00',
                    'duracion' => 60,
                    'motivo_consulta' => 'Orientación vocacional',
                    'estado' => 'pendiente',
                ],
                [
                    'student_id' => $student1->id,
                    'psychologist_id' => $psychologist1->id,
                    'fecha' => now()->addDays(1)->format('Y-m-d'),
                    'hora' => '16:00:00',
                    'duracion' => 60,
                    'motivo_consulta' => 'Seguimiento de tratamiento',
                    'estado' => 'completada',
                    'notas' => 'Paciente muestra mejoría significativa',
                ],
            ];

            foreach ($citas as $cita) {
                Cita::create($cita);
            }
        }

        $this->command->info('Datos de prueba creados exitosamente!');
        $this->command->info('Psicólogos: ana.garcia@gmail.com, carlos.mendoza@hotmail.com, maria.lopez@outlook.com');
        $this->command->info('Estudiantes: juan.perez@istta.edu.pe, maria.rodriguez@istta.edu.pe, luis.torres@istta.edu.pe');
        $this->command->info('Contraseña para todos: password123');
    }
}
