<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\HolidayCalculatorService;

class GenerateHolidaysCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'holidays:generate 
                          {--start-year=2025 : Año de inicio} 
                          {--end-year=2050 : Año final}
                          {--auto : Actualización automática (mantiene 5 años adelante)}';

    /**
     * The console command description.
     */
    protected $description = 'Generar feriados para el sistema de citas psicológicas';

    private HolidayCalculatorService $holidayCalculator;

    public function __construct(HolidayCalculatorService $holidayCalculator)
    {
        parent::__construct();
        $this->holidayCalculator = $holidayCalculator;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🎉 Generador de Feriados para el Sistema de Psicología ISTTA');
        $this->line('');

        if ($this->option('auto')) {
            return $this->handleAutoUpdate();
        }

        $startYear = (int) $this->option('start-year');
        $endYear = (int) $this->option('end-year');

        // Validaciones
        if ($startYear > $endYear) {
            $this->error('❌ El año de inicio no puede ser mayor al año final');
            return 1;
        }

        if ($startYear < 2020 || $endYear > 2100) {
            $this->error('❌ Los años deben estar entre 2020 y 2100');
            return 1;
        }

        $this->info("📅 Generando feriados desde {$startYear} hasta {$endYear}...");
        $this->line('');

        // Mostrar progreso
        $totalYears = $endYear - $startYear + 1;
        $progressBar = $this->output->createProgressBar($totalYears);
        $progressBar->setFormat('[%bar%] %percent:3s%% %current%/%max% años - %message%');
        $progressBar->setMessage('Iniciando...');

        $insertedCount = 0;
        for ($year = $startYear; $year <= $endYear; $year++) {
            $progressBar->setMessage("Procesando año {$year}");
            
            $yearHolidays = $this->holidayCalculator->generateHolidaysForYear($year);
            $yearInserted = 0;
            
            foreach ($yearHolidays as $holidayData) {
                // Verificar si ya existe
                $existing = \App\Models\Holiday::where('date', $holidayData['date'])
                                              ->where('name', $holidayData['name'])
                                              ->first();
                
                if (!$existing) {
                    \App\Models\Holiday::create($holidayData);
                    $yearInserted++;
                    $insertedCount++;
                }
            }
            
            $progressBar->advance();
        }

        $progressBar->setMessage('Completado');
        $progressBar->finish();
        $this->line('');
        $this->line('');

        // Mostrar resultados
        $this->info("✅ Generación completada exitosamente");
        $this->line("📊 Feriados insertados: {$insertedCount}");
        
        // Estadísticas por año
        $this->table(
            ['Año', 'Feriados Nacionales', 'Feriados Regionales', 'Total'],
            $this->getYearStats($startYear, $endYear)
        );

        // Próximos feriados
        $this->line('');
        $this->info('🔮 Próximos 5 feriados:');
        $upcomingHolidays = \App\Models\Holiday::getUpcomingHolidays(365)->take(5);
        
        foreach ($upcomingHolidays as $holiday) {
            $this->line("   • {$holiday->name} - {$holiday->formatted_date} ({$holiday->daysUntil()} días)");
        }

        $this->line('');
        $this->info('🎯 Feriados generados para toda la vida del sistema!');
        
        return 0;
    }

    /**
     * Manejar actualización automática
     */
    private function handleAutoUpdate(): int
    {
        $this->info('🔄 Ejecutando actualización automática de feriados...');
        $this->line('');

        $result = $this->holidayCalculator->autoUpdateHolidays();

        if ($result['updated']) {
            $this->info('✅ ' . $result['message']);
            $this->line("📊 Feriados insertados: {$result['inserted_count']}");
            $this->line("📅 Años agregados: " . implode(', ', $result['years_added']));
        } else {
            $this->info('✅ ' . $result['message']);
        }

        $yearRange = $result['years_available'];
        $this->line("📊 Años disponibles: {$yearRange->min_year} - {$yearRange->max_year}");

        return 0;
    }

    /**
     * Obtener estadísticas por año
     */
    private function getYearStats(int $startYear, int $endYear): array
    {
        $stats = [];
        
        for ($year = $startYear; $year <= $endYear; $year++) {
            $national = \App\Models\Holiday::where('year', $year)->where('is_national', true)->count();
            $regional = \App\Models\Holiday::where('year', $year)->where('is_regional', true)->count();
            $total = $national + $regional;
            
            if ($total > 0) {
                $stats[] = [$year, $national, $regional, $total];
            }
        }
        
        return $stats;
    }
}






































