<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;
use App\Services\HolidayCalculatorService;
use Carbon\Carbon;

class GenerateHolidaysUntil2050 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:generate-until-2050';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generar feriados para todos los años desde 2025 hasta 2050';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🎯 Generando feriados para todos los años hasta 2050...');
        
        $startYear = 2025;
        $endYear = 2050;
        
        $holidayService = new HolidayCalculatorService();
        
        for ($year = $startYear; $year <= $endYear; $year++) {
            $this->info("📅 Procesando año: {$year}");
            
            // Verificar si ya existen feriados para este año
            $existingHolidays = Holiday::where('year', $year)->count();
            
            if ($existingHolidays > 0) {
                $this->warn("⚠️  Ya existen {$existingHolidays} feriados para el año {$year}");
                continue;
            }
            
            // Generar feriados para el año
            $holidays = $holidayService->generateHolidaysForYear($year);
            
            $count = 0;
            foreach ($holidays as $holidayData) {
                try {
                    Holiday::create($holidayData);
                    $count++;
                } catch (\Exception $e) {
                    $this->error("❌ Error al crear feriado: {$e->getMessage()}");
                }
            }
            
            $this->info("✅ Se crearon {$count} feriados para el año {$year}");
        }
        
        $this->info('🎉 Generación de feriados completada');
        
        // Mostrar resumen
        $totalHolidays = Holiday::count();
        $this->info("📊 Total de feriados en la base de datos: {$totalHolidays}");
        
        // Mostrar distribución por años
        $this->info('📈 Distribución por años:');
        $yearDistribution = Holiday::selectRaw('year, COUNT(*) as count')
                                  ->groupBy('year')
                                  ->orderBy('year')
                                  ->get();
        
        foreach ($yearDistribution as $yearData) {
            $this->line("  {$yearData->year}: {$yearData->count} feriados");
        }
    }
}
