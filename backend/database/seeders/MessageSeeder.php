<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Message;
use App\Models\User;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = User::where('role', 'student')->get();
        $psychologists = User::where('role', 'psychologist')->get();

        if ($students->isEmpty() || $psychologists->isEmpty()) {
            $this->command->warn('No hay estudiantes o psicólogos para crear mensajes');
            return;
        }

        $messages = [
            // Mensajes de psicólogos a estudiantes
            [
                'sender_id' => $psychologists[0]->id,
                'recipient_id' => $students[0]->id,
                'subject' => 'Confirmación de cita',
                'content' => 'Hola, tu cita para mañana a las 10:00 AM ha sido confirmada. Por favor, llega 10 minutos antes.',
                'type' => 'appointment',
                'priority' => 'normal',
                'read' => false,
            ],
            [
                'sender_id' => $psychologists[1]->id,
                'recipient_id' => $students[1]->id,
                'subject' => 'Cambio de horario',
                'content' => 'Necesito reprogramar tu cita de la próxima semana. ¿Podrías confirmarme si tienes disponibilidad el jueves a las 2:00 PM?',
                'type' => 'appointment',
                'priority' => 'high',
                'read' => true,
            ],
            [
                'sender_id' => $psychologists[2]->id,
                'recipient_id' => $students[2]->id,
                'subject' => 'Seguimiento de sesión',
                'content' => 'Espero que estés bien. Te envío un recordatorio de las técnicas de relajación que practicamos en la última sesión. No dudes en contactarme si necesitas apoyo.',
                'type' => 'session',
                'priority' => 'normal',
                'read' => false,
            ],
            [
                'sender_id' => $psychologists[0]->id,
                'recipient_id' => $students[3]->id,
                'subject' => 'Cancelación de cita',
                'content' => 'Lamento informarte que necesito cancelar tu cita de mañana debido a una emergencia personal. Te contactaré para reprogramar en la brevedad posible.',
                'type' => 'appointment',
                'priority' => 'urgent',
                'read' => false,
            ],
            [
                'sender_id' => $psychologists[1]->id,
                'recipient_id' => $students[0]->id,
                'subject' => 'Material de apoyo',
                'content' => 'Te envío algunos recursos adicionales que pueden ayudarte con las técnicas de estudio que discutimos. Espero que te sean útiles.',
                'type' => 'session',
                'priority' => 'low',
                'read' => true,
            ],
            // Mensajes de estudiantes a psicólogos
            [
                'sender_id' => $students[0]->id,
                'recipient_id' => $psychologists[0]->id,
                'subject' => 'Consulta sobre cita',
                'content' => 'Hola, quería confirmar si mi cita de mañana sigue programada para las 10:00 AM. Gracias.',
                'type' => 'appointment',
                'priority' => 'normal',
                'read' => true,
            ],
            [
                'sender_id' => $students[1]->id,
                'recipient_id' => $psychologists[1]->id,
                'subject' => 'Disponibilidad para reprogramar',
                'content' => 'Perfecto, puedo asistir el jueves a las 2:00 PM. Gracias por la reprogramación.',
                'type' => 'appointment',
                'priority' => 'normal',
                'read' => false,
            ],
            [
                'sender_id' => $students[2]->id,
                'recipient_id' => $psychologists[2]->id,
                'subject' => 'Duda sobre técnicas',
                'content' => 'Hola, tengo una duda sobre las técnicas de respiración que practicamos. ¿Podrías explicarme de nuevo el ejercicio de respiración 4-7-8?',
                'type' => 'session',
                'priority' => 'normal',
                'read' => false,
            ],
            [
                'sender_id' => $students[3]->id,
                'recipient_id' => $psychologists[0]->id,
                'subject' => 'Reprogramación de cita',
                'content' => 'Entiendo la situación. ¿Podrías avisarme cuando tengas disponibilidad para reprogramar la cita?',
                'type' => 'appointment',
                'priority' => 'normal',
                'read' => true,
            ],
            [
                'sender_id' => $students[0]->id,
                'recipient_id' => $psychologists[1]->id,
                'subject' => 'Agradecimiento',
                'content' => 'Muchas gracias por los recursos que me enviaste. Han sido muy útiles para mejorar mi organización de estudio.',
                'type' => 'session',
                'priority' => 'low',
                'read' => false,
            ],
        ];

        foreach ($messages as $message) {
            Message::create($message);
        }

        $this->command->info('Mensajes de prueba creados exitosamente');
    }
} 