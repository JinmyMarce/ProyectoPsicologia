<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class CheckMay2Active extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:check-may-2-active';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar el estado is_active de los feriados del 2 de mayo';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando estado is_active de feriados del 2 de mayo...');
        
        $holidays = Holiday::where('name', 'Combate del 2 de Mayo')->get();
        
        if ($holidays->isEmpty()) {
            $this->error('❌ No se encontraron feriados del 2 de mayo');
            return;
        }
        
        $this->info("✅ Se encontraron {$holidays->count()} feriados del 2 de mayo:");
        
        foreach ($holidays as $holiday) {
            $status = $holiday->is_active ? '✅ Activo' : '❌ Inactivo';
            $this->line("  - ID: {$holiday->id}, Año: {$holiday->year}, Fecha: {$holiday->date}, Estado: {$status}");
        }
        
        // Contar activos vs inactivos
        $activeCount = $holidays->where('is_active', true)->count();
        $inactiveCount = $holidays->where('is_active', false)->count();
        $nullCount = $holidays->whereNull('is_active')->count();
        
        $this->info('');
        $this->info('📊 Resumen:');
        $this->info("  - Activos: {$activeCount}");
        $this->info("  - Inactivos: {$inactiveCount}");
        $this->info("  - Sin valor (NULL): {$nullCount}");
        
        if ($nullCount > 0 || $inactiveCount > 0) {
            $this->warn('⚠️  Algunos feriados no están activos. Esto puede causar que no aparezcan en la API.');
        }
    }
}
