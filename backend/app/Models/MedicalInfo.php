<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalInfo extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'medical_history',
        'current_medications',
        'allergies',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
