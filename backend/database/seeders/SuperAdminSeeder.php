<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear super administrador
        User::create([
            'name' => 'Super Administrador',
            'email' => 'superadmin@tupac-amaru.edu.pe',
            'password' => Hash::make('superadmin123'),
            'role' => 'super_admin',
            'verified' => true,
            'active' => true,
        ]);

        $this->command->info('Super administrador creado exitosamente!');
        $this->command->info('Email: superadmin@tupac-amaru.edu.pe');
        $this->command->info('Contraseña: superadmin123');
    }
}
