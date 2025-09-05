<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class CheckHolidayTypes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:check-types';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar qué tipos de feriados existen en la base de datos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Verificando tipos de feriados en la base de datos...');
        
        $types = Holiday::select('type')->distinct()->pluck('type');
        
        if ($types->isEmpty()) {
            $this->error('❌ No se encontraron tipos de feriados');
            return;
        }
        
        $this->info('✅ Tipos de feriados encontrados:');
        foreach ($types as $type) {
            $this->line("  - '{$type}'");
        }
        
        $this->info('');
        $this->info('📊 Ejemplos de feriados por tipo:');
        foreach ($types as $type) {
            $count = Holiday::where('type', $type)->count();
            $example = Holiday::where('type', $type)->first();
            $this->line("  - '{$type}': {$count} feriados (ejemplo: {$example->name})");
        }
    }
}
