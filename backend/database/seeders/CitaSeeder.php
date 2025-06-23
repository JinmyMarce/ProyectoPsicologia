<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cita;
use App\Models\User;

class CitaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = User::where('role', 'student')->get();
        $psychologists = User::where('role', 'psychologist')->get();

        if ($students->isEmpty() || $psychologists->isEmpty()) {
            $this->command->warn('No hay estudiantes o psicólogos para crear citas');
            return;
        }

        $citas = [
            [
                'student_id' => $students[0]->id,
                'psychologist_id' => $psychologists[0]->id,
                'fecha' => now()->addDays(1)->format('Y-m-d'),
                'hora' => '09:00',
                'duracion' => 60,
                'motivo_consulta' => 'Ansiedad académica',
                'estado' => 'confirmada',
                'notas' => 'Primera consulta de orientación',
            ],
            [
                'student_id' => $students[1]->id,
                'psychologist_id' => $psychologists[1]->id,
                'fecha' => now()->addDays(2)->format('Y-m-d'),
                'hora' => '10:30',
                'duracion' => 60,
                'motivo_consulta' => 'Problemas familiares',
                'estado' => 'pendiente',
                'notas' => 'Pendiente de evaluación',
            ],
            [
                'student_id' => $students[2]->id,
                'psychologist_id' => $psychologists[2]->id,
                'fecha' => now()->addDays(3)->format('Y-m-d'),
                'hora' => '11:00',
                'duracion' => 60,
                'motivo_consulta' => 'Estrés por exámenes',
                'estado' => 'pendiente',
                'notas' => 'Requiere seguimiento',
            ],
        ];

        foreach ($citas as $cita) {
            Cita::create($cita);
        }
    }
}
