<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class AddPhoneToUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Agregar teléfonos de ejemplo a usuarios existentes
        $users = User::whereNull('phone')->get();
        
        foreach ($users as $index => $user) {
            // Generar un teléfono de 9 dígitos único
            $phone = '9' . str_pad($index + 1, 8, '0', STR_PAD_LEFT);
            $user->update(['phone' => $phone]);
        }
        
        $this->command->info('Teléfonos agregados a ' . $users->count() . ' usuarios.');
    }
}
