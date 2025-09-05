<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class UpdateMay2Holiday extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:update-may-2';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Actualizar el feriado del 2 de mayo con el nombre correcto';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Actualizando feriados del 2 de mayo...');
        
        $holidays = Holiday::whereRaw('DAY(date) = 2 AND MONTH(date) = 5')
                          ->where('name', 'Día no laborable (compensable)')
                          ->get();
        
        if ($holidays->isEmpty()) {
            $this->error('❌ No se encontraron feriados del 2 de mayo para actualizar');
            return;
        }
        
        $count = 0;
        foreach ($holidays as $holiday) {
            $holiday->update([
                'name' => 'Combate del 2 de Mayo'
            ]);
            $count++;
        }
        
        $this->info("✅ Se actualizaron {$count} feriados del 2 de mayo");
        $this->info('🎯 Nombre actualizado a: "Combate del 2 de Mayo"');
        
        // Mostrar algunos ejemplos
        $this->info('📋 Ejemplos de feriados actualizados:');
        $examples = Holiday::whereRaw('DAY(date) = 2 AND MONTH(date) = 5')
                          ->where('name', 'Combate del 2 de Mayo')
                          ->limit(5)
                          ->get();
        
        foreach ($examples as $example) {
            $this->line("  - ID: {$example->id}, Año: {$example->year}, Fecha: {$example->date}");
        }
    }
}
