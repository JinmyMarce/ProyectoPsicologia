<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsychologistHistory extends Model
{
    use HasFactory;

    protected $table = 'psychologist_history';

    protected $fillable = [
        'original_user_id',
        'name',
        'email',
        'role',
        'specialization',
        'rating',
        'total_appointments',
        'avatar',
        'google_id',
        'verified',
        'deactivated_at',
        'deactivated_by',
        'deactivation_reason',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'verified' => 'boolean',
        'deactivated_at' => 'datetime',
    ];

    public function originalUser()
    {
        return $this->belongsTo(User::class, 'original_user_id');
    }
}
