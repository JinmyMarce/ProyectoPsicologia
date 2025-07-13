<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function getPsychologistSchedule($psychologistId, Request $request)
    {
        $query = Schedule::where('psychologist_id', $psychologistId);

        // Filtros
        if ($request->has('date_from') && $request->date_from) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('date', '<=', $request->date_to);
        }

        if ($request->has('is_available') && $request->is_available !== null) {
            $query->where('is_available', $request->is_available);
        }

        if ($request->has('is_blocked') && $request->is_blocked !== null) {
            $query->where('is_blocked', $request->is_blocked);
        }

        $schedules = $query->orderBy('date')->orderBy('start_time')->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function getAvailableSlots($psychologistId, Request $request)
    {
        $date = $request->get('date', Carbon::today()->format('Y-m-d'));

        $availableSlots = Schedule::where('psychologist_id', $psychologistId)
            ->where('date', $date)
            ->where('is_available', true)
            ->where('is_blocked', false)
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availableSlots
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'psychologist_id' => 'required|exists:users,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar conflictos
        $conflicts = Schedule::where('psychologist_id', $request->psychologist_id)
            ->where('date', $request->date)
            ->where(function($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                      ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                      ->orWhere(function($q) use ($request) {
                          $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                      });
            })
            ->exists();

        if ($conflicts) {
            return response()->json([
                'success' => false,
                'message' => 'Existe un conflicto de horarios para esta fecha y hora'
            ], 400);
        }

        $schedule = Schedule::create([
            'psychologist_id' => $request->psychologist_id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'is_available' => $request->is_available ?? true,
            'is_blocked' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Horario creado exitosamente',
            'data' => $schedule
        ], 201);
    }

    public function storeBulk(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedules' => 'required|array|min:1',
            'schedules.*.psychologist_id' => 'required|exists:users,id',
            'schedules.*.date' => 'required|date|after_or_equal:today',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
            'schedules.*.is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $createdSchedules = [];
        $errors = [];

        foreach ($request->schedules as $index => $scheduleData) {
            try {
                // Verificar conflictos
                $conflicts = Schedule::where('psychologist_id', $scheduleData['psychologist_id'])
                    ->where('date', $scheduleData['date'])
                    ->where(function($query) use ($scheduleData) {
                        $query->whereBetween('start_time', [$scheduleData['start_time'], $scheduleData['end_time']])
                              ->orWhereBetween('end_time', [$scheduleData['start_time'], $scheduleData['end_time']])
                              ->orWhere(function($q) use ($scheduleData) {
                                  $q->where('start_time', '<=', $scheduleData['start_time'])
                                    ->where('end_time', '>=', $scheduleData['end_time']);
                              });
                    })
                    ->exists();

                if ($conflicts) {
                    $errors[] = "Conflicto en el horario " . ($index + 1);
                    continue;
                }

                $schedule = Schedule::create([
                    'psychologist_id' => $scheduleData['psychologist_id'],
                    'date' => $scheduleData['date'],
                    'start_time' => $scheduleData['start_time'],
                    'end_time' => $scheduleData['end_time'],
                    'is_available' => $scheduleData['is_available'] ?? true,
                    'is_blocked' => false,
                ]);

                $createdSchedules[] = $schedule;
            } catch (\Exception $e) {
                $errors[] = "Error en el horario " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => true,
            'message' => count($createdSchedules) . ' horarios creados exitosamente',
            'data' => $createdSchedules,
            'errors' => $errors
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'is_available' => 'boolean',
            'is_blocked' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar conflictos si se cambia la hora
        if ($request->has('start_time') || $request->has('end_time')) {
            $startTime = $request->get('start_time', $schedule->start_time);
            $endTime = $request->get('end_time', $schedule->end_time);

            $conflicts = Schedule::where('psychologist_id', $schedule->psychologist_id)
                ->where('date', $schedule->date)
                ->where('id', '!=', $id)
                ->where(function($query) use ($startTime, $endTime) {
                    $query->whereBetween('start_time', [$startTime, $endTime])
                          ->orWhereBetween('end_time', [$startTime, $endTime])
                          ->orWhere(function($q) use ($startTime, $endTime) {
                              $q->where('start_time', '<=', $startTime)
                                ->where('end_time', '>=', $endTime);
                          });
                })
                ->exists();

            if ($conflicts) {
                return response()->json([
                    'success' => false,
                    'message' => 'Existe un conflicto de horarios para esta fecha y hora'
                ], 400);
            }
        }

        $schedule->update($request->only(['start_time', 'end_time', 'is_available', 'is_blocked']));

        return response()->json([
            'success' => true,
            'message' => 'Horario actualizado exitosamente',
            'data' => $schedule
        ]);
    }

    public function destroy($id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado'
            ], 404);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Horario eliminado exitosamente'
        ]);
    }

    public function block(Request $request, $id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $schedule->update([
            'is_blocked' => true,
            'block_reason' => $request->reason
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Horario bloqueado exitosamente'
        ]);
    }

    public function unblock($id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado'
            ], 404);
        }

        $schedule->update([
            'is_blocked' => false,
            'block_reason' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Horario desbloqueado exitosamente'
        ]);
    }

    public function getByDate(Request $request)
    {
        $date = $request->get('date', Carbon::today()->format('Y-m-d'));
        $psychologistId = $request->get('psychologist_id');

        $query = Schedule::where('date', $date);

        if ($psychologistId) {
            $query->where('psychologist_id', $psychologistId);
        }

        $schedules = $query->with('psychologist')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function getByDateRange(Request $request)
    {
        $dateFrom = $request->get('date_from', Carbon::today()->format('Y-m-d'));
        $dateTo = $request->get('date_to', Carbon::today()->addDays(7)->format('Y-m-d'));
        $psychologistId = $request->get('psychologist_id');

        $query = Schedule::whereBetween('date', [$dateFrom, $dateTo]);

        if ($psychologistId) {
            $query->where('psychologist_id', $psychologistId);
        }

        $schedules = $query->with('psychologist')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function getConflicts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'psychologist_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $conflicts = Schedule::where('psychologist_id', $request->psychologist_id)
            ->where('date', $request->date)
            ->where(function($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                      ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                      ->orWhere(function($q) use ($request) {
                          $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                      });
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $conflicts
        ]);
    }

    public function stats(Request $request)
    {
        $psychologistId = $request->get('psychologist_id');
        $dateFrom = $request->get('date_from', Carbon::now()->startOfMonth());
        $dateTo = $request->get('date_to', Carbon::now()->endOfMonth());

        $query = Schedule::whereBetween('date', [$dateFrom, $dateTo]);

        if ($psychologistId) {
            $query->where('psychologist_id', $psychologistId);
        }

        $stats = [
            'total_slots' => $query->count(),
            'available_slots' => $query->where('is_available', true)->count(),
            'blocked_slots' => $query->where('is_blocked', true)->count(),
            'booked_slots' => $query->where('is_available', false)->where('is_blocked', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls',
            'psychologist_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Aquí se implementaría la lógica de importación
        // Por ahora solo simulamos la respuesta

        return response()->json([
            'success' => true,
            'message' => 'Horarios importados exitosamente'
        ]);
    }

    public function export(Request $request)
    {
        $format = $request->get('format', 'csv');
        $psychologistId = $request->get('psychologist_id');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = Schedule::with('psychologist');

        if ($psychologistId) {
            $query->where('psychologist_id', $psychologistId);
        }

        if ($dateFrom) {
            $query->where('date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('date', '<=', $dateTo);
        }

        $schedules = $query->get();

        // Aquí se implementaría la lógica de exportación
        // Por ahora solo simulamos la respuesta

        return response()->json([
            'success' => true,
            'message' => 'Horarios exportados exitosamente',
            'download_url' => '/schedule/download/mock-export.' . $format
        ]);
    }

    /**
     * Obtener horarios del psicólogo autenticado
     */
    public function getMySchedule(Request $request)
    {
        $psychologist = Auth::user();
        
        if (!$psychologist->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo psicólogos pueden acceder.'
            ], 403);
        }

        $query = Schedule::where('psychologist_id', $psychologist->id);

        // Filtros
        if ($request->has('date_from') && $request->date_from) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('date', '<=', $request->date_to);
        }

        if ($request->has('is_available') && $request->is_available !== null) {
            $query->where('is_available', $request->is_available);
        }

        if ($request->has('is_blocked') && $request->is_blocked !== null) {
            $query->where('is_blocked', $request->is_blocked);
        }

        $schedules = $query->orderBy('date')->orderBy('start_time')->get();

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    /**
     * Crear horario para el psicólogo autenticado
     */
    public function createMySchedule(Request $request)
    {
        $psychologist = Auth::user();
        
        if (!$psychologist->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo psicólogos pueden crear horarios.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_available' => 'boolean',
            'block_reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar conflictos
        $conflicts = Schedule::where('psychologist_id', $psychologist->id)
            ->where('date', $request->date)
            ->where(function($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                      ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                      ->orWhere(function($q) use ($request) {
                          $q->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                      });
            })
            ->exists();

        if ($conflicts) {
            return response()->json([
                'success' => false,
                'message' => 'Existe un conflicto de horarios para esta fecha y hora'
            ], 400);
        }

        $schedule = Schedule::create([
            'psychologist_id' => $psychologist->id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'is_available' => $request->is_available ?? true,
            'is_blocked' => $request->has('block_reason'),
            'block_reason' => $request->block_reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Horario creado exitosamente',
            'data' => $schedule
        ], 201);
    }

    /**
     * Bloquear horario del psicólogo autenticado
     */
    public function blockMySchedule(Request $request, $id)
    {
        $psychologist = Auth::user();
        
        if (!$psychologist->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo psicólogos pueden bloquear horarios.'
            ], 403);
        }

        $schedule = Schedule::where('id', $id)
            ->where('psychologist_id', $psychologist->id)
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $schedule->update([
            'is_blocked' => true,
            'block_reason' => $request->reason
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Horario bloqueado exitosamente'
        ]);
    }

    /**
     * Desbloquear horario del psicólogo autenticado
     */
    public function unblockMySchedule($id)
    {
        $psychologist = Auth::user();
        
        if (!$psychologist->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo psicólogos pueden desbloquear horarios.'
            ], 403);
        }

        $schedule = Schedule::where('id', $id)
            ->where('psychologist_id', $psychologist->id)
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado'
            ], 404);
        }

        $schedule->update([
            'is_blocked' => false,
            'block_reason' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Horario desbloqueado exitosamente'
        ]);
    }

    /**
     * Eliminar horario del psicólogo autenticado
     */
    public function deleteMySchedule($id)
    {
        $psychologist = Auth::user();
        
        if (!$psychologist->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo psicólogos pueden eliminar horarios.'
            ], 403);
        }

        $schedule = Schedule::where('id', $id)
            ->where('psychologist_id', $psychologist->id)
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado'
            ], 404);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Horario eliminado exitosamente'
        ]);
    }

    /**
     * Obtener estadísticas de horarios del psicólogo autenticado
     */
    public function getMyScheduleStats(Request $request)
    {
        $psychologist = Auth::user();
        
        if (!$psychologist->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo psicólogos pueden acceder.'
            ], 403);
        }

        $dateFrom = $request->get('date_from', Carbon::now()->startOfMonth());
        $dateTo = $request->get('date_to', Carbon::now()->endOfMonth());

        $query = Schedule::where('psychologist_id', $psychologist->id)
            ->whereBetween('date', [$dateFrom, $dateTo]);

        $stats = [
            'total_slots' => $query->count(),
            'available_slots' => $query->where('is_available', true)->count(),
            'blocked_slots' => $query->where('is_blocked', true)->count(),
            'booked_slots' => $query->where('is_available', false)->where('is_blocked', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
} 