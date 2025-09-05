<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class CheckHolidaysCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:check {year?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar feriados de un año específico';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $year = $this->argument('year') ?? 2025;
        
        $this->info("Feriados del año {$year}:");
        $this->info("================================");
        
        $holidays = Holiday::where('year', $year)
                          ->orderBy('date')
                          ->get(['name', 'date', 'type']);
        
        if ($holidays->isEmpty()) {
            $this->error("No se encontraron feriados para el año {$year}");
            return;
        }
        
        foreach ($holidays as $holiday) {
            $this->line("• {$holiday->name} - {$holiday->date} ({$holiday->type})");
        }
        
        $this->info("================================");
        $this->info("Total: {$holidays->count()} feriados");
    }
}



