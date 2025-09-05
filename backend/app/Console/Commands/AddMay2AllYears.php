<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;
use Carbon\Carbon;

class AddMay2AllYears extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:add-may-2-all-years';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Agregar el feriado del 2 de mayo a todos los años faltantes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Agregando feriados del 2 de mayo a todos los años...');
        
        $startYear = 2025;
        $endYear = 2050;
        
        $addedCount = 0;
        $existingCount = 0;
        
        for ($year = $startYear; $year <= $endYear; $year++) {
            // Verificar si ya existe
            $existingHoliday = Holiday::whereRaw('DAY(date) = 2 AND MONTH(date) = 5 AND YEAR(date) = ?', [$year])
                                     ->where('name', 'Combate del 2 de Mayo')
                                     ->first();
            
            if ($existingHoliday) {
                $existingCount++;
                $this->line("✅ {$year}: Ya existe (ID: {$existingHoliday->id})");
                continue;
            }
            
            // Crear el feriado
            try {
                $date = Carbon::create($year, 5, 2, 0, 0, 0);
                
                $holiday = Holiday::create([
                    'name' => 'Combate del 2 de Mayo',
                    'date' => $date,
                    'year' => $year,
                    'type' => 'fijo', // Usando el tipo válido 'fijo'
                    'description' => 'Conmemoración del Combate del 2 de Mayo de 1866, donde las fuerzas peruanas y aliadas defendieron el Callao contra la escuadra española.',
                    'long_description' => 'El 2 de mayo en Perú conmemora el Combate del Dos de Mayo de 1866, una batalla crucial que selló de forma definitiva la independencia de Sudamérica y la soberanía de Perú frente a un intento de reconquista por parte de España.'
                ]);
                
                $addedCount++;
                $this->info("✅ {$year}: Creado (ID: {$holiday->id})");
                
            } catch (\Exception $e) {
                $this->error("❌ {$year}: Error - {$e->getMessage()}");
            }
        }
        
        $this->info('');
        $this->info('📊 Resumen:');
        $this->info("✅ Feriados existentes: {$existingCount}");
        $this->info("🆕 Feriados creados: {$addedCount}");
        $this->info("📅 Total procesado: " . ($existingCount + $addedCount) . " años");
        
        if ($addedCount > 0) {
            $this->info('🎉 ¡Feriados del 2 de mayo agregados exitosamente!');
        } else {
            $this->info('ℹ️  Todos los feriados del 2 de mayo ya existían');
        }
    }
}
