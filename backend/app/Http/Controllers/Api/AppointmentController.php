<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
use App\Models\Psychologist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    public function index()
    {
        try {
            $appointments = Cita::with(['student', 'psychologist'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'student_id' => $appointment->student_id,
                        'student_name' => $appointment->student->name ?? 'N/A',
                        'psychologist_id' => $appointment->psychologist_id,
                        'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                        'fecha' => $appointment->fecha,
                        'hora' => $appointment->hora,
                        'motivo_consulta' => $appointment->motivo_consulta,
                        'notas' => $appointment->notas,
                        'estado' => $appointment->estado,
                        'created_at' => $appointment->created_at,
                        'updated_at' => $appointment->updated_at,
                    ];
                });

            return response()->json($appointments);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener las citas: ' . $e->getMessage()], 500);
        }
    }

    public function getUserAppointments($studentEmail)
    {
        try {
            $appointments = Cita::with(['student', 'psychologist'])
                ->whereHas('student', function($q) use ($studentEmail) {
                    $q->where('email', $studentEmail);
                })
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'student_id' => $appointment->student_id,
                        'student_name' => $appointment->student->name ?? 'N/A',
                        'psychologist_id' => $appointment->psychologist_id,
                        'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                        'fecha' => $appointment->fecha,
                        'hora' => $appointment->hora,
                        'motivo_consulta' => $appointment->motivo_consulta,
                        'notas' => $appointment->notas,
                        'estado' => $appointment->estado,
                        'created_at' => $appointment->created_at,
                        'updated_at' => $appointment->updated_at,
                    ];
                });

            return response()->json($appointments);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener las citas del estudiante: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|exists:users,id',
                'psychologist_id' => 'required|exists:users,id',
                'fecha' => 'required|date|after_or_equal:today',
                'hora' => 'required|string',
                'motivo_consulta' => 'required|string|max:500',
                'notas' => 'nullable|string|max:1000',
                'estado' => 'required|in:pendiente,confirmada,completada,cancelada',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            // Verificar si el estudiante existe
            $user = User::find($request->student_id);
            if (!$user) {
                return response()->json(['message' => 'Estudiante no encontrado'], 404);
            }

            if ($user->role !== 'student') {
                return response()->json(['message' => 'Solo los estudiantes pueden agendar citas'], 403);
            }

            // Verificar si el psicólogo existe
            $psychologist = User::find($request->psychologist_id);
            if (!$psychologist || $psychologist->role !== 'psychologist') {
                return response()->json(['message' => 'Psicólogo no encontrado'], 404);
            }

            // Verificar si ya existe una cita para el mismo estudiante, psicólogo, fecha y hora
            $existingAppointment = Cita::where('student_id', $request->student_id)
                ->where('psychologist_id', $request->psychologist_id)
                ->where('fecha', $request->fecha)
                ->where('hora', $request->hora)
                ->where('estado', '!=', 'cancelada')
                ->first();

            if ($existingAppointment) {
                return response()->json(['message' => 'Ya existe una cita para esta fecha y hora'], 409);
            }

            // Verificar si el horario está disponible
            $conflictingAppointment = Cita::where('psychologist_id', $request->psychologist_id)
                ->where('fecha', $request->fecha)
                ->where('hora', $request->hora)
                ->where('estado', '!=', 'cancelada')
                ->first();

            if ($conflictingAppointment) {
                return response()->json(['message' => 'Este horario no está disponible'], 409);
            }

            $appointment = Cita::create([
                'student_id' => $request->student_id,
                'psychologist_id' => $request->psychologist_id,
                'fecha' => $request->fecha,
                'hora' => $request->hora,
                'motivo_consulta' => $request->motivo_consulta,
                'notas' => $request->notas,
                'estado' => $request->estado,
            ]);

            $appointment->load(['student', 'psychologist']);

            return response()->json([
                'message' => 'Cita creada exitosamente',
                'appointment' => [
                    'id' => $appointment->id,
                    'student_id' => $appointment->student_id,
                    'student_name' => $appointment->student->name ?? 'N/A',
                    'psychologist_id' => $appointment->psychologist_id,
                    'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                    'fecha' => $appointment->fecha,
                    'hora' => $appointment->hora,
                    'motivo_consulta' => $appointment->motivo_consulta,
                    'notas' => $appointment->notas,
                    'estado' => $appointment->estado,
                    'created_at' => $appointment->created_at,
                    'updated_at' => $appointment->updated_at,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear la cita: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $appointment = Cita::with(['student', 'psychologist'])->find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            return response()->json([
                'id' => $appointment->id,
                'student_id' => $appointment->student_id,
                'student_name' => $appointment->student->name ?? 'N/A',
                'psychologist_id' => $appointment->psychologist_id,
                'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                'fecha' => $appointment->fecha,
                'hora' => $appointment->hora,
                'motivo_consulta' => $appointment->motivo_consulta,
                'notas' => $appointment->notas,
                'estado' => $appointment->estado,
                'created_at' => $appointment->created_at,
                'updated_at' => $appointment->updated_at,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener la cita: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $appointment = Cita::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $validator = Validator::make($request->all(), [
                'student_id' => 'sometimes|required|exists:users,id',
                'psychologist_id' => 'sometimes|required|exists:users,id',
                'fecha' => 'sometimes|required|date|after_or_equal:today',
                'hora' => 'sometimes|required|string',
                'motivo_consulta' => 'sometimes|required|string|max:500',
                'notas' => 'nullable|string|max:1000',
                'estado' => 'sometimes|required|in:pendiente,confirmada,completada,cancelada',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            $appointment->update($request->only([
                'student_id', 'psychologist_id', 'fecha', 'hora', 'motivo_consulta', 'notas', 'estado'
            ]));

            $appointment->load(['student', 'psychologist']);

            return response()->json([
                'message' => 'Cita actualizada exitosamente',
                'appointment' => [
                    'id' => $appointment->id,
                    'student_id' => $appointment->student_id,
                    'student_name' => $appointment->student->name ?? 'N/A',
                    'psychologist_id' => $appointment->psychologist_id,
                    'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                    'fecha' => $appointment->fecha,
                    'hora' => $appointment->hora,
                    'motivo_consulta' => $appointment->motivo_consulta,
                    'notas' => $appointment->notas,
                    'estado' => $appointment->estado,
                    'created_at' => $appointment->created_at,
                    'updated_at' => $appointment->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar la cita: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $appointment = Cita::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $appointment->delete();

            return response()->json(['message' => 'Cita eliminada exitosamente']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar la cita: ' . $e->getMessage()], 500);
        }
    }

    public function confirm($id)
    {
        try {
            $appointment = Cita::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $appointment->update(['estado' => 'confirmada']);

            return response()->json(['message' => 'Cita confirmada exitosamente']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al confirmar la cita: ' . $e->getMessage()], 500);
        }
    }

    public function cancel($id)
    {
        try {
            $appointment = Cita::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $appointment->update(['estado' => 'cancelada']);

            return response()->json(['message' => 'Cita cancelada exitosamente']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al cancelar la cita: ' . $e->getMessage()], 500);
        }
    }

    public function complete($id)
    {
        try {
            $appointment = Cita::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $appointment->update(['estado' => 'completada']);

            return response()->json(['message' => 'Cita completada exitosamente']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al completar la cita: ' . $e->getMessage()], 500);
        }
    }

    public function getAvailableSlots(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'psychologist_id' => 'required|exists:users,id',
                'fecha' => 'required|date|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            $psychologistId = $request->psychologist_id;
            $fecha = $request->fecha;

            // Validar solo días de lunes a viernes
            $dayOfWeek = date('N', strtotime($fecha)); // 1 (lunes) - 7 (domingo)
            if ($dayOfWeek > 5) {
                return response()->json([], 200); // No hay horarios disponibles sábados y domingos
            }

            // Horarios disponibles (de 8:00 AM a 2:00 PM)
            $availableTimes = [
                '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'
            ];

            // Obtener citas existentes para el psicólogo en esa fecha
            $existingAppointments = Cita::where('psychologist_id', $psychologistId)
                ->where('fecha', $fecha)
                ->where('estado', '!=', 'cancelada')
                ->pluck('hora')
                ->toArray();

            // Integrar aquí la consulta a la tabla de bloqueos de horarios del psicólogo (feriados, reuniones, etc.)
            $blockedSlots = \App\Models\Schedule::where('psychologist_id', $psychologistId)
                ->where('date', $fecha)
                ->where(function($q) {
                    $q->where('is_blocked', true)->orWhere('is_available', false);
                })
                ->pluck('start_time')
                ->toArray();

            $slots = [];
            foreach ($availableTimes as $index => $time) {
                $slots[] = [
                    'id' => $index + 1,
                    'time' => $time,
                    'available' => !in_array($time, $existingAppointments) && !in_array($time, $blockedSlots)
                ];
            }

            return response()->json($slots);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener horarios disponibles: ' . $e->getMessage()], 500);
        }
    }
} 