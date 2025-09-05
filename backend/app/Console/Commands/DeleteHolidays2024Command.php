<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;
use Illuminate\Support\Facades\DB;

class DeleteHolidays2024Command extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:delete-2024 {--confirm : Confirm deletion without prompting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Eliminar todos los feriados del año 2024 de la base de datos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🗑️  ELIMINACIÓN DE FERIADOS 2024');
        $this->line('');

        // Contar feriados de 2024
        $holidays2024 = Holiday::whereYear('date', 2024)->get();
        $count = $holidays2024->count();

        if ($count === 0) {
            $this->warn('⚠️  No se encontraron feriados del año 2024 en la base de datos.');
            return 0;
        }

        $this->info("📊 Se encontraron {$count} feriados del año 2024:");
        $this->line('');

        // Mostrar lista de feriados a eliminar
        foreach ($holidays2024 as $holiday) {
            $this->line("   • {$holiday->date} - {$holiday->name}");
        }

        $this->line('');

        // Confirmar eliminación
        if (!$this->option('confirm')) {
            if (!$this->confirm('¿Estás seguro de que quieres eliminar TODOS estos feriados?')) {
                $this->info('❌ Operación cancelada.');
                return 0;
            }
        }

        // Eliminar feriados
        $this->info('🗑️  Eliminando feriados de 2024...');
        
        try {
            $deleted = Holiday::whereYear('date', 2024)->delete();
            
            $this->info("✅ Se eliminaron {$deleted} feriados del año 2024 exitosamente.");
            
            // Verificar que se eliminaron
            $remaining = Holiday::whereYear('date', 2024)->count();
            if ($remaining === 0) {
                $this->info('✅ Verificación: No quedan feriados de 2024 en la base de datos.');
            } else {
                $this->warn("⚠️  Advertencia: Aún quedan {$remaining} feriados de 2024.");
            }
            
            // Mostrar estadísticas actuales
            $this->line('');
            $this->info('📊 Estadísticas actuales de feriados:');
            $stats = DB::table('holidays')
                ->selectRaw('YEAR(date) as year, COUNT(*) as count')
                ->groupBy('year')
                ->orderBy('year')
                ->get();
            
            foreach ($stats as $stat) {
                $this->line("   • Año {$stat->year}: {$stat->count} feriados");
            }
            
        } catch (\Exception $e) {
            $this->error("❌ Error al eliminar feriados: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
