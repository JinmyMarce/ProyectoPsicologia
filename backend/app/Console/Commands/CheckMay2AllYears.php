<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class CheckMay2AllYears extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:check-may-2-all-years';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar que el feriado del 2 de mayo esté presente en todos los años';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando feriados del 2 de mayo en todos los años...');
        
        $startYear = 2025;
        $endYear = 2050;
        
        $missingYears = [];
        $foundYears = [];
        
        for ($year = $startYear; $year <= $endYear; $year++) {
            $holiday = Holiday::whereRaw('DAY(date) = 2 AND MONTH(date) = 5 AND YEAR(date) = ?', [$year])
                             ->where('name', 'Combate del 2 de Mayo')
                             ->first();
            
            if ($holiday) {
                $foundYears[] = $year;
                $this->line("✅ {$year}: Feriado encontrado (ID: {$holiday->id})");
            } else {
                $missingYears[] = $year;
                $this->error("❌ {$year}: Feriado NO encontrado");
            }
        }
        
        $this->info('');
        $this->info('📊 Resumen:');
        $this->info("✅ Años con feriado: " . count($foundYears));
        $this->info("❌ Años sin feriado: " . count($missingYears));
        
        if (!empty($missingYears)) {
            $this->error('❌ Años faltantes: ' . implode(', ', $missingYears));
        } else {
            $this->info('🎉 ¡Todos los años tienen el feriado del 2 de mayo!');
        }
    }
}
