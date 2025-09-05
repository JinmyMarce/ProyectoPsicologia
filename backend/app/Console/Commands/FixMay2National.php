<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class FixMay2National extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:fix-may-2-national';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Corregir el estado is_national de los feriados del 2 de mayo';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔧 Corrigiendo estado is_national de feriados del 2 de mayo...');
        
        $holidays = Holiday::where('name', 'Combate del 2 de Mayo')->get();
        
        if ($holidays->isEmpty()) {
            $this->error('❌ No se encontraron feriados del 2 de mayo');
            return;
        }
        
        $updatedCount = 0;
        
        foreach ($holidays as $holiday) {
            if (!$holiday->is_national) {
                $holiday->update([
                    'is_national' => true
                ]);
                $updatedCount++;
                $this->info("✅ Actualizado ID {$holiday->id} (año {$holiday->year})");
            }
        }
        
        $this->info('');
        $this->info("📊 Resumen: {$updatedCount} feriados actualizados");
        
        if ($updatedCount > 0) {
            $this->info('🎉 Todos los feriados del 2 de mayo ahora son nacionales');
            
            // Verificar que ahora aparezcan en la API
            $this->info('');
            $this->info('🧪 Verificando API...');
            
            $apiQuery = Holiday::active()->national()->forYear(2025)->get();
            $may2InApi = $apiQuery->where('name', 'Combate del 2 de Mayo')->first();
            
            if ($may2InApi) {
                $this->info("✅ Feriado del 2 de mayo ahora aparece en la API (ID: {$may2InApi->id})");
            } else {
                $this->error("❌ Feriado del 2 de mayo aún no aparece en la API");
            }
        } else {
            $this->info('ℹ️  Todos los feriados del 2 de mayo ya eran nacionales');
        }
    }
}
