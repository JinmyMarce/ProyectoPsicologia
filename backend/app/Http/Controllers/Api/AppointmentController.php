<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
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
            $appointments = Appointment::with(['user', 'psychologist'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'user_email' => $appointment->user_email,
                        'user_name' => $appointment->user->name ?? 'N/A',
                        'psychologist_id' => $appointment->psychologist_id,
                        'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                        'date' => $appointment->date,
                        'time' => $appointment->time,
                        'reason' => $appointment->reason,
                        'notes' => $appointment->notes,
                        'status' => $appointment->status,
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
            $appointments = Appointment::with(['user', 'psychologist'])
                ->where('user_email', $userEmail)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'user_email' => $appointment->user_email,
                        'user_name' => $appointment->user->name ?? 'N/A',
                        'psychologist_id' => $appointment->psychologist_id,
                        'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                        'date' => $appointment->date,
                        'time' => $appointment->time,
                        'reason' => $appointment->reason,
                        'notes' => $appointment->notes,
                        'status' => $appointment->status,
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
                'psychologist_id' => 'required|exists:psychologists,id',
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

            // Verificar si el psicólogo existe
            $psychologist = Psychologist::find($request->psychologist_id);
            if (!$psychologist) {
                return response()->json(['message' => 'Psicólogo no encontrado'], 404);
            }

            // Verificar si ya existe una cita para el mismo usuario, psicólogo, fecha y hora
            $existingAppointment = Appointment::where('user_email', $request->user_email)
                ->where('psychologist_id', $request->psychologist_id)
                ->where('date', $request->date)
                ->where('time', $request->time)
                ->where('status', '!=', 'cancelled')
                ->first();

            if ($existingAppointment) {
                return response()->json(['message' => 'Ya existe una cita para esta fecha y hora'], 409);
            }

            // Verificar si el horario está disponible
            $conflictingAppointment = Appointment::where('psychologist_id', $request->psychologist_id)
                ->where('date', $request->date)
                ->where('time', $request->time)
                ->where('status', '!=', 'cancelled')
                ->first();

            if ($conflictingAppointment) {
                return response()->json(['message' => 'Este horario no está disponible'], 409);
            }

            $appointment = Appointment::create([
                'user_email' => $request->user_email,
                'psychologist_id' => $request->psychologist_id,
                'date' => $request->date,
                'time' => $request->time,
                'reason' => $request->reason,
                'notes' => $request->notes,
                'status' => $request->status,
            ]);

            $appointment->load(['user', 'psychologist']);

            return response()->json([
                'message' => 'Cita creada exitosamente',
                'appointment' => [
                    'id' => $appointment->id,
                    'user_email' => $appointment->user_email,
                    'user_name' => $appointment->user->name ?? 'N/A',
                    'psychologist_id' => $appointment->psychologist_id,
                    'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                    'date' => $appointment->date,
                    'time' => $appointment->time,
                    'reason' => $appointment->reason,
                    'notes' => $appointment->notes,
                    'status' => $appointment->status,
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
            $appointment = Appointment::with(['user', 'psychologist'])->find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            return response()->json([
                'id' => $appointment->id,
                'user_email' => $appointment->user_email,
                'user_name' => $appointment->user->name ?? 'N/A',
                'psychologist_id' => $appointment->psychologist_id,
                'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                'date' => $appointment->date,
                'time' => $appointment->time,
                'reason' => $appointment->reason,
                'notes' => $appointment->notes,
                'status' => $appointment->status,
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
            $appointment = Appointment::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $validator = Validator::make($request->all(), [
                'user_email' => 'sometimes|required|email|exists:users,email',
                'psychologist_id' => 'sometimes|required|exists:psychologists,id',
                'date' => 'sometimes|required|date|after_or_equal:today',
                'time' => 'sometimes|required|string',
                'reason' => 'sometimes|required|string|max:500',
                'notes' => 'nullable|string|max:1000',
                'status' => 'sometimes|required|in:pending,confirmed,completed,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            $appointment->update($request->only([
                'user_email', 'psychologist_id', 'date', 'time', 'reason', 'notes', 'status'
            ]));

            $appointment->load(['user', 'psychologist']);

            return response()->json([
                'message' => 'Cita actualizada exitosamente',
                'appointment' => [
                    'id' => $appointment->id,
                    'user_email' => $appointment->user_email,
                    'user_name' => $appointment->user->name ?? 'N/A',
                    'psychologist_id' => $appointment->psychologist_id,
                    'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                    'date' => $appointment->date,
                    'time' => $appointment->time,
                    'reason' => $appointment->reason,
                    'notes' => $appointment->notes,
                    'status' => $appointment->status,
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
            $appointment = Appointment::find($id);
            
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
            $appointment = Appointment::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $appointment->update(['status' => 'confirmed']);

            return response()->json(['message' => 'Cita confirmada exitosamente']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al confirmar la cita: ' . $e->getMessage()], 500);
        }
    }

    public function cancel($id)
    {
        try {
            $appointment = Appointment::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $appointment->update(['status' => 'cancelled']);

            return response()->json(['message' => 'Cita cancelada exitosamente']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al cancelar la cita: ' . $e->getMessage()], 500);
        }
    }

    public function complete($id)
    {
        try {
            $appointment = Appointment::find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            $appointment->update(['status' => 'completed']);

            return response()->json(['message' => 'Cita completada exitosamente']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al completar la cita: ' . $e->getMessage()], 500);
        }
    }

    public function getAvailableSlots(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'psychologist_id' => 'required|exists:psychologists,id',
                'date' => 'required|date|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            $psychologistId = $request->psychologist_id;
            $date = $request->date;

            // Horarios disponibles (de 8:00 AM a 6:00 PM)
            $availableTimes = [
                '08:00', '09:00', '10:00', '11:00', '12:00',
                '14:00', '15:00', '16:00', '17:00', '18:00'
            ];

            // Obtener citas existentes para el psicólogo en esa fecha
            $existingAppointments = Appointment::where('psychologist_id', $psychologistId)
                ->where('date', $date)
                ->where('status', '!=', 'cancelled')
                ->pluck('time')
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