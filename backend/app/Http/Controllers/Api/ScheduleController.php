<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Obtener horarios bloqueados del psicólogo
     */
    public function getBlockedSchedules(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'psychologist_id' => 'required|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $psychologistId = $request->psychologist_id;
            $startDate = $request->start_date;
            $endDate = $request->end_date;

            // Obtener horarios bloqueados de la base de datos
            $blockedSchedules = DB::table('blocked_schedules')
                ->where('psychologist_id', $psychologistId)
                ->whereBetween('date', [$startDate, $endDate])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $blockedSchedules
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener horarios bloqueados: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un bloqueo de horario
     */
    public function createScheduleBlock(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'psychologist_id' => 'required|integer',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'is_full_day_blocked' => 'required|boolean',
            'reason' => 'required|string|max:500', // Aumentado para motivos más largos
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $psychologistId = $request->psychologist_id;
            $date = $request->date;
            $startTime = $request->start_time;
            $endTime = $request->end_time;
            $isFullDayBlocked = $request->is_full_day_blocked;
            $reason = $request->reason;

            // Verificar que la fecha no sea fin de semana
            $dayOfWeek = Carbon::parse($date)->dayOfWeek;
            if ($dayOfWeek === 0 || $dayOfWeek === 6) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pueden bloquear horarios en fines de semana'
                ], 422);
            }

            // Verificar que las horas estén dentro del horario de atención (8:00 - 14:00)
            if (!$isFullDayBlocked && ($startTime || $endTime)) {
                $startHour = $startTime ? (int)substr($startTime, 0, 2) : 8;
                $endHour = $endTime ? (int)substr($endTime, 0, 2) : 14;
                $endMinute = $endTime ? (int)substr($endTime, 3, 2) : 0;
                
                if ($startHour < 8 || $endHour > 14 || ($endHour === 14 && $endMinute > 0)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El horario debe estar entre 8:00 AM y 2:00 PM'
                    ], 422);
                }
            }

            // Contar citas afectadas
            $affectedAppointments = 0;
            if ($isFullDayBlocked) {
                $affectedAppointments = DB::table('citas')
                    ->where('psychologist_id', $psychologistId)
                    ->where('fecha', $date)
                    ->where('status', '!=', 'cancelada')
                    ->count();
            } else if ($startTime && $endTime) {
                $affectedAppointments = DB::table('citas')
                    ->where('psychologist_id', $psychologistId)
                    ->where('fecha', $date)
                    ->where('hora', '>=', $startTime)
                    ->where('hora', '<', $endTime)
                    ->where('status', '!=', 'cancelada')
                    ->count();
            }

            // Crear el bloqueo
            $blockId = DB::table('blocked_schedules')->insertGetId([
                'psychologist_id' => $psychologistId,
                'date' => $date,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'is_full_day_blocked' => $isFullDayBlocked,
                'reason' => $reason,
                'affected_appointments' => $affectedAppointments,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Si hay citas afectadas, cancelarlas automáticamente
            if ($affectedAppointments > 0) {
                if ($isFullDayBlocked) {
                    DB::table('citas')
                        ->where('psychologist_id', $psychologistId)
                        ->where('fecha', $date)
                        ->where('status', '!=', 'cancelada')
                        ->update([
                            'status' => 'cancelada',
                            'motivo_cancelacion' => 'Horario bloqueado por psicólogo: ' . $reason,
                            'updated_at' => now()
                        ]);
                } else if ($startTime && $endTime) {
                    DB::table('citas')
                        ->where('psychologist_id', $psychologistId)
                        ->where('fecha', $date)
                        ->where('hora', '>=', $startTime)
                        ->where('hora', '<', $endTime)
                        ->where('status', '!=', 'cancelada')
                        ->update([
                            'status' => 'cancelada',
                            'motivo_cancelacion' => 'Horario bloqueado por psicólogo: ' . $reason,
                            'updated_at' => now()
                        ]);
                }
            }

            $blockedSchedule = DB::table('blocked_schedules')->find($blockId);

            return response()->json([
                'success' => true,
                'message' => 'Horario bloqueado exitosamente',
                'data' => $blockedSchedule
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear bloqueo de horario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un bloqueo de horario
     */
    public function removeScheduleBlock($blockId): JsonResponse
    {
        try {
            $blockedSchedule = DB::table('blocked_schedules')->find($blockId);
            
            if (!$blockedSchedule) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bloqueo de horario no encontrado'
                ], 404);
            }

            DB::table('blocked_schedules')->where('id', $blockId)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Bloqueo de horario eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar bloqueo de horario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener disponibilidad para una fecha específica
     */
    public function getAvailabilityForDate(Request $request, $date): JsonResponse
    {
        $validator = Validator::make(['date' => $date], [
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Fecha inválida',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $psychologistId = $request->query('psychologist_id', 1);

            // Verificar si es fin de semana
            $dayOfWeek = Carbon::parse($date)->dayOfWeek;
            $isWeekend = $dayOfWeek === 0 || $dayOfWeek === 6;

            if ($isWeekend) {
                            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $date,
                    'day_name' => Carbon::parse($date)->format('l'),
                    'is_full_day_blocked' => true,
                    'full_day_reason' => 'Fin de semana',
                    'blocks' => []
                ]
            ]);
            }

            // Generar bloques exactos de 45 minutos de 8:00 a 14:00
            $blocks = [];
            $timeSlots = [
                ['start' => '08:00', 'end' => '08:45'],
                ['start' => '08:45', 'end' => '09:30'],
                ['start' => '09:30', 'end' => '10:15'],
                ['start' => '10:15', 'end' => '11:00'],
                ['start' => '11:00', 'end' => '11:45'],
                ['start' => '11:45', 'end' => '12:30'],
                ['start' => '12:30', 'end' => '13:15'],
                ['start' => '13:15', 'end' => '14:00']
            ];

            foreach ($timeSlots as $slot) {
                $startTime = $slot['start'];
                $endTime = $slot['end'];

                // Verificar si hay cita en este bloque
                $hasAppointment = DB::table('citas')
                    ->where('psychologist_id', $psychologistId)
                    ->where('fecha', $date)
                    ->where('hora', $startTime)
                    ->where('status', '!=', 'cancelada')
                    ->exists();

                // Verificar si el bloque está bloqueado
                $isBlocked = DB::table('blocked_schedules')
                    ->where('psychologist_id', $psychologistId)
                    ->where('date', $date)
                    ->where(function ($query) use ($startTime, $endTime) {
                        $query->where('is_full_day_blocked', true)
                              ->orWhere(function ($q) use ($startTime, $endTime) {
                                  $q->where('start_time', '<=', $startTime)
                                    ->where('end_time', '>', $startTime);
                              });
                    })
                    ->exists();

                $blocks[] = [
                    'id' => $startTime . '-' . $endTime,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'is_available' => !$isBlocked,
                    'has_appointment' => $hasAppointment,
                    'is_blocked' => $isBlocked,
                    'reason' => $isBlocked ? 'Horario bloqueado' : null
                ];
            }

            // Verificar si todo el día está bloqueado
            $fullDayBlocked = DB::table('blocked_schedules')
                ->where('psychologist_id', $psychologistId)
                ->where('date', $date)
                ->where('is_full_day_blocked', true)
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $date,
                    'day_name' => Carbon::parse($date)->format('l'),
                    'is_full_day_blocked' => $fullDayBlocked ? true : false,
                    'full_day_reason' => $fullDayBlocked ? $fullDayBlocked->reason : null,
                    'blocks' => $blocks
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en getAvailabilityForDate: ' . $e->getMessage(), [
                'date' => $date,
                'psychologist_id' => $request->query('psychologist_id'),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener disponibilidad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar si una fecha/hora está disponible para agendar
     */
    public function checkSlotAvailability(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'psychologist_id' => 'required|integer',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $psychologistId = $request->psychologist_id;
            $date = $request->date;
            $time = $request->time;

            // Verificar que la fecha no sea fin de semana
            $dayOfWeek = Carbon::parse($date)->dayOfWeek;
            if ($dayOfWeek === 0 || $dayOfWeek === 6) {
                return response()->json([
                    'success' => false,
                    'data' => [
                        'available' => false,
                        'reason' => 'No se atiende en fines de semana'
                    ]
                ]);
            }

            // Verificar que la hora esté dentro del horario de atención
            $hour = (int)substr($time, 0, 2);
            $minute = (int)substr($time, 3, 2);
            
            if ($hour < 8 || $hour > 14 || ($hour === 14 && $minute > 0)) {
                return response()->json([
                    'success' => false,
                    'data' => [
                        'available' => false,
                        'reason' => 'Horario fuera del rango de atención (8:00 AM - 2:00 PM)'
                    ]
                ]);
            }

            // Verificar si hay cita en este horario
            $hasAppointment = DB::table('citas')
                ->where('psychologist_id', $psychologistId)
                ->where('fecha', $date)
                ->where('hora', $time)
                ->where('status', '!=', 'cancelada')
                ->exists();

            if ($hasAppointment) {
                return response()->json([
                    'success' => false,
                    'data' => [
                        'available' => false,
                        'reason' => 'Ya existe una cita en este horario'
                    ]
                ]);
            }

            // Verificar si el horario está bloqueado
            $isBlocked = DB::table('blocked_schedules')
                ->where('psychologist_id', $psychologistId)
                ->where('date', $date)
                ->where(function ($query) use ($time) {
                    $query->where('is_full_day_blocked', true)
                          ->orWhere(function ($q) use ($time) {
                              $q->where('start_time', '<=', $time)
                                ->where('end_time', '>', $time);
                          });
                })
                ->exists();

            if ($isBlocked) {
                $blockedSchedule = DB::table('blocked_schedules')
                    ->where('psychologist_id', $psychologistId)
                    ->where('date', $date)
                    ->where(function ($query) use ($time) {
                        $query->where('is_full_day_blocked', true)
                              ->orWhere(function ($q) use ($time) {
                                  $q->where('start_time', '<=', $time)
                                    ->where('end_time', '>', $time);
                              });
                    })
                    ->first();

                return response()->json([
                    'success' => false,
                    'data' => [
                        'available' => false,
                        'reason' => 'Horario bloqueado: ' . $blockedSchedule->reason
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'available' => true
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar disponibilidad: ' . $e->getMessage()
            ], 500);
        }
    }
} 