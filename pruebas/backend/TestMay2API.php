<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Holiday;

class TestMay2API extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:test-may-2-api';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar la API del feriado del 2 de mayo';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Probando API del feriado del 2 de mayo...');
        
        // Probar años específicos
        $testYears = [2025, 2026, 2030];
        
        foreach ($testYears as $year) {
            $this->info("📅 Probando año: {$year}");
            
            $holiday = Holiday::whereRaw('DAY(date) = 2 AND MONTH(date) = 5 AND YEAR(date) = ?', [$year])
                             ->where('name', 'Combate del 2 de Mayo')
                             ->first();
            
            if ($holiday) {
                $this->info("✅ Feriado encontrado:");
                $this->line("  - ID: {$holiday->id}");
                $this->line("  - Nombre: {$holiday->name}");
                $this->line("  - Fecha: {$holiday->date}");
                $this->line("  - Tipo: {$holiday->type}");
                $this->line("  - Descripción: {$holiday->description}");
            } else {
                $this->error("❌ Feriado NO encontrado para el año {$year}");
                
                // Verificar qué feriados hay en esa fecha
                $otherHolidays = Holiday::whereRaw('DAY(date) = 2 AND MONTH(date) = 5 AND YEAR(date) = ?', [$year])->get();
                if ($otherHolidays->isNotEmpty()) {
                    $this->warn("⚠️  Otros feriados encontrados en 2 de mayo {$year}:");
                    foreach ($otherHolidays as $other) {
                        $this->line("  - {$other->name} (ID: {$other->id})");
                    }
                } else {
                    $this->error("❌ No hay ningún feriado en 2 de mayo {$year}");
                }
            }
            
            $this->line('');
        }
        
        // Probar la API directamente
        $this->info('🌐 Probando API HTTP...');
        
        $url = "http://localhost:8000/api/holidays?year=2025";
        $this->line("URL: {$url}");
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            if ($data && isset($data['data'])) {
                $may2Holiday = null;
                foreach ($data['data'] as $holiday) {
                    $date = new \DateTime($holiday['date']);
                    if ($date->format('m-d') === '05-02') {
                        $may2Holiday = $holiday;
                        break;
                    }
                }
                
                if ($may2Holiday) {
                    $this->info("✅ API: Feriado del 2 de mayo encontrado:");
                    $this->line("  - ID: {$may2Holiday['id']}");
                    $this->line("  - Nombre: {$may2Holiday['name']}");
                    $this->line("  - Fecha: {$may2Holiday['date']}");
                } else {
                    $this->error("❌ API: Feriado del 2 de mayo NO encontrado en la respuesta");
                }
            } else {
                $this->error("❌ API: Respuesta inválida");
            }
        } else {
            $this->error("❌ API: Error HTTP {$httpCode}");
        }
    }
}
