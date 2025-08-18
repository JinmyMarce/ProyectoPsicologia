<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Holiday;
use App\Services\HolidayCalculatorService;
use Carbon\Carbon;

class HolidaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar tabla antes de insertar
        Holiday::truncate();

        $this->command->info('🎉 Generando feriados para toda la vida del sistema...');

        // Usar el servicio de calculadora para generar automáticamente
        $holidayCalculator = app(HolidayCalculatorService::class);
        
        // Generar feriados desde 2024 hasta 2050
        $startYear = 2024;
        $endYear = 2050;
        
        $this->command->info("📅 Generando feriados desde {$startYear} hasta {$endYear}...");
        
        // Generar todos los feriados automáticamente
        $allHolidays = $holidayCalculator->generateHolidaysForAllYears($startYear, $endYear);
        
        // Insertar en base de datos
        foreach ($allHolidays as $holidayData) {
            Holiday::create($holidayData);
        }

        $totalInserted = count($allHolidays);
        $this->command->info("✅ Se han insertado {$totalInserted} feriados oficiales de Perú ({$startYear}-{$endYear})");
        
        // Estadísticas por tipo
        $nationalCount = Holiday::where('is_national', true)->count();
        $regionalCount = Holiday::where('is_regional', true)->count();
        $fixedCount = Holiday::where('type', 'fijo')->count();
        $movableCount = Holiday::where('type', 'movil')->count();
        
        $this->command->info("📊 Estadísticas:");
        $this->command->info("   • Feriados nacionales: {$nationalCount}");
        $this->command->info("   • Feriados regionales: {$regionalCount}");
        $this->command->info("   • Feriados fijos: {$fixedCount}");
        $this->command->info("   • Feriados móviles: {$movableCount}");
        
        // Mostrar próximos feriados
        $upcomingHolidays = Holiday::getUpcomingHolidays(90)->take(5);
        $this->command->info("🔮 Próximos 5 feriados:");
        foreach ($upcomingHolidays as $holiday) {
            $this->command->info("   • {$holiday->name} - {$holiday->formatted_date}");
        }

        // NOTA: Mantener algunos feriados manuales para compatibilidad
        $this->insertLegacyHolidays();
    }

    /**
     * Insertar algunos feriados legacy para compatibilidad
     */
    private function insertLegacyHolidays(): void
    {
        // Estos son ejemplos de feriados que ya fueron insertados automáticamente,
        // pero los mantenemos aquí para documentación
        $legacyHolidays = [
            // === FERIADOS 2024 ===
            [
                'name' => 'Año Nuevo',
                'date' => '2024-01-01',
                'type' => 'fijo',
                'description' => 'Celebración del primer día del año',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Jueves Santo',
                'date' => '2024-03-28',
                'type' => 'movil',
                'description' => 'Conmemoración de la Última Cena de Jesucristo',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Viernes Santo',
                'date' => '2024-03-29',
                'type' => 'movil',
                'description' => 'Conmemoración de la crucifixión de Jesucristo',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Día del Trabajador',
                'date' => '2024-05-01',
                'type' => 'fijo',
                'description' => 'Día Internacional del Trabajo',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Día de San Pedro y San Pablo',
                'date' => '2024-06-29',
                'type' => 'fijo',
                'description' => 'Festividad religiosa católica',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Día de la Independencia',
                'date' => '2024-07-28',
                'type' => 'fijo',
                'description' => 'Proclamación de la independencia del Perú',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Día de las Fuerzas Armadas',
                'date' => '2024-07-29',
                'type' => 'fijo',
                'description' => 'Día en honor a las Fuerzas Armadas del Perú',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Santa Rosa de Lima',
                'date' => '2024-08-30',
                'type' => 'fijo',
                'description' => 'Día de la patrona de Lima y del Perú',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Combate de Angamos',
                'date' => '2024-10-08',
                'type' => 'fijo',
                'description' => 'Conmemoración del heroísmo de Miguel Grau',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Todos los Santos',
                'date' => '2024-11-01',
                'type' => 'fijo',
                'description' => 'Día de Todos los Santos',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Inmaculada Concepción',
                'date' => '2024-12-08',
                'type' => 'fijo',
                'description' => 'Festividad católica de la Inmaculada Concepción',
                'is_national' => true,
                'year' => 2024
            ],
            [
                'name' => 'Navidad',
                'date' => '2024-12-25',
                'type' => 'fijo',
                'description' => 'Celebración del nacimiento de Jesucristo',
                'is_national' => true,
                'year' => 2024
            ],

            // === FERIADOS 2025 ===
            [
                'name' => 'Año Nuevo',
                'date' => '2025-01-01',
                'type' => 'fijo',
                'description' => 'Celebración del primer día del año',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Jueves Santo',
                'date' => '2025-04-17',
                'type' => 'movil',
                'description' => 'Conmemoración de la Última Cena de Jesucristo',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Viernes Santo',
                'date' => '2025-04-18',
                'type' => 'movil',
                'description' => 'Conmemoración de la crucifixión de Jesucristo',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Día del Trabajador',
                'date' => '2025-05-01',
                'type' => 'fijo',
                'description' => 'Día Internacional del Trabajo',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Día de San Pedro y San Pablo',
                'date' => '2025-06-29',
                'type' => 'fijo',
                'description' => 'Festividad religiosa católica',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Día de la Independencia',
                'date' => '2025-07-28',
                'type' => 'fijo',
                'description' => 'Proclamación de la independencia del Perú',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Día de las Fuerzas Armadas',
                'date' => '2025-07-29',
                'type' => 'fijo',
                'description' => 'Día en honor a las Fuerzas Armadas del Perú',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Santa Rosa de Lima',
                'date' => '2025-08-30',
                'type' => 'fijo',
                'description' => 'Día de la patrona de Lima y del Perú',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Combate de Angamos',
                'date' => '2025-10-08',
                'type' => 'fijo',
                'description' => 'Conmemoración del heroísmo de Miguel Grau',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Todos los Santos',
                'date' => '2025-11-01',
                'type' => 'fijo',
                'description' => 'Día de Todos los Santos',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Inmaculada Concepción',
                'date' => '2025-12-08',
                'type' => 'fijo',
                'description' => 'Festividad católica de la Inmaculada Concepción',
                'is_national' => true,
                'year' => 2025
            ],
            [
                'name' => 'Navidad',
                'date' => '2025-12-25',
                'type' => 'fijo',
                'description' => 'Celebración del nacimiento de Jesucristo',
                'is_national' => true,
                'year' => 2025
            ],

            // === FERIADOS REGIONALES ESPECÍFICOS (ejemplos) ===
            [
                'name' => 'Señor de los Milagros',
                'date' => '2024-10-18',
                'type' => 'fijo',
                'description' => 'Procesión del Señor de los Milagros en Lima',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Lima',
                'year' => 2024
            ],
            [
                'name' => 'Señor de los Milagros',
                'date' => '2025-10-18',
                'type' => 'fijo',
                'description' => 'Procesión del Señor de los Milagros en Lima',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Lima',
                'year' => 2025
            ],
            [
                'name' => 'Inti Raymi',
                'date' => '2024-06-24',
                'type' => 'fijo',
                'description' => 'Fiesta del Sol en Cusco',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Cusco',
                'year' => 2024
            ],
            [
                'name' => 'Inti Raymi',
                'date' => '2025-06-24',
                'type' => 'fijo',
                'description' => 'Fiesta del Sol en Cusco',
                'is_national' => false,
                'is_regional' => true,
                'region' => 'Cusco',
                'year' => 2025
            ],

            // === FERIADOS 2026 (preview) ===
            [
                'name' => 'Año Nuevo',
                'date' => '2026-01-01',
                'type' => 'fijo',
                'description' => 'Celebración del primer día del año',
                'is_national' => true,
                'year' => 2026
            ],
            [
                'name' => 'Día del Trabajador',
                'date' => '2026-05-01',
                'type' => 'fijo',
                'description' => 'Día Internacional del Trabajo',
                'is_national' => true,
                'year' => 2026
            ],
            [
                'name' => 'Día de la Independencia',
                'date' => '2026-07-28',
                'type' => 'fijo',
                'description' => 'Proclamación de la independencia del Perú',
                'is_national' => true,
                'year' => 2026
            ],
            [
                'name' => 'Día de las Fuerzas Armadas',
                'date' => '2026-07-29',
                'type' => 'fijo',
                'description' => 'Día en honor a las Fuerzas Armadas del Perú',
                'is_national' => true,
                'year' => 2026
            ],
            [
                'name' => 'Navidad',
                'date' => '2026-12-25',
                'type' => 'fijo',
                'description' => 'Celebración del nacimiento de Jesucristo',
                'is_national' => true,
                'year' => 2026
            ]
        ];

        // Los feriados legacy ya no son necesarios porque se generan automáticamente
        // Pero mantenemos la estructura para futura referencia
        $this->command->info('📝 Feriados legacy documentados para referencia');
    }
}
