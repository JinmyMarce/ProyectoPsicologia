<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Cita;
use Illuminate\Http\Request;

class DisponibilidadController extends Controller
{
    // GET /api/disponibilidad/{id_psicologo}?fecha=YYYY-MM-DD
    public function disponibilidadPorPsicologo($id_psicologo, Request $request)
    {
        $fecha = $request->query('fecha');
        if (!$fecha) {
            return response()->json([
                'success' => false,
                'message' => 'La fecha es obligatoria (YYYY-MM-DD)'
            ], 422);
        }

        // Buscar horarios disponibles en Schedule
        $horarios = Schedule::where('psychologist_id', $id_psicologo)
            ->where('date', $fecha)
            ->where('is_available', true)
            ->where('is_blocked', false)
            ->get();

        // Filtrar horarios ya agendados
        $horasOcupadas = Cita::where('psychologist_id', $id_psicologo)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->pluck('hora')
            ->toArray();

        $disponibles = $horarios->filter(function($horario) use ($horasOcupadas) {
            return !in_array($horario->start_time instanceof \DateTimeInterface ? $horario->start_time->format('H:i') : $horario->start_time, $horasOcupadas);
        })->values();

        return response()->json([
            'success' => true,
            'data' => $disponibles
        ]);
    }
}
