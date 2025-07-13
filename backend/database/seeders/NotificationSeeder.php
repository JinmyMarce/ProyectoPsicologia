<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener un psicólogo para crear notificaciones
        $psychologist = User::where('role', 'psychologist')->first();
        
        if (!$psychologist) {
            $this->command->error('No se encontró ningún psicólogo. Ejecuta primero UserSeeder.');
            return;
        }

        // Crear notificaciones de prueba
        $notifications = [
            [
                'user_id' => $psychologist->id,
                'type' => 'appointment',
                'title' => 'Nueva cita pendiente',
                'message' => 'Tienes una nueva cita pendiente de aprobación para el estudiante Juan Pérez (juan.perez@example.com) el día 2024-01-15 a las 09:30.',
                'read' => false,
                'data' => json_encode([
                    'appointment_id' => 1,
                    'student_name' => 'Juan Pérez',
                    'student_email' => 'juan.perez@example.com',
                    'date' => '2024-01-15',
                    'time' => '09:30'
                ])
            ],
            [
                'user_id' => $psychologist->id,
                'type' => 'appointment',
                'title' => 'Nueva cita pendiente',
                'message' => 'Tienes una nueva cita pendiente de aprobación para el estudiante María García (maria.garcia@example.com) el día 2024-01-16 a las 10:15.',
                'read' => false,
                'data' => json_encode([
                    'appointment_id' => 2,
                    'student_name' => 'María García',
                    'student_email' => 'maria.garcia@example.com',
                    'date' => '2024-01-16',
                    'time' => '10:15'
                ])
            ],
            [
                'user_id' => $psychologist->id,
                'type' => 'reminder',
                'title' => 'Recordatorio de cita',
                'message' => 'Tienes una cita programada mañana a las 08:00 con el estudiante Carlos López.',
                'read' => true,
                'data' => json_encode([
                    'appointment_id' => 3,
                    'student_name' => 'Carlos López',
                    'date' => '2024-01-14',
                    'time' => '08:00'
                ])
            ]
        ];

        foreach ($notifications as $notification) {
            Notification::create($notification);
        }

        $this->command->info('Notificaciones de prueba creadas exitosamente.');
    }
} 