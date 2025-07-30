<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CitaProfesionalController extends Controller
{
    // POST /api/citas/profesional
    public function agendar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'psychologist_id' => 'required|exists:users,id',
            'fecha' => 'required|date|after:today',
            'hora' => 'required|date_format:H:i',
            'motivo_consulta' => 'required|string|max:500',
            'duracion' => 'required|integer|min:30|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validar que el horario esté disponible en Schedule
        $horario = Schedule::where('psychologist_id', $request->psychologist_id)
            ->where('date', $request->fecha)
            ->where('start_time', $request->hora)
            ->where('is_available', true)
            ->where('is_blocked', false)
            ->first();

        if (!$horario) {
            return response()->json([
                'success' => false,
                'message' => 'El horario no está disponible en la agenda del psicólogo'
            ], 422);
        }

        // Validar que no haya otra cita en ese horario
        $existeCita = Cita::where('psychologist_id', $request->psychologist_id)
            ->where('fecha', $request->fecha)
            ->where('hora', $request->hora)
            ->where('estado', '!=', 'cancelada')
            ->exists();

        if ($existeCita) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe una cita en ese horario'
            ], 422);
        }

        $user = Auth::user();

        $cita = Cita::create([
            'student_id' => $user->id,
            'psychologist_id' => $request->psychologist_id,
            'fecha' => $request->fecha,
            'hora' => $request->hora,
            'duracion' => $request->duracion,
            'motivo_consulta' => $request->motivo_consulta,
            'estado' => 'pendiente',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cita agendada exitosamente',
            'data' => $cita->load(['student', 'psychologist'])
        ], 201);
    }
}
