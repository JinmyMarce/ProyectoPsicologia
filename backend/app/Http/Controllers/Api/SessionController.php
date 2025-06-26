<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PsychologicalSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SessionController extends Controller
{
    /**
     * Listar todas las sesiones
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = PsychologicalSession::with(['patient', 'psychologist']);

            // Filtros
            if ($request->has('psychologist_id')) {
                $query->where('psychologist_id', $request->psychologist_id);
            }

            if ($request->has('patient_id')) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('fecha')) {
                $query->where('fecha', $request->fecha);
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            $perPage = $request->get('per_page', 15);
            $sessions = $query->orderBy('fecha', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $sessions->items(),
                'pagination' => [
                    'current_page' => $sessions->currentPage(),
                    'last_page' => $sessions->lastPage(),
                    'per_page' => $sessions->perPage(),
                    'total' => $sessions->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las sesiones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva sesión
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_id' => 'required|exists:users,id',
                'psychologist_id' => 'required|exists:users,id',
                'fecha' => 'required|date|after_or_equal:today',
                'hora' => 'required|string',
                'duracion' => 'required|integer|min:30|max:180',
                'tipo_sesion' => 'required|string|max:100',
                'motivo_consulta' => 'required|string|max:500',
                'observaciones' => 'nullable|string|max:1000',
                'estado' => 'required|in:programada,en_progreso,completada,cancelada',
                'notas_psicologo' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar que el paciente existe y es estudiante
            $patient = User::find($request->patient_id);
            if (!$patient || $patient->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Paciente no encontrado o no válido'
                ], 404);
            }

            // Verificar que el psicólogo existe y es psicólogo
            $psychologist = User::find($request->psychologist_id);
            if (!$psychologist || $psychologist->role !== 'psychologist') {
                return response()->json([
                    'success' => false,
                    'message' => 'Psicólogo no encontrado o no válido'
                ], 404);
            }

            // Verificar disponibilidad del horario
            $conflictingSession = PsychologicalSession::where('psychologist_id', $request->psychologist_id)
                ->where('fecha', $request->fecha)
                ->where('hora', $request->hora)
                ->where('estado', '!=', 'cancelada')
                ->first();

            if ($conflictingSession) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este horario no está disponible'
                ], 409);
            }

            DB::beginTransaction();

            $session = PsychologicalSession::create([
                'patient_id' => $request->patient_id,
                'psychologist_id' => $request->psychologist_id,
                'fecha' => $request->fecha,
                'hora' => $request->hora,
                'duracion' => $request->duracion,
                'tipo_sesion' => $request->tipo_sesion,
                'motivo_consulta' => $request->motivo_consulta,
                'observaciones' => $request->observaciones,
                'estado' => $request->estado,
                'notas_psicologo' => $request->notas_psicologo,
            ]);

            $session->load(['patient', 'psychologist']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sesión creada exitosamente',
                'data' => $session->toApiArray()
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar una sesión específica
     */
    public function show($id): JsonResponse
    {
        try {
            $session = PsychologicalSession::with(['patient', 'psychologist'])->find($id);

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sesión no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $session->toApiArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una sesión
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $session = PsychologicalSession::find($id);

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sesión no encontrada'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'patient_id' => 'sometimes|required|exists:users,id',
                'psychologist_id' => 'sometimes|required|exists:users,id',
                'fecha' => 'sometimes|required|date',
                'hora' => 'sometimes|required|string',
                'duracion' => 'sometimes|required|integer|min:30|max:180',
                'tipo_sesion' => 'sometimes|required|string|max:100',
                'motivo_consulta' => 'sometimes|required|string|max:500',
                'observaciones' => 'nullable|string|max:1000',
                'estado' => 'sometimes|required|in:programada,en_progreso,completada,cancelada',
                'notas_psicologo' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar disponibilidad si se cambia fecha/hora
            if ($request->has('fecha') || $request->has('hora')) {
                $fecha = $request->fecha ?? $session->fecha;
                $hora = $request->hora ?? $session->hora;
                $psychologistId = $request->psychologist_id ?? $session->psychologist_id;

                $conflictingSession = PsychologicalSession::where('psychologist_id', $psychologistId)
                    ->where('fecha', $fecha)
                    ->where('hora', $hora)
                    ->where('estado', '!=', 'cancelada')
                    ->where('id', '!=', $id)
                    ->first();

                if ($conflictingSession) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Este horario no está disponible'
                    ], 409);
                }
            }

            DB::beginTransaction();

            $session->update($request->only([
                'patient_id', 'psychologist_id', 'fecha', 'hora', 'duracion',
                'tipo_sesion', 'motivo_consulta', 'observaciones', 'estado', 'notas_psicologo'
            ]));

            $session->load(['patient', 'psychologist']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sesión actualizada exitosamente',
                'data' => $session->toApiArray()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una sesión
     */
    public function destroy($id): JsonResponse
    {
        try {
            $session = PsychologicalSession::find($id);

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sesión no encontrada'
                ], 404);
            }

            // Solo permitir eliminar sesiones programadas
            if ($session->estado !== 'programada') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo se pueden eliminar sesiones programadas'
                ], 400);
            }

            $session->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sesión eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la sesión: ' . $e->getMessage()
            ], 500);
        }
    }
} 