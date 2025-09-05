<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class UpdateHoliday29July extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:update-29-july';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Actualizar el nombre del feriado del 29 de julio';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Actualizando feriados del 29 de julio...');
        
        $holidays = Holiday::whereRaw('DAY(date) = 29 AND MONTH(date) = 7')
                          ->where('name', 'Día de las Fuerzas Armadas')
                          ->get();
        
        if ($holidays->isEmpty()) {
            $this->error('❌ No se encontraron feriados del 29 de julio para actualizar');
            return;
        }
        
        $count = 0;
        foreach ($holidays as $holiday) {
            $holiday->update([
                'name' => 'Día de las Fuerzas Armadas y Policía Nacional'
            ]);
            $count++;
        }
        
        $this->info("✅ Se actualizaron {$count} feriados del 29 de julio");
        $this->info('🎯 Nombre actualizado a: "Día de las Fuerzas Armadas y Policía Nacional"');
    }
}
