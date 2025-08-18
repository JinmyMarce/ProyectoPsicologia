<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Services\HolidayCalculatorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Validation\Rule;

class HolidayController extends Controller
{
    private HolidayCalculatorService $holidayCalculator;

    public function __construct(HolidayCalculatorService $holidayCalculator)
    {
        $this->holidayCalculator = $holidayCalculator;
    }
    /**
     * Obtener todos los feriados con filtros opcionales
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Holiday::active();

            // Filtro por año
            if ($request->has('year')) {
                $query->forYear($request->year);
            } else {
                // Por defecto el año actual
                $query->forYear(date('Y'));
            }

            // Filtro por región
            if ($request->has('region')) {
                $query->forRegion($request->region);
            } else {
                $query->national();
            }

            // Filtro por tipo
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Filtro por rango de fechas
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->inDateRange($request->start_date, $request->end_date);
            }

            // Ordenamiento
            $query->orderBy('date', 'asc');

            $holidays = $query->get();

            return response()->json([
                'success' => true,
                'message' => 'Feriados obtenidos exitosamente',
                'data' => $holidays->map(function ($holiday) {
                    return [
                        'id' => $holiday->id,
                        'name' => $holiday->name,
                        'date' => $holiday->date->format('Y-m-d'),
                        'formatted_date' => $holiday->formatted_date,
                        'formatted_date_full' => $holiday->formatted_date_full,
                        'type' => $holiday->type,
                        'description' => $holiday->description,
                        'is_national' => $holiday->is_national,
                        'is_regional' => $holiday->is_regional,
                        'region' => $holiday->region,
                        'year' => $holiday->year,
                        'is_today' => $holiday->isToday(),
                        'is_past' => $holiday->isPast(),
                        'is_future' => $holiday->isFuture(),
                        'days_until' => $holiday->daysUntil()
                    ];
                }),
                'meta' => [
                    'total' => $holidays->count(),
                    'year' => $request->get('year', date('Y')),
                    'region' => $request->get('region', 'Nacional')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los feriados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener próximos feriados
     */
    public function upcoming(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'days' => 'nullable|integer|min:1|max:365',
                'region' => 'nullable|string|max:100'
            ]);

            $days = $request->get('days', 30);
            $region = $request->get('region');

            $holidays = Holiday::getUpcomingHolidays($days, $region);

            return response()->json([
                'success' => true,
                'message' => 'Próximos feriados obtenidos exitosamente',
                'data' => $holidays->map(function ($holiday) {
                    return [
                        'id' => $holiday->id,
                        'name' => $holiday->name,
                        'date' => $holiday->date->format('Y-m-d'),
                        'formatted_date' => $holiday->formatted_date,
                        'formatted_date_full' => $holiday->formatted_date_full,
                        'type' => $holiday->type,
                        'description' => $holiday->description,
                        'is_national' => $holiday->is_national,
                        'region' => $holiday->region,
                        'days_until' => $holiday->daysUntil()
                    ];
                }),
                'meta' => [
                    'total' => $holidays->count(),
                    'days_ahead' => $days,
                    'region' => $region ?? 'Nacional'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los próximos feriados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar si una fecha específica es feriado
     */
    public function checkDate(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date' => 'required|date',
                'region' => 'nullable|string|max:100'
            ]);

            $date = $request->date;
            $region = $request->get('region');

            $holiday = Holiday::getHolidayByDate($date, $region);

            return response()->json([
                'success' => true,
                'message' => $holiday ? 'La fecha es un feriado' : 'La fecha no es un feriado',
                'data' => [
                    'date' => $date,
                    'is_holiday' => !is_null($holiday),
                    'holiday' => $holiday ? [
                        'id' => $holiday->id,
                        'name' => $holiday->name,
                        'type' => $holiday->type,
                        'description' => $holiday->description,
                        'is_national' => $holiday->is_national,
                        'region' => $holiday->region
                    ] : null
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar la fecha',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener feriados en un rango de fechas
     */
    public function getInRange(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'region' => 'nullable|string|max:100'
            ]);

            $startDate = $request->start_date;
            $endDate = $request->end_date;
            $region = $request->get('region');

            $holidays = Holiday::getHolidaysInRange($startDate, $endDate, $region);

            return response()->json([
                'success' => true,
                'message' => 'Feriados en el rango obtenidos exitosamente',
                'data' => $holidays->map(function ($holiday) {
                    return [
                        'id' => $holiday->id,
                        'name' => $holiday->name,
                        'date' => $holiday->date->format('Y-m-d'),
                        'formatted_date' => $holiday->formatted_date,
                        'type' => $holiday->type,
                        'description' => $holiday->description,
                        'is_national' => $holiday->is_national,
                        'region' => $holiday->region
                    ];
                }),
                'meta' => [
                    'total' => $holidays->count(),
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'region' => $region ?? 'Nacional',
                    'days_in_range' => Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener feriados en el rango',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener feriados por año específico
     */
    public function getByYear(Request $request, $year): JsonResponse
    {
        try {
            // Validar año
            if (!is_numeric($year) || $year < 2020 || $year > 2030) {
                return response()->json([
                    'success' => false,
                    'message' => 'Año inválido. Debe estar entre 2020 y 2030'
                ], 400);
            }

            $region = $request->get('region');

            $holidays = Holiday::getHolidaysForYear($year, $region);

            return response()->json([
                'success' => true,
                'message' => "Feriados del año {$year} obtenidos exitosamente",
                'data' => $holidays->map(function ($holiday) {
                    return [
                        'id' => $holiday->id,
                        'name' => $holiday->name,
                        'date' => $holiday->date->format('Y-m-d'),
                        'formatted_date' => $holiday->formatted_date,
                        'formatted_date_full' => $holiday->formatted_date_full,
                        'type' => $holiday->type,
                        'description' => $holiday->description,
                        'is_national' => $holiday->is_national,
                        'region' => $holiday->region,
                        'month' => $holiday->date->format('n'),
                        'month_name' => $holiday->date->format('F'),
                        'day_of_week' => $holiday->date->format('l')
                    ];
                }),
                'meta' => [
                    'total' => $holidays->count(),
                    'year' => (int)$year,
                    'region' => $region ?? 'Nacional'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener feriados del año',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de feriados
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $currentYear = date('Y');
            $region = $request->get('region');

            // Estadísticas del año actual
            $currentYearHolidays = Holiday::getHolidaysForYear($currentYear, $region);
            $upcomingHolidays = Holiday::getUpcomingHolidays(30, $region);
            $pastHolidays = Holiday::active()
                ->forYear($currentYear)
                ->forRegion($region)
                ->where('date', '<', Carbon::today())
                ->count();

            // Próximo feriado
            $nextHoliday = Holiday::active()
                ->forRegion($region)
                ->where('date', '>=', Carbon::today())
                ->orderBy('date')
                ->first();

            // Estadísticas por tipo
            $holidaysByType = Holiday::active()
                ->forYear($currentYear)
                ->forRegion($region)
                ->selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type');

            return response()->json([
                'success' => true,
                'message' => 'Estadísticas de feriados obtenidas exitosamente',
                'data' => [
                    'current_year' => [
                        'year' => $currentYear,
                        'total_holidays' => $currentYearHolidays->count(),
                        'past_holidays' => $pastHolidays,
                        'upcoming_holidays' => $currentYearHolidays->count() - $pastHolidays
                    ],
                    'next_holiday' => $nextHoliday ? [
                        'name' => $nextHoliday->name,
                        'date' => $nextHoliday->date->format('Y-m-d'),
                        'formatted_date' => $nextHoliday->formatted_date,
                        'days_until' => $nextHoliday->daysUntil(),
                        'type' => $nextHoliday->type
                    ] : null,
                    'upcoming_30_days' => [
                        'count' => $upcomingHolidays->count(),
                        'holidays' => $upcomingHolidays->take(3)->map(function ($holiday) {
                            return [
                                'name' => $holiday->name,
                                'date' => $holiday->formatted_date,
                                'days_until' => $holiday->daysUntil()
                            ];
                        })
                    ],
                    'by_type' => $holidaysByType,
                    'region' => $region ?? 'Nacional'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar feriados automáticamente
     */
    public function generateHolidays(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'start_year' => 'nullable|integer|min:2020|max:2100',
                'end_year' => 'nullable|integer|min:2020|max:2100',
                'auto_update' => 'nullable|boolean'
            ]);

            if ($request->get('auto_update', false)) {
                $result = $this->holidayCalculator->autoUpdateHolidays();
            } else {
                $startYear = $request->get('start_year', date('Y'));
                $endYear = $request->get('end_year', date('Y') + 5);
                
                $insertedCount = $this->holidayCalculator->generateAndInsertHolidays($startYear, $endYear);
                
                $result = [
                    'updated' => $insertedCount > 0,
                    'message' => $insertedCount > 0 
                        ? "Se generaron {$insertedCount} feriados desde {$startYear} hasta {$endYear}"
                        : "No se generaron nuevos feriados, ya existen para el rango especificado",
                    'inserted_count' => $insertedCount,
                    'years_range' => "{$startYear}-{$endYear}"
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'Proceso de generación completado',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar feriados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar si un día es laborable
     */
    public function isWorkingDay(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date' => 'required|date',
                'region' => 'nullable|string|max:100'
            ]);

            $date = $request->date;
            $region = $request->get('region');
            
            $isWorking = $this->holidayCalculator->isWorkingDay($date, $region);
            $carbonDate = Carbon::parse($date);
            
            $reason = '';
            if (!$isWorking) {
                if ($carbonDate->isWeekend()) {
                    $reason = 'Es fin de semana';
                } else {
                    $holiday = Holiday::getHolidayByDate($date, $region);
                    $reason = $holiday ? "Es feriado: {$holiday->name}" : 'No es día laborable';
                }
            }

            return response()->json([
                'success' => true,
                'message' => $isWorking ? 'Es día laborable' : 'No es día laborable',
                'data' => [
                    'date' => $date,
                    'is_working_day' => $isWorking,
                    'day_of_week' => $carbonDate->format('l'),
                    'reason' => $reason
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar día laborable',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener próximo día laborable
     */
    public function getNextWorkingDay(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date' => 'required|date',
                'region' => 'nullable|string|max:100'
            ]);

            $date = $request->date;
            $region = $request->get('region');
            
            $nextWorkingDay = $this->holidayCalculator->getNextWorkingDay($date, $region);

            return response()->json([
                'success' => true,
                'message' => 'Próximo día laborable encontrado',
                'data' => [
                    'original_date' => $date,
                    'next_working_day' => $nextWorkingDay->format('Y-m-d'),
                    'formatted_date' => $nextWorkingDay->format('l, d/m/Y'),
                    'days_difference' => Carbon::parse($date)->diffInDays($nextWorkingDay)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener próximo día laborable',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener días laborables en un rango
     */
    public function getWorkingDaysInRange(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'region' => 'nullable|string|max:100'
            ]);

            $startDate = $request->start_date;
            $endDate = $request->end_date;
            $region = $request->get('region');
            
            $workingDays = $this->holidayCalculator->getWorkingDaysInRange($startDate, $endDate, $region);
            $totalDays = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;

            return response()->json([
                'success' => true,
                'message' => 'Días laborables obtenidos exitosamente',
                'data' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'working_days' => $workingDays,
                    'working_days_count' => count($workingDays),
                    'total_days' => $totalDays,
                    'non_working_days' => $totalDays - count($workingDays),
                    'region' => $region ?? 'Nacional'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener días laborables',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener años disponibles en el sistema
     */
    public function getAvailableYears(): JsonResponse
    {
        try {
            $yearRange = Holiday::selectRaw('MIN(year) as min_year, MAX(year) as max_year')
                               ->where('is_active', true)
                               ->first();
            
            $yearsList = Holiday::selectRaw('year, COUNT(*) as holidays_count')
                               ->where('is_active', true)
                               ->groupBy('year')
                               ->orderBy('year')
                               ->get();

            $missingYears = $this->holidayCalculator->getMissingYears(2050);

            return response()->json([
                'success' => true,
                'message' => 'Años disponibles obtenidos exitosamente',
                'data' => [
                    'year_range' => $yearRange,
                    'years_list' => $yearsList,
                    'missing_years' => $missingYears,
                    'total_years_available' => $yearsList->count(),
                    'system_ready_until' => $yearRange->max_year ?? 'No configurado'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener años disponibles',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
