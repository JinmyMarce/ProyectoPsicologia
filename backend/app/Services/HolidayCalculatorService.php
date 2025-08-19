<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Holiday;

class HolidayCalculatorService
{
    /**
     * Generar todos los feriados desde 2025 hasta 2050
     */
    public function generateHolidaysForAllYears(int $startYear = 2025, int $endYear = 2050): array
    {
        $holidays = [];
        
        for ($year = $startYear; $year <= $endYear; $year++) {
            $yearHolidays = $this->generateHolidaysForYear($year);
            $holidays = array_merge($holidays, $yearHolidays);
        }
        
        return $holidays;
    }

    /**
     * Generar feriados para un año específico
     */
    public function generateHolidaysForYear(int $year): array
    {
        $holidays = [];
        
        // Feriados fijos
        $holidays = array_merge($holidays, $this->getFixedHolidays($year));
        
        // Feriados móviles (basados en Pascua)
        $holidays = array_merge($holidays, $this->getMovableHolidays($year));
        
        // Feriados regionales
        $holidays = array_merge($holidays, $this->getRegionalHolidays($year));
        
        return $holidays;
    }

    /**
     * Obtener feriados fijos para un año
     */
    private function getFixedHolidays(int $year): array
    {
        return [
            [
                'name' => 'Año Nuevo',
                'date' => "$year-01-01",
                'type' => 'fijo',
                'description' => 'Celebración del primer día del año',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Día del Trabajador',
                'date' => "$year-05-01",
                'type' => 'fijo',
                'description' => 'Día Internacional del Trabajo',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Día de San Pedro y San Pablo',
                'date' => "$year-06-29",
                'type' => 'fijo',
                'description' => 'Festividad religiosa católica',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Día de la Independencia',
                'date' => "$year-07-28",
                'type' => 'fijo',
                'description' => 'Proclamación de la independencia del Perú',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Día de las Fuerzas Armadas',
                'date' => "$year-07-29",
                'type' => 'fijo',
                'description' => 'Día en honor a las Fuerzas Armadas del Perú',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Santa Rosa de Lima',
                'date' => "$year-08-30",
                'type' => 'fijo',
                'description' => 'Día de la patrona de Lima y del Perú',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Combate de Angamos',
                'date' => "$year-10-08",
                'type' => 'fijo',
                'description' => 'Conmemoración del heroísmo de Miguel Grau',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Todos los Santos',
                'date' => "$year-11-01",
                'type' => 'fijo',
                'description' => 'Día de Todos los Santos',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Inmaculada Concepción',
                'date' => "$year-12-08",
                'type' => 'fijo',
                'description' => 'Festividad católica de la Inmaculada Concepción',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Navidad',
                'date' => "$year-12-25",
                'type' => 'fijo',
                'description' => 'Celebración del nacimiento de Jesucristo',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ]
        ];
    }

    /**
     * Obtener feriados móviles (basados en Pascua)
     */
    private function getMovableHolidays(int $year): array
    {
        $easter = $this->calculateEaster($year);
        
        // Jueves Santo (3 días antes de Pascua)
        $holyThursday = $easter->copy()->subDays(3);
        
        // Viernes Santo (2 días antes de Pascua)
        $goodFriday = $easter->copy()->subDays(2);
        
        return [
            [
                'name' => 'Jueves Santo',
                'date' => $holyThursday->format('Y-m-d'),
                'type' => 'movil',
                'description' => 'Conmemoración de la Última Cena de Jesucristo',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Viernes Santo',
                'date' => $goodFriday->format('Y-m-d'),
                'type' => 'movil',
                'description' => 'Conmemoración de la crucifixión de Jesucristo',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ]
        ];
    }

    /**
     * Obtener feriados regionales
     */
    private function getRegionalHolidays(int $year): array
    {
        return [
            // Lima
            [
                'name' => 'Señor de los Milagros',
                'date' => "$year-10-18",
                'type' => 'fijo',
                'description' => 'Procesión del Señor de los Milagros en Lima',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Lima',
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'San Martín de Porres',
                'date' => "$year-11-03",
                'type' => 'fijo',
                'description' => 'Santo patrón de la justicia social en Lima',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Lima',
                'year' => $year,
                'is_active' => true
            ],
            // Cusco
            [
                'name' => 'Inti Raymi',
                'date' => "$year-06-24",
                'type' => 'fijo',
                'description' => 'Fiesta del Sol en Cusco',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Cusco',
                'year' => $year,
                'is_active' => true
            ],
            // Arequipa
            [
                'name' => 'Aniversario de Arequipa',
                'date' => "$year-08-15",
                'type' => 'fijo',
                'description' => 'Aniversario de la fundación de Arequipa',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Arequipa',
                'year' => $year,
                'is_active' => true
            ],
            // Piura
            [
                'name' => 'San Miguel Arcángel',
                'date' => "$year-09-29",
                'type' => 'fijo',
                'description' => 'Santo patrón de Piura',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Piura',
                'year' => $year,
                'is_active' => true
            ],
            // Ica
            [
                'name' => 'Señor de Luren',
                'date' => "$year-10-17",
                'type' => 'fijo',
                'description' => 'Patrón de Ica',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Ica',
                'year' => $year,
                'is_active' => true
            ]
        ];
    }

    /**
     * Calcular fecha de Pascua usando el algoritmo de Gauss
     */
    private function calculateEaster(int $year): Carbon
    {
        $a = $year % 19;
        $b = intval($year / 100);
        $c = $year % 100;
        $d = intval($b / 4);
        $e = $b % 4;
        $f = intval(($b + 8) / 25);
        $g = intval(($b - $f + 1) / 3);
        $h = (19 * $a + $b - $d - $g + 15) % 30;
        $i = intval($c / 4);
        $k = $c % 4;
        $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
        $m = intval(($a + 11 * $h + 22 * $l) / 451);
        $month = intval(($h + $l - 7 * $m + 114) / 31);
        $day = (($h + $l - 7 * $m + 114) % 31) + 1;
        
        return Carbon::createFromDate($year, $month, $day);
    }

    /**
     * Generar e insertar feriados para múltiples años
     */
    public function generateAndInsertHolidays(int $startYear = 2025, int $endYear = 2050): int
    {
        $allHolidays = $this->generateHolidaysForAllYears($startYear, $endYear);
        $insertedCount = 0;
        
        foreach ($allHolidays as $holidayData) {
            // Verificar si ya existe
            $existing = Holiday::where('date', $holidayData['date'])
                              ->where('name', $holidayData['name'])
                              ->first();
            
            if (!$existing) {
                Holiday::create($holidayData);
                $insertedCount++;
            }
        }
        
        return $insertedCount;
    }

    /**
     * Obtener años con feriados faltantes
     */
    public function getMissingYears(int $endYear = 2050): array
    {
        $currentYear = (int) date('Y');
        $existingYears = Holiday::selectRaw('DISTINCT year')
                               ->where('year', '>=', $currentYear)
                               ->pluck('year')
                               ->toArray();
        
        $requiredYears = range($currentYear, $endYear);
        
        return array_diff($requiredYears, $existingYears);
    }

    /**
     * Actualizar automáticamente feriados si es necesario
     */
    public function autoUpdateHolidays(): array
    {
        $currentYear = (int) date('Y');
        $targetYear = $currentYear + 5; // Mantener siempre 5 años adelante
        
        $missingYears = $this->getMissingYears($targetYear);
        
        if (empty($missingYears)) {
            return [
                'updated' => false,
                'message' => 'Los feriados están actualizados',
                'years_available' => Holiday::selectRaw('MIN(year) as min_year, MAX(year) as max_year')->first()
            ];
        }
        
        $insertedCount = 0;
        foreach ($missingYears as $year) {
            $yearHolidays = $this->generateHolidaysForYear($year);
            foreach ($yearHolidays as $holidayData) {
                Holiday::create($holidayData);
                $insertedCount++;
            }
        }
        
        return [
            'updated' => true,
            'message' => "Se agregaron {$insertedCount} feriados para los años: " . implode(', ', $missingYears),
            'inserted_count' => $insertedCount,
            'years_added' => $missingYears,
            'years_available' => Holiday::selectRaw('MIN(year) as min_year, MAX(year) as max_year')->first()
        ];
    }

    /**
     * Verificar si un día es laborable (no feriado ni fin de semana)
     */
    public function isWorkingDay(string $date, string $region = null): bool
    {
        $carbonDate = Carbon::parse($date);
        
        // Verificar si es fin de semana
        if ($carbonDate->isWeekend()) {
            return false;
        }
        
        // Verificar si es feriado
        return !Holiday::isHoliday($date, $region);
    }

    /**
     * Obtener próximo día laborable
     */
    public function getNextWorkingDay(string $date, string $region = null): Carbon
    {
        $nextDay = Carbon::parse($date)->addDay();
        
        while (!$this->isWorkingDay($nextDay->format('Y-m-d'), $region)) {
            $nextDay->addDay();
        }
        
        return $nextDay;
    }

    /**
     * Obtener días laborables en un rango
     */
    public function getWorkingDaysInRange(string $startDate, string $endDate, string $region = null): array
    {
        $workingDays = [];
        $current = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        while ($current->lte($end)) {
            if ($this->isWorkingDay($current->format('Y-m-d'), $region)) {
                $workingDays[] = $current->format('Y-m-d');
            }
            $current->addDay();
        }
        
        return $workingDays;
    }

    /**
     * Contar días laborables entre dos fechas
     */
    public function countWorkingDays(string $startDate, string $endDate, string $region = null): int
    {
        return count($this->getWorkingDaysInRange($startDate, $endDate, $region));
    }
}




