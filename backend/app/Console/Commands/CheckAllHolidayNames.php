<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class CheckAllHolidayNames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:check-names';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar todos los nombres de feriados en la base de datos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando todos los nombres de feriados...');
        
        $holidays = Holiday::where('year', 2025)->orderBy('date')->get();
        
        if ($holidays->isEmpty()) {
            $this->error('❌ No se encontraron feriados para 2025');
            return;
        }
        
        $this->info('✅ Feriados encontrados para 2025:');
        $this->line('');
        
        foreach ($holidays as $holiday) {
            $this->line("📅 {$holiday->date}: {$holiday->name}");
        }
        
        $this->line('');
        $this->info('🎯 Verificación completada');
    }
}
