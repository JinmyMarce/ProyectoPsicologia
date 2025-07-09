<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
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
                        'user_email' => $appointment->student->email ?? 'N/A',
                        'user_name' => $appointment->student->name ?? 'N/A',
                        'psychologist_id' => $appointment->psychologist_id,
                        'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                        'date' => $appointment->fecha,
                        'time' => $appointment->hora,
                        'reason' => $appointment->motivo_consulta,
                        'notes' => $appointment->notas ?? '',
                        'status' => $appointment->estado,
                        'created_at' => $appointment->created_at,
                        'updated_at' => $appointment->updated_at,
                    ];
                });

            return response()->json($appointments);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener las citas: ' . $e->getMessage()], 500);
        }
    }

    public function getUserAppointments($userEmail)
    {
        try {
            $user = User::where('email', $userEmail)->first();
            if (!$user) {
                return response()->json(['message' => 'Usuario no encontrado'], 404);
            }

            $appointments = Cita::with(['student', 'psychologist'])
                ->where('student_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'user_email' => $appointment->student->email ?? 'N/A',
                        'user_name' => $appointment->student->name ?? 'N/A',
                        'psychologist_id' => $appointment->psychologist_id,
                        'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                        'date' => $appointment->fecha,
                        'time' => $appointment->hora,
                        'reason' => $appointment->motivo_consulta,
                        'notes' => $appointment->notas ?? '',
                        'status' => $appointment->estado,
                        'created_at' => $appointment->created_at,
                        'updated_at' => $appointment->updated_at,
                    ];
                });

            return response()->json($appointments);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener las citas del usuario: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_email' => 'required|email|exists:users,email',
                'psychologist_id' => 'required|exists:users,id',
                'date' => 'required|date|after_or_equal:today',
                'time' => 'required|string',
                'reason' => 'required|string|max:500',
                'notes' => 'nullable|string|max:1000',
                'status' => 'required|in:pending,confirmed,completed,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            // Verificar si el usuario existe y es un estudiante
            $user = User::where('email', $request->user_email)->first();
            if (!$user) {
                return response()->json(['message' => 'Usuario no encontrado'], 404);
            }

            if ($user->role !== 'student') {
                return response()->json(['message' => 'Solo los estudiantes pueden agendar citas'], 403);
            }

            // Verificar si el psicólogo existe y es activo
            $psychologist = User::where('id', $request->psychologist_id)
                ->where('role', 'psychologist')
                ->where('active', true)
                ->first();
            if (!$psychologist) {
                return response()->json(['message' => 'Psicólogo no encontrado o inactivo'], 404);
            }

            // Verificar si ya existe una cita para el mismo usuario, psicólogo, fecha y hora
            $existingAppointment = Cita::where('student_id', $user->id)
                ->where('psychologist_id', $request->psychologist_id)
                ->where('fecha', $request->date)
                ->where('hora', $request->time)
                ->where('estado', '!=', 'cancelada')
                ->first();

            if ($existingAppointment) {
                return response()->json(['message' => 'Ya existe una cita para esta fecha y hora'], 409);
            }

            // Verificar si el horario está disponible
            $conflictingAppointment = Cita::where('psychologist_id', $request->psychologist_id)
                ->where('fecha', $request->date)
                ->where('hora', $request->time)
                ->where('estado', '!=', 'cancelada')
                ->first();

            if ($conflictingAppointment) {
                return response()->json(['message' => 'Este horario no está disponible'], 409);
            }

            // Mapear estados del frontend a estados del backend
            $estadoMap = [
                'pending' => 'pendiente',
                'confirmed' => 'confirmada',
                'completed' => 'completada',
                'cancelled' => 'cancelada'
            ];

            $appointment = Cita::create([
                'student_id' => $user->id,
                'psychologist_id' => $request->psychologist_id,
                'fecha' => $request->date,
                'hora' => $request->time,
                'duracion' => 60, // Duración por defecto
                'motivo_consulta' => $request->reason,
                'notas' => $request->notes,
                'estado' => $estadoMap[$request->status] ?? 'pendiente',
            ]);

            $appointment->load(['student', 'psychologist']);

            return response()->json([
                'message' => 'Cita creada exitosamente',
                'appointment' => [
                    'id' => $appointment->id,
                    'user_email' => $appointment->student->email ?? 'N/A',
                    'user_name' => $appointment->student->name ?? 'N/A',
                    'psychologist_id' => $appointment->psychologist_id,
                    'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                    'date' => $appointment->fecha,
                    'time' => $appointment->hora,
                    'reason' => $appointment->motivo_consulta,
                    'notes' => $appointment->notas ?? '',
                    'status' => $appointment->estado,
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
                'user_email' => $appointment->student->email ?? 'N/A',
                'user_name' => $appointment->student->name ?? 'N/A',
                'psychologist_id' => $appointment->psychologist_id,
                'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                'date' => $appointment->fecha,
                'time' => $appointment->hora,
                'reason' => $appointment->motivo_consulta,
                'notes' => $appointment->notas ?? '',
                'status' => $appointment->estado,
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
                'user_email' => 'sometimes|required|email|exists:users,email',
                'psychologist_id' => 'sometimes|required|exists:users,id',
                'date' => 'sometimes|required|date|after_or_equal:today',
                'time' => 'sometimes|required|string',
                'reason' => 'sometimes|required|string|max:500',
                'notes' => 'nullable|string|max:1000',
                'status' => 'sometimes|required|in:pending,confirmed,completed,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            // Mapear estados del frontend a estados del backend
            $estadoMap = [
                'pending' => 'pendiente',
                'confirmed' => 'confirmada',
                'completed' => 'completada',
                'cancelled' => 'cancelada'
            ];

            $updateData = [];
            if ($request->has('date')) $updateData['fecha'] = $request->date;
            if ($request->has('time')) $updateData['hora'] = $request->time;
            if ($request->has('reason')) $updateData['motivo_consulta'] = $request->reason;
            if ($request->has('notes')) $updateData['notas'] = $request->notes;
            if ($request->has('status')) $updateData['estado'] = $estadoMap[$request->status] ?? 'pendiente';

            $appointment->update($updateData);

            $appointment->load(['student', 'psychologist']);

            return response()->json([
                'message' => 'Cita actualizada exitosamente',
                'appointment' => [
                    'id' => $appointment->id,
                    'user_email' => $appointment->student->email ?? 'N/A',
                    'user_name' => $appointment->student->name ?? 'N/A',
                    'psychologist_id' => $appointment->psychologist_id,
                    'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                    'date' => $appointment->fecha,
                    'time' => $appointment->hora,
                    'reason' => $appointment->motivo_consulta,
                    'notes' => $appointment->notas ?? '',
                    'status' => $appointment->estado,
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
                'date' => 'required|date|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            $psychologistId = $request->psychologist_id;
            $date = $request->date;

            // Verificar que el usuario sea un psicólogo activo
            $psychologist = User::where('id', $psychologistId)
                ->where('role', 'psychologist')
                ->where('active', true)
                ->first();

            if (!$psychologist) {
                return response()->json(['message' => 'Psicólogo no encontrado o inactivo'], 404);
            }

            // Horarios disponibles (de 8:00 AM a 6:00 PM)
            $availableTimes = [
                '08:00', '09:00', '10:00', '11:00', '12:00',
                '14:00', '15:00', '16:00', '17:00', '18:00'
            ];

            // Obtener citas existentes para el psicólogo en esa fecha
            $existingAppointments = Cita::where('psychologist_id', $psychologistId)
                ->where('fecha', $date)
                ->where('estado', '!=', 'cancelada')
                ->pluck('hora')
                ->toArray();

            $slots = [];
            foreach ($availableTimes as $index => $time) {
                $slots[] = [
                    'id' => $index + 1,
                    'time' => $time,
                    'available' => !in_array($time, $existingAppointments)
                ];
            }

            return response()->json($slots);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener horarios disponibles: ' . $e->getMessage()], 500);
        }
    }
} 