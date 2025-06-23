<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class PsychologistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $psychologists = [
            [
                'name' => 'Dr. María Elena Rodríguez',
                'email' => 'maria.rodriguez@tupac-amaru.edu.pe',
                'password' => bcrypt('password123'),
                'role' => 'psychologist',
                'dni' => '90000001',
                'active' => true,
            ],
            [
                'name' => 'Dr. Carlos Alberto Martínez',
                'email' => 'carlos.martinez@tupac-amaru.edu.pe',
                'password' => bcrypt('password123'),
                'role' => 'psychologist',
                'dni' => '90000002',
                'active' => true,
            ],
            [
                'name' => 'Dra. Ana Patricia López',
                'email' => 'ana.lopez@tupac-amaru.edu.pe',
                'password' => bcrypt('password123'),
                'role' => 'psychologist',
                'dni' => '90000003',
                'active' => true,
            ],
        ];

        foreach ($psychologists as $psychologist) {
            User::create($psychologist);
        }

        $this->command->info('Psicólogos creados exitosamente!');
        $this->command->info('Credenciales de prueba:');
        foreach ($psychologists as $psychologist) {
            $this->command->info("Email: {$psychologist['email']} | Contraseña: password123");
        }
    }
}
