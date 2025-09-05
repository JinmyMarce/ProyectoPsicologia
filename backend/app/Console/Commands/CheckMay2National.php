<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class CheckMay2National extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:check-may-2-national';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar el estado is_national de los feriados del 2 de mayo';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando estado is_national de feriados del 2 de mayo...');
        
        $holidays = Holiday::where('name', 'Combate del 2 de Mayo')->get();
        
        if ($holidays->isEmpty()) {
            $this->error('❌ No se encontraron feriados del 2 de mayo');
            return;
        }
        
        $this->info("✅ Se encontraron {$holidays->count()} feriados del 2 de mayo:");
        
        foreach ($holidays as $holiday) {
            $status = $holiday->is_national ? '✅ Nacional' : '❌ No Nacional';
            $this->line("  - ID: {$holiday->id}, Año: {$holiday->year}, Fecha: {$holiday->date}, Estado: {$status}");
        }
        
        // Contar nacionales vs no nacionales
        $nationalCount = $holidays->where('is_national', true)->count();
        $notNationalCount = $holidays->where('is_national', false)->count();
        $nullCount = $holidays->whereNull('is_national')->count();
        
        $this->info('');
        $this->info('📊 Resumen:');
        $this->info("  - Nacionales: {$nationalCount}");
        $this->info("  - No Nacionales: {$notNationalCount}");
        $this->info("  - Sin valor (NULL): {$nullCount}");
        
        if ($nullCount > 0 || $notNationalCount > 0) {
            $this->warn('⚠️  Algunos feriados no son nacionales. Esto puede causar que no aparezcan en la API.');
        }
        
        // Probar la consulta que usa la API
        $this->info('');
        $this->info('🧪 Probando consulta de la API...');
        
        $apiQuery = Holiday::active()->national()->forYear(2025)->get();
        $may2InApi = $apiQuery->where('name', 'Combate del 2 de Mayo')->first();
        
        if ($may2InApi) {
            $this->info("✅ Feriado del 2 de mayo encontrado en consulta de API (ID: {$may2InApi->id})");
        } else {
            $this->error("❌ Feriado del 2 de mayo NO encontrado en consulta de API");
            $this->info("📋 Feriados encontrados en la consulta:");
            foreach ($apiQuery as $holiday) {
                $this->line("  - {$holiday->name} ({$holiday->date})");
            }
        }
    }
}
