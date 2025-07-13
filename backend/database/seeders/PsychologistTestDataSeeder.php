<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Cita;
use App\Models\PsychologicalSession;
use App\Models\Schedule;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class PsychologistTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear psicólogo de prueba
        $psychologist = User::firstOrCreate(
            ['email' => 'maria.rodriguez@gmail.com'],
            [
                'name' => 'Dr. María Elena Rodríguez',
                'password' => Hash::make('password123'),
                'role' => 'psychologist',
                'dni' => '12345678',
                'specialization' => 'Psicología Clínica',
                'rating' => 4.8,
                'total_appointments' => 45,
                'verified' => true,
                'active' => true,
            ]
        );

        // Crear estudiantes de prueba
        $students = [
            [
                'name' => 'Carlos Rodríguez',
                'email' => 'carlos.rodriguez@istta.edu.pe',
                'dni' => '87654321',
                'career' => 'Ingeniería de Sistemas',
                'semester' => 6,
            ],
            [
                'name' => 'Ana López',
                'email' => 'ana.lopez@istta.edu.pe',
                'dni' => '11223344',
                'career' => 'Administración',
                'semester' => 4,
            ],
            [
                'name' => 'Juan Pérez',
                'email' => 'juan.perez@istta.edu.pe',
                'dni' => '55667788',
                'career' => 'Contabilidad',
                'semester' => 8,
            ],
        ];

        foreach ($students as $studentData) {
            User::firstOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password123'),
                    'role' => 'student',
                    'dni' => $studentData['dni'],
                    'career' => $studentData['career'],
                    'semester' => $studentData['semester'],
                    'verified' => true,
                    'active' => true,
                ]
            );
        }

        // Crear citas de prueba
        $appointments = [
            [
                'student_email' => 'carlos.rodriguez@istta.edu.pe',
                'fecha' => Carbon::tomorrow(),
                'hora' => '09:00',
                'estado' => 'pendiente',
                'motivo_consulta' => 'Problemas de ansiedad académica',
            ],
            [
                'student_email' => 'ana.lopez@istta.edu.pe',
                'fecha' => Carbon::tomorrow()->addDays(2),
                'hora' => '14:00',
                'estado' => 'confirmada',
                'motivo_consulta' => 'Sesión de seguimiento',
            ],
            [
                'student_email' => 'juan.perez@istta.edu.pe',
                'fecha' => Carbon::today(),
                'hora' => '16:00',
                'estado' => 'pendiente',
                'motivo_consulta' => 'Primera consulta',
            ],
        ];

        foreach ($appointments as $appointmentData) {
            $student = User::where('email', $appointmentData['student_email'])->first();
            if ($student) {
                Cita::create([
                    'student_id' => $student->id,
                    'psychologist_id' => $psychologist->id,
                    'fecha' => $appointmentData['fecha'],
                    'hora' => $appointmentData['hora'],
                    'duracion' => 60,
                    'motivo_consulta' => $appointmentData['motivo_consulta'],
                    'estado' => $appointmentData['estado'],
                ]);
            }
        }

        // Crear sesiones psicológicas de prueba
        $sessions = [
            [
                'patient_email' => 'carlos.rodriguez@istta.edu.pe',
                'fecha_sesion' => Carbon::yesterday(),
                'estado' => 'Realizada',
                'tipo_sesion' => 'Terapia Cognitivo-Conductual',
                'temas_tratados' => 'Manejo de ansiedad, técnicas de respiración',
                'notas' => 'Paciente muestra mejoría en el manejo del estrés',
                'objetivos' => 'Reducir niveles de ansiedad en situaciones académicas',
                'conclusiones' => 'Sesión productiva, paciente comprometido con el tratamiento',
            ],
            [
                'patient_email' => 'ana.lopez@istta.edu.pe',
                'fecha_sesion' => Carbon::now()->subDays(3),
                'estado' => 'Realizada',
                'tipo_sesion' => 'Terapia de Aceptación y Compromiso',
                'temas_tratados' => 'Valores personales, aceptación de emociones',
                'notas' => 'Paciente está explorando sus valores fundamentales',
                'objetivos' => 'Clarificar valores y metas personales',
                'conclusiones' => 'Progreso significativo en autoconocimiento',
            ],
        ];

        foreach ($sessions as $sessionData) {
            $patient = User::where('email', $sessionData['patient_email'])->first();
            if ($patient) {
                PsychologicalSession::create([
                    'patient_id' => $patient->id,
                    'psychologist_id' => $psychologist->id,
                    'fecha_sesion' => $sessionData['fecha_sesion'],
                    'duracion_minutos' => 60,
                    'estado' => $sessionData['estado'],
                    'tipo_sesion' => $sessionData['tipo_sesion'],
                    'temas_tratados' => $sessionData['temas_tratados'],
                    'notas' => $sessionData['notas'],
                    'objetivos' => $sessionData['objetivos'],
                    'conclusiones' => $sessionData['conclusiones'],
                ]);
            }
        }

        // Crear horarios de prueba
        $schedules = [
            [
                'date' => Carbon::tomorrow(),
                'start_time' => '09:00',
                'end_time' => '10:00',
                'is_available' => true,
            ],
            [
                'date' => Carbon::tomorrow(),
                'start_time' => '14:00',
                'end_time' => '15:00',
                'is_available' => true,
            ],
            [
                'date' => Carbon::tomorrow()->addDays(2),
                'start_time' => '10:00',
                'end_time' => '11:00',
                'is_available' => true,
            ],
            [
                'date' => Carbon::today(),
                'start_time' => '16:00',
                'end_time' => '17:00',
                'is_available' => false,
                'is_blocked' => true,
                'block_reason' => 'Reunión administrativa',
            ],
        ];

        foreach ($schedules as $scheduleData) {
            Schedule::create([
                'psychologist_id' => $psychologist->id,
                'date' => $scheduleData['date'],
                'start_time' => $scheduleData['start_time'],
                'end_time' => $scheduleData['end_time'],
                'is_available' => $scheduleData['is_available'],
                'is_blocked' => $scheduleData['is_blocked'] ?? false,
                'block_reason' => $scheduleData['block_reason'] ?? null,
            ]);
        }

        // Crear notificaciones de prueba
        $notifications = [
            [
                'user_email' => 'maria.rodriguez@gmail.com',
                'type' => 'appointment',
                'title' => 'Nueva solicitud de cita',
                'message' => 'Carlos Rodríguez ha solicitado una cita para mañana a las 09:00',
            ],
            [
                'user_email' => 'maria.rodriguez@gmail.com',
                'type' => 'reminder',
                'title' => 'Recordatorio de sesión',
                'message' => 'Tienes una sesión programada para hoy a las 16:00',
            ],
        ];

        foreach ($notifications as $notificationData) {
            $user = User::where('email', $notificationData['user_email'])->first();
            if ($user) {
                Notification::create([
                    'user_id' => $user->id,
                    'type' => $notificationData['type'],
                    'title' => $notificationData['title'],
                    'message' => $notificationData['message'],
                    'read' => false,
                ]);
            }
        }

        $this->command->info('Datos de prueba del psicólogo creados exitosamente!');
        $this->command->info('Credenciales de prueba:');
        $this->command->info("Psicólogo: maria.rodriguez@gmail.com | Contraseña: password123");
        $this->command->info("Estudiantes: carlos.rodriguez@istta.edu.pe, ana.lopez@istta.edu.pe, juan.perez@istta.edu.pe | Contraseña: password123");
    }
} 