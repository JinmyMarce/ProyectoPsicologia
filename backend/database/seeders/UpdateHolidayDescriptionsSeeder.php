<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Holiday;
use Illuminate\Support\Facades\DB;

class UpdateHolidayDescriptionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔄 Actualizando descripciones de feriados...');

        // Array con las descripciones actualizadas
        $holidayDescriptions = [
            'Año Nuevo' => 'Comienza el año civil y simboliza renovación, esperanza y nuevos objetivos. Muchas personas reciben el año nuevo celebrando en familia o con eventos sociales y culturales.',
            
            'Jueves Santo' => 'Es una fecha solemne que recuerda la Última Cena de Jesús con sus discípulos. En todo el país, se realizan ceremonias religiosas, representaciones y procesiones cargadas de espiritualidad y recogimiento.',
            
            'Viernes Santo' => 'Se conmemora la Pasión y crucifixión de Jesucristo, siendo uno de los días más emotivos del calendario católico. En muchas regiones hay procesiones que recorren calles con imágenes de Jesús y la Virgen, además de actos litúrgicos profundos.',
            
            'Día del Trabajo' => 'Celebrado en reconocimiento al esfuerzo de los trabajadores y su lucha por derechos laborales. Es un día de descanso y también de debates sobre condiciones laborales.',
            
            'Combate del Callao' => 'Rememora el ataque español al puerto del Callao en 1866 y el heroico sacrificio de José Gálvez Egúsquiza y defensores locales. Es un símbolo de unidad nacional y defensa de la soberanía.',
            
            'Batalla de Arica y Día de la Bandera' => 'Se honra el heroísmo de Alfonso Ugarte y otros caídos en la defensa de Arica durante la Guerra del Pacífico. También se celebra la bandera como símbolo patrio.',
            
            'San Pedro y San Pablo' => 'Festividad que honra a los apóstoles Pedro y Pablo, especialmente venerados en comunidades pesqueras. Se realizan misas y celebraciones al filo del mar en honor a su legado.',
            
            'Día de la Fuerza Aérea del Perú' => 'Se celebra a quienes integran la aviación militar peruana. Hay ceremonias oficiales para recordar su labor y sacrificio por la defensa del espacio aéreo nacional.',
            
            'Fiestas Patrias' => 'Fechas más importantes del país: el 28 se conmemora la Independencia proclamada en 1821, con desfiles y eventos. El 29 se dedica a las Fuerzas Armadas y la Policía Nacional, reafirmando su compromiso con la nación.',
            
            'Batalla de Junín' => 'Se recuerda el enfrentamiento decisivo de 1824, clave en la campaña libertadora sudamericana. Es una jornada de orgullo nacional y reconocimiento histórico.',
            
            'Santa Rosa de Lima' => 'Es el día de la primera santa de América y patrona de Lima; se llevan a cabo misas, procesiones y actos en su honor, especialmente en la capital.',
            
            'Combate de Angamos' => 'Homenaje al acto heroico del almirante Miguel Grau en defensa del Perú durante la Guerra del Pacífico. Es día de memoria naval y civismo.',
            
            'Todos los Santos' => 'Día en que las familias recuerdan a los seres queridos fallecidos con visitas a cementerios, misas y rituales de memoria.',
            
            'Inmaculada Concepción' => 'Festividad religiosa en honor a la Virgen María, muy celebrada en el calendario católico peruano, con misas y devoción profunda.',
            
            'Batalla de Ayacucho' => 'Se conmemora la victoria que consolidó la independencia de América del Sur en 1824. Es una afirmación del nacimiento del país libre y soberano.',
            
            'Navidad' => 'Celebración del nacimiento de Jesucristo. Es una fecha profundamente familiar y cultural, con intercambios de regalos, cenas especiales, villancicos y misas.'
        ];

        $updatedCount = 0;
        $errors = [];

        foreach ($holidayDescriptions as $holidayName => $description) {
            try {
                // Buscar feriados por nombre (puede haber varios años)
                $holidays = Holiday::where('name', 'LIKE', "%{$holidayName}%")->get();
                
                if ($holidays->count() > 0) {
                    foreach ($holidays as $holiday) {
                        $holiday->update(['description' => $description]);
                        $updatedCount++;
                    }
                    $this->command->info("✅ Actualizado: {$holidayName}");
                } else {
                    $errors[] = "❌ No encontrado: {$holidayName}";
                }
            } catch (\Exception $e) {
                $errors[] = "❌ Error actualizando {$holidayName}: " . $e->getMessage();
            }
        }

        $this->command->info("\n📊 Resumen de actualización:");
        $this->command->info("✅ Feriados actualizados: {$updatedCount}");
        
        if (count($errors) > 0) {
            $this->command->warn("⚠️ Errores encontrados:");
            foreach ($errors as $error) {
                $this->command->warn($error);
            }
        }

        $this->command->info("\n🎉 Proceso de actualización completado!");
    }
}






