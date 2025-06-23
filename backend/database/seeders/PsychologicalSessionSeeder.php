<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PsychologicalSession;
use App\Models\User;

class PsychologicalSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener estudiantes y psicólogos existentes
        $students = User::where('role', 'student')->where('email', 'like', '%@instituto.edu.pe')->get();
        $psychologists = User::where('role', 'psychologist')->get();

        if ($students->isEmpty() || $psychologists->isEmpty()) {
            $this->command->warn('No hay estudiantes o psicólogos para crear sesiones');
            return;
        }

        $sessions = [
            [
                'patient_id' => $students[0]->id,
                'psychologist_id' => $psychologists[0]->id,
                'fecha_sesion' => now()->subDays(5),
                'temas_tratados' => 'Ansiedad académica, estrés por exámenes, técnicas de relajación',
                'notas' => 'Paciente presenta síntomas de ansiedad moderada relacionada con la presión académica. Se trabajó en técnicas de respiración y planificación de estudio.',
                'estado' => 'Realizada',
                'duracion_minutos' => 60,
                'tipo_sesion' => 'Terapia individual',
                'objetivos' => 'Reducir niveles de ansiedad, mejorar técnicas de estudio',
                'conclusiones' => 'Paciente respondió bien a las técnicas de relajación. Se programó seguimiento en 2 semanas.',
            ],
            [
                'patient_id' => $students[1]->id,
                'psychologist_id' => $psychologists[0]->id,
                'fecha_sesion' => now()->subDays(3),
                'temas_tratados' => 'Problemas de autoestima, relaciones interpersonales',
                'notas' => 'El paciente manifiesta dificultades para relacionarse con compañeros. Se identificaron patrones de pensamiento negativo.',
                'estado' => 'Realizada',
                'duracion_minutos' => 45,
                'tipo_sesion' => 'Terapia individual',
                'objetivos' => 'Mejorar autoestima, desarrollar habilidades sociales',
                'conclusiones' => 'Se acordó trabajar en ejercicios de autoafirmación y práctica de habilidades sociales.',
            ],
            [
                'patient_id' => $students[2]->id,
                'psychologist_id' => $psychologists[1]->id,
                'fecha_sesion' => now()->subDays(1),
                'temas_tratados' => 'Depresión, pérdida de interés en actividades',
                'notas' => 'Paciente reporta sentimientos de tristeza persistente y pérdida de interés en actividades que antes disfrutaba.',
                'estado' => 'Realizada',
                'duracion_minutos' => 90,
                'tipo_sesion' => 'Evaluación inicial',
                'objetivos' => 'Evaluar síntomas depresivos, establecer plan de tratamiento',
                'conclusiones' => 'Se confirmó diagnóstico de depresión leve. Se inició plan de tratamiento con terapia cognitivo-conductual.',
            ],
            [
                'patient_id' => $students[3]->id,
                'psychologist_id' => $psychologists[0]->id,
                'fecha_sesion' => now()->addDays(2),
                'temas_tratados' => 'Problemas familiares, comunicación',
                'notas' => 'Paciente solicita ayuda para mejorar comunicación con familiares. Se programó sesión de terapia familiar.',
                'estado' => 'Programada',
                'duracion_minutos' => 60,
                'tipo_sesion' => 'Terapia familiar',
                'objetivos' => 'Mejorar comunicación familiar, resolver conflictos',
                'conclusiones' => null,
            ],
            [
                'patient_id' => $students[4]->id,
                'psychologist_id' => $psychologists[1]->id,
                'fecha_sesion' => now()->addDays(5),
                'temas_tratados' => 'Manejo del estrés laboral',
                'notas' => 'Paciente trabaja y estudia, presenta síntomas de estrés crónico. Necesita técnicas de manejo del tiempo.',
                'estado' => 'Programada',
                'duracion_minutos' => 45,
                'tipo_sesion' => 'Terapia individual',
                'objetivos' => 'Desarrollar estrategias de manejo del estrés, mejorar organización del tiempo',
                'conclusiones' => null,
            ],
        ];

        foreach ($sessions as $session) {
            PsychologicalSession::create($session);
        }

        $this->command->info('Sesiones psicológicas creadas exitosamente!');
    }
}
