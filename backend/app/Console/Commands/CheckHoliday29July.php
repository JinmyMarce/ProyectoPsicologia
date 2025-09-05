<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class CheckHoliday29July extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:check-29-july';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar si existe el feriado del 29 de julio';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando feriados del 29 de julio...');
        
        $holidays = Holiday::whereRaw('DAY(date) = 29 AND MONTH(date) = 7')->get();
        
        if ($holidays->isEmpty()) {
            $this->error('❌ No se encontraron feriados para el 29 de julio');
            $this->info('💡 Creando feriado del 29 de julio...');
            
            Holiday::create([
                'name' => 'Día de las Fuerzas Armadas y Policía Nacional',
                'date' => '2025-07-29',
                'is_national' => true,
                'year' => 2025
            ]);
            
            $this->info('✅ Feriado del 29 de julio creado exitosamente');
        } else {
            $this->info('✅ Feriados encontrados para el 29 de julio:');
            foreach ($holidays as $holiday) {
                $this->line("  - ID: {$holiday->id}");
                $this->line("  - Nombre: {$holiday->name}");
                $this->line("  - Fecha: {$holiday->date}");
                $this->line("  - Nacional: " . ($holiday->is_national ? 'Sí' : 'No'));
                $this->line("  - Año: {$holiday->year}");
                $this->line('');
            }
        }
        
        $this->info('🎯 Verificación completada');
    }
}
