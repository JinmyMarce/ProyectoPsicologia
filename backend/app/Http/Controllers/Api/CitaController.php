<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CitaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $citas = [];

        try {
            switch ($user->role) {
                case 'student':
                    // Estudiantes ven sus propias citas
                    $citas = Cita::where('student_id', $user->id)
                        ->with(['student', 'psychologist'])
                        ->orderBy('fecha', 'desc')
                        ->orderBy('hora', 'desc')
                        ->get();
                    break;
                    
                case 'psychologist':
                    // Psicólogos ven citas asignadas a ellos
                    $citas = Cita::where('psychologist_id', $user->id)
                        ->with(['student', 'psychologist'])
                        ->orderBy('fecha', 'desc')
                        ->orderBy('hora', 'desc')
                        ->get();
                    break;
                    
                case 'admin':
                case 'super_admin':
                    // Admins ven todas las citas
                    $citas = Cita::with(['student', 'psychologist'])
                        ->orderBy('fecha', 'desc')
                        ->orderBy('hora', 'desc')
                        ->get();
                    break;
            }

            return response()->json([
                'success' => true,
                'data' => $citas
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las citas'
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
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

        try {
            $user = Auth::user();
            
            // Verificar que el psicólogo esté activo
            $psychologist = User::where('id', $request->psychologist_id)
                ->where('role', 'psychologist')
                ->where('active', true)
                ->first();

            if (!$psychologist) {
                return response()->json([
                    'success' => false,
                    'message' => 'Psicólogo no encontrado o inactivo'
                ], 404);
            }

            // Verificar disponibilidad
            $existingCita = Cita::where('psychologist_id', $request->psychologist_id)
                ->where('fecha', $request->fecha)
                ->where('hora', $request->hora)
                ->where('estado', '!=', 'cancelada')
                ->first();

            if ($existingCita) {
                return response()->json([
                    'success' => false,
                    'message' => 'El psicólogo no está disponible en ese horario'
                ], 422);
            }

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
                'message' => 'Cita creada exitosamente',
                'data' => $cita->load(['student', 'psychologist'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la cita'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $cita = Cita::with(['student', 'psychologist'])->find($id);

            if (!$cita) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cita no encontrada'
                ], 404);
            }

            // Verificar permisos
            if ($user->role === 'student' && $cita->student_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para ver esta cita'
                ], 403);
            }

            if ($user->role === 'psychologist' && $cita->psychologist_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para ver esta cita'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $cita
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la cita'
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'sometimes|in:pendiente,confirmada,cancelada,completada',
            'notas' => 'sometimes|string|max:1000',
            'fecha' => 'sometimes|date|after:today',
            'hora' => 'sometimes|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $cita = Cita::find($id);

            if (!$cita) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cita no encontrada'
                ], 404);
            }

            // Verificar permisos
            if ($user->role === 'student' && $cita->student_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para modificar esta cita'
                ], 403);
            }

            if ($user->role === 'psychologist' && $cita->psychologist_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para modificar esta cita'
                ], 403);
            }

            // Solo psicólogos y admins pueden cambiar el estado
            if (isset($request->estado) && $user->role === 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para cambiar el estado de la cita'
                ], 403);
            }

            $cita->update($request->only(['estado', 'notas', 'fecha', 'hora']));

            return response()->json([
                'success' => true,
                'message' => 'Cita actualizada exitosamente',
                'data' => $cita->load(['student', 'psychologist'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la cita'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $cita = Cita::find($id);

            if (!$cita) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cita no encontrada'
                ], 404);
            }

            // Solo el estudiante que creó la cita o admins pueden cancelarla
            if ($user->role === 'student' && $cita->student_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para cancelar esta cita'
                ], 403);
            }

            if ($user->role === 'psychologist' && $cita->psychologist_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para cancelar esta cita'
                ], 403);
            }

            // En lugar de eliminar, cambiar estado a cancelada
            $cita->update(['estado' => 'cancelada']);

            return response()->json([
                'success' => true,
                'message' => 'Cita cancelada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cancelar la cita'
            ], 500);
        }
    }

    /**
     * Obtener psicólogos disponibles para citas
     */
    public function getAvailablePsychologists(): JsonResponse
    {
        try {
            $psychologists = User::where('role', 'psychologist')
                ->where('active', true)
                ->where('verified', true)
                ->select('id', 'name', 'specialization', 'rating', 'total_appointments')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $psychologists
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener psicólogos disponibles'
            ], 500);
        }
    }

    /**
     * Obtener horarios disponibles de un psicólogo
     */
    public function getPsychologistSchedule(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'psychologist_id' => 'required|exists:users,id',
            'fecha' => 'required|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $psychologist = User::find($request->psychologist_id);
            
            if (!$psychologist || $psychologist->role !== 'psychologist' || !$psychologist->active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Psicólogo no encontrado o inactivo'
                ], 404);
            }

            // Obtener citas existentes para esa fecha
            $existingCitas = Cita::where('psychologist_id', $request->psychologist_id)
                ->where('fecha', $request->fecha)
                ->where('estado', '!=', 'cancelada')
                ->pluck('hora')
                ->toArray();

            // Horarios disponibles (9:00 AM a 6:00 PM, cada 30 minutos)
            $availableHours = [];
            $startHour = 9;
            $endHour = 18;

            for ($hour = $startHour; $hour < $endHour; $hour++) {
                for ($minute = 0; $minute < 60; $minute += 30) {
                    $time = sprintf('%02d:%02d', $hour, $minute);
                    if (!in_array($time, $existingCitas)) {
                        $availableHours[] = $time;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'psychologist' => $psychologist,
                    'available_hours' => $availableHours
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener horarios disponibles'
            ], 500);
        }
    }
}
