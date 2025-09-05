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
        
        // Días no laborables adicionales
        $holidays = array_merge($holidays, $this->getAdditionalNonWorkingDays($year));
        
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
                'type' => 'Cívico',
                'description' => 'Marca el inicio del año calendario y es un día de descanso nacional.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Día del Trabajador',
                'date' => "$year-05-01",
                'type' => 'Cívico',
                'description' => 'Celebración internacional en honor a los trabajadores y sus derechos laborales.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Día de la Bandera',
                'date' => "$year-06-07",
                'type' => 'Cívico',
                'description' => 'Conmemora la heroica defensa de Arica en 1880. En las instituciones educativas y públicas se realizan ceremonias de homenaje.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'San Pedro y San Pablo',
                'date' => "$year-06-29",
                'type' => 'Religioso',
                'description' => 'Festividad religiosa que celebra a estos dos apóstoles importantes del cristianismo.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Fuerza Aérea del Perú',
                'date' => "$year-07-23",
                'type' => 'Cívico',
                'description' => 'Homenaje a las Fuerzas Armadas y en especial al emblemático piloto José Abelardo Quiñones.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Día de la Independencia',
                'date' => "$year-07-28",
                'type' => 'Cívico',
                'description' => 'Proclamación de la independencia del Perú en 1821. Cada 28 de julio, el presidente brinda un mensaje al Congreso.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Día de las Fuerzas Armadas',
                'date' => "$year-07-29",
                'type' => 'Cívico',
                'description' => 'Día en honor a las Fuerzas Armadas del Perú',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Batalla de Junín',
                'date' => "$year-08-06",
                'type' => 'Cívico',
                'description' => 'Conmemora esta importante victoria independentista lograda en 1824.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Santa Rosa de Lima',
                'date' => "$year-08-30",
                'type' => 'Religioso',
                'description' => 'Homenaje a la primera santa de América, nacida en Lima en el siglo XVII.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Combate de Angamos',
                'date' => "$year-10-08",
                'type' => 'Cívico',
                'description' => 'Recuerda la pérdida del monitor Huáscar y el coraje del almirante Miguel Grau durante la Guerra del Pacífico.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Todos los Santos',
                'date' => "$year-11-01",
                'type' => 'Religioso',
                'description' => 'Día en que se honra a los seres queridos fallecidos.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Inmaculada Concepción',
                'date' => "$year-12-08",
                'type' => 'Religioso',
                'description' => 'Conmemoración del dogma católico de la concepción sin pecado de la Virgen María.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Batalla de Ayacucho',
                'date' => "$year-12-09",
                'type' => 'Cívico',
                'description' => 'Recuerda la batalla de 1824 que selló la independencia sudamericana del dominio colonial.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Navidad',
                'date' => "$year-12-25",
                'type' => 'Religioso',
                'description' => 'Celebración del nacimiento de Jesucristo.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Combate del 2 de Mayo',
                'date' => "$year-05-02",
                'type' => 'Cívico',
                'description' => 'Conmemoración del Combate del 2 de Mayo de 1866, donde las fuerzas peruanas y aliadas defendieron el Callao contra la escuadra española.',
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
                'type' => 'Religioso',
                'description' => 'Conmemora la Última Cena de Jesús con sus apóstoles.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ],
            [
                'name' => 'Viernes Santo',
                'date' => $goodFriday->format('Y-m-d'),
                'type' => 'Religioso',
                'description' => 'Recuerda la crucifixión y muerte de Jesús.',
                'is_national' => true,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ]
        ];
    }

    /**
     * Obtener días no laborables adicionales (sector público, compensables)
     */
    private function getAdditionalNonWorkingDays(int $year): array
    {
        $additionalDays = [];
        
        // Para 2025 específicamente
        if ($year === 2025) {
            $additionalDays[] = [
                'name' => 'Día del Sector Público',
                'date' => "$year-05-02",
                'type' => 'Sector Público',
                'description' => 'Día no laborable para el sector público. Los trabajadores del sector público tienen este día libre.',
                'is_national' => false,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ];
            
            $additionalDays[] = [
                'name' => 'Día del Sector Público',
                'date' => "$year-12-26",
                'type' => 'Sector Público',
                'description' => 'Día no laborable para el sector público. Los trabajadores del sector público tienen este día libre.',
                'is_national' => false,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ];
        }
        
        // Para 2026
        if ($year === 2026) {
            $additionalDays[] = [
                'name' => 'Día del Sector Público',
                'date' => "$year-01-02",
                'type' => 'Sector Público',
                'description' => 'Día no laborable para el sector público. Los trabajadores del sector público tienen este día libre.',
                'is_national' => false,
                'is_regional' => false,
                'region' => null,
                'year' => $year,
                'is_active' => true
            ];
        }
        
        return $additionalDays;
    }

    /**
     * Obtener feriados regionales
     * NOTA: Por ahora solo incluimos feriados nacionales oficiales
     */
    private function getRegionalHolidays(int $year): array
    {
        return []; // No incluimos feriados regionales por ahora
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


















