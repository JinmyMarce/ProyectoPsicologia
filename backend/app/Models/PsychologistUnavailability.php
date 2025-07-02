<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsychologistUnavailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'psychologist_id',
        'date',
        'start_time',
        'end_time',
        'motivo',
    ];

    public function psychologist()
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }
}
