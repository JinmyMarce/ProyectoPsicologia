<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    public function index()
    {
        try {
            // Obtener citas del usuario autenticado
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Usuario no autenticado'], 401);
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
            return response()->json(['message' => 'Error al obtener las citas: ' . $e->getMessage()], 500);
        }
    }

    public function getAllAppointments()
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
                'reason' => 'nullable|string|max:500',
                'notes' => 'nullable|string|max:1000',
                'status' => 'required|in:pending,confirmed,completed,cancelled',
                // Datos personales del paciente
                'patient_dni' => 'required|string|size:8|regex:/^[0-9]{8}$/',
                'patient_full_name' => 'required|string|max:255',
                'patient_age' => 'required|integer|min:1|max:120',
                'patient_gender' => 'required|in:masculino,femenino,otro',
                'patient_address' => 'required|string|max:500',
                'patient_study_program' => 'required|string|max:255',
                'patient_semester' => 'required|string|max:10',
                // Datos de contacto del paciente
                'patient_phone' => 'required|string|max:20',
                'patient_email' => 'required|email|max:255',
                // Contacto de emergencia
                'emergency_contact_name' => 'required|string|max:255',
                'emergency_contact_relationship' => 'required|string|max:100',
                'emergency_contact_phone' => 'required|string|max:20',
                // Información médica (opcional)
                'medical_history' => 'nullable|string|max:1000',
                'current_medications' => 'nullable|string|max:1000',
                'allergies' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            // Verificar que no sea fin de semana (sábado = 6, domingo = 0)
            $appointmentDate = \Carbon\Carbon::parse($request->date);
            $dayOfWeek = $appointmentDate->dayOfWeek;
            
            if ($dayOfWeek === 0 || $dayOfWeek === 6) {
                return response()->json([
                    'message' => 'No se pueden agendar citas en fines de semana (sábados y domingos). Solo se atiende de lunes a viernes.',
                    'errors' => ['date' => ['No se pueden agendar citas en fines de semana']]
                ], 422);
            }

            // Validar que la hora esté entre 8:00 y 14:00 y sea un bloque de 45 minutos
            $allowedTimes = [
                '08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15'
            ];
            if (!in_array($request->time, $allowedTimes)) {
                return response()->json([
                    'message' => 'Solo se pueden agendar citas entre 8:00 y 14:00 en bloques de 45 minutos.',
                    'errors' => ['time' => ['Horario no permitido']]
                ], 422);
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
                'duracion' => 45, // Duración de 45 minutos
                'motivo_consulta' => $request->reason,
                'notas' => $request->notes,
                'estado' => 'pendiente', // Siempre pendiente hasta que el psicólogo apruebe
                // Datos personales del paciente
                'patient_dni' => $request->patient_dni,
                'patient_full_name' => $request->patient_full_name,
                'patient_age' => $request->patient_age,
                'patient_gender' => $request->patient_gender,
                'patient_address' => $request->patient_address,
                'patient_study_program' => $request->patient_study_program,
                'patient_semester' => $request->patient_semester,
                // Datos de contacto del paciente
                'patient_phone' => $request->patient_phone,
                'patient_email' => $request->patient_email,
                // Contacto de emergencia
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_relationship' => $request->emergency_contact_relationship,
                'emergency_contact_phone' => $request->emergency_contact_phone,
                // Información médica
                'medical_history' => $request->medical_history,
                'current_medications' => $request->current_medications,
                'allergies' => $request->allergies,
            ]);

            $appointment->load(['student', 'psychologist']);

            // Notificar al psicólogo que tiene una cita pendiente de aprobar
            try {
                \App\Models\Notification::create([
                    'user_id' => $psychologist->id,
                    'type' => 'appointment',
                    'title' => 'Nueva cita pendiente',
                    'message' => "Tienes una nueva cita pendiente de aprobación para el estudiante {$user->name} ({$user->email}) el día {$appointment->fecha} a las {$appointment->hora}.",
                    'read' => false,
                    'data' => [
                        'appointment_id' => $appointment->id,
                        'student_name' => $user->name,
                        'student_email' => $user->email,
                        'date' => $appointment->fecha,
                        'time' => $appointment->hora
                    ]
                ]);
            } catch (\Exception $e) {
                Log::error('Error enviando notificación al psicólogo: ' . $e->getMessage());
            }

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
                    // Datos del paciente
                    'patient_dni' => $appointment->patient_dni,
                    'patient_full_name' => $appointment->patient_full_name,
                    'patient_age' => $appointment->patient_age,
                    'patient_gender' => $appointment->patient_gender,
                    'patient_address' => $appointment->patient_address,
                    'patient_phone' => $appointment->patient_phone,
                    'patient_email' => $appointment->patient_email,
                    'emergency_contact_name' => $appointment->emergency_contact_name,
                    'emergency_contact_relationship' => $appointment->emergency_contact_relationship,
                    'emergency_contact_phone' => $appointment->emergency_contact_phone,
                    'medical_history' => $appointment->medical_history,
                    'current_medications' => $appointment->current_medications,
                    'allergies' => $appointment->allergies,
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

    // Aprobar cita (psicólogo)
    public function approve($id)
    {
        try {
            $appointment = Cita::with(['student', 'psychologist'])->find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            if ($appointment->estado !== 'pendiente') {
                return response()->json(['message' => 'Solo se pueden aprobar citas pendientes'], 422);
            }

            $appointment->update(['estado' => 'confirmada']);

            // Enviar notificación al estudiante
            try {
                $notificationController = new \App\Http\Controllers\Api\NotificationController();
                $notificationController->sendAppointmentApproved($id);
            } catch (\Exception $e) {
                // Log del error pero no fallar la operación
                Log::error('Error enviando notificación de aprobación: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Cita aprobada exitosamente',
                'appointment' => [
                    'id' => $appointment->id,
                    'student_name' => $appointment->student->name ?? 'N/A',
                    'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                    'date' => $appointment->fecha,
                    'time' => $appointment->hora,
                    'status' => $appointment->estado
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al aprobar la cita: ' . $e->getMessage()], 500);
        }
    }

    // Rechazar cita (psicólogo)
    public function reject($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
            }

            $appointment = Cita::with(['student', 'psychologist'])->find($id);
            
            if (!$appointment) {
                return response()->json(['message' => 'Cita no encontrada'], 404);
            }

            if ($appointment->estado !== 'pendiente') {
                return response()->json(['message' => 'Solo se pueden rechazar citas pendientes'], 422);
            }

            $appointment->update([
                'estado' => 'rechazada',
                'notas' => 'Rechazada: ' . $request->reason
            ]);

            // Enviar notificación al estudiante
            try {
                $notificationController = new \App\Http\Controllers\Api\NotificationController();
                $notificationController->sendAppointmentRejected($id, $request);
            } catch (\Exception $e) {
                // Log del error pero no fallar la operación
                Log::error('Error enviando notificación de rechazo: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Cita rechazada exitosamente',
                'appointment' => [
                    'id' => $appointment->id,
                    'student_name' => $appointment->student->name ?? 'N/A',
                    'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                    'date' => $appointment->fecha,
                    'time' => $appointment->hora,
                    'status' => $appointment->estado,
                    'rejection_reason' => $request->reason
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al rechazar la cita: ' . $e->getMessage()], 500);
        }
    }

    // Obtener citas pendientes para psicólogo
    public function getPendingAppointments()
    {
        try {
            $appointments = Cita::with(['student', 'psychologist'])
                ->where('estado', 'pendiente')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'student_name' => $appointment->student->name ?? 'N/A',
                        'student_email' => $appointment->student->email ?? 'N/A',
                        'psychologist_name' => $appointment->psychologist->name ?? 'N/A',
                        'date' => $appointment->fecha,
                        'time' => $appointment->hora,
                        'reason' => $appointment->motivo_consulta,
                        'status' => $appointment->estado,
                        'created_at' => $appointment->created_at,
                        // Datos del paciente
                        'patient_dni' => $appointment->patient_dni,
                        'patient_full_name' => $appointment->patient_full_name,
                        'patient_age' => $appointment->patient_age,
                        'patient_gender' => $appointment->patient_gender,
                        'patient_address' => $appointment->patient_address,
                        'patient_study_program' => $appointment->patient_study_program,
                        'patient_semester' => $appointment->patient_semester,
                        'patient_phone' => $appointment->patient_phone,
                        'patient_email' => $appointment->patient_email,
                        'emergency_contact_name' => $appointment->emergency_contact_name,
                        'emergency_contact_relationship' => $appointment->emergency_contact_relationship,
                        'emergency_contact_phone' => $appointment->emergency_contact_phone,
                        'medical_history' => $appointment->medical_history,
                        'current_medications' => $appointment->current_medications,
                        'allergies' => $appointment->allergies,
                    ];
                });

            return response()->json($appointments);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener las citas pendientes: ' . $e->getMessage()], 500);
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

            // Configurar zona horaria de Perú
            date_default_timezone_set('America/Lima');
            
            // Verificar que no sea un día pasado usando zona horaria de Perú
            $today = now()->format('Y-m-d');
            if ($date < $today) {
                // Para días pasados, devolver array vacío en lugar de error
                return response()->json([]);
            }

            // Verificar que sea lunes a viernes (1 = lunes, 7 = domingo) usando zona horaria de Perú
            $dayOfWeek = date('N', strtotime($date));
            if ($dayOfWeek > 5) {
                // Para fines de semana, devolver array vacío en lugar de error
                return response()->json([]);
            }

            // Horarios disponibles de 8:00 AM a 2:00 PM (14:00) con intervalos de 45 minutos
            $availableTimes = [
                '08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15'
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