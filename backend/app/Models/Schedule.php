<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'psychologist_id',
        'date',
        'start_time',
        'end_time',
        'is_available',
        'is_blocked',
        'block_reason',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_available' => 'boolean',
        'is_blocked' => 'boolean',
    ];

    /**
     * Relación con el psicólogo
     */
    public function psychologist()
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    /**
     * Relación con las citas
     */
    public function appointments()
    {
        return $this->hasMany(Cita::class, 'schedule_id');
    }

    /**
     * Scope para horarios disponibles
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)->where('is_blocked', false);
    }

    /**
     * Scope para horarios bloqueados
     */
    public function scopeBlocked($query)
    {
        return $query->where('is_blocked', true);
    }

    /**
     * Scope para horarios por fecha
     */
    public function scopeByDate($query, $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Scope para horarios por rango de fechas
     */
    public function scopeByDateRange($query, $dateFrom, $dateTo)
    {
        return $query->whereBetween('date', [$dateFrom, $dateTo]);
    }

    /**
     * Scope para horarios por psicólogo
     */
    public function scopeByPsychologist($query, $psychologistId)
    {
        return $query->where('psychologist_id', $psychologistId);
    }

    /**
     * Verificar si el horario está disponible para agendar
     */
    public function isAvailableForBooking()
    {
        return $this->is_available && !$this->is_blocked && !$this->appointments()->exists();
    }

    /**
     * Obtener la duración del horario en minutos
     */
    public function getDurationInMinutes()
    {
        $start = \Carbon\Carbon::parse($this->start_time);
        $end = \Carbon\Carbon::parse($this->end_time);
        return $start->diffInMinutes($end);
    }

    /**
     * Obtener la duración del horario en formato legible
     */
    public function getDurationFormatted()
    {
        $minutes = $this->getDurationInMinutes();
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        if ($hours > 0 && $remainingMinutes > 0) {
            return "{$hours}h {$remainingMinutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$remainingMinutes}m";
        }
    }

    /**
     * Verificar si hay conflictos con otro horario
     */
    public function hasConflictWith($otherSchedule)
    {
        $thisStart = \Carbon\Carbon::parse($this->start_time);
        $thisEnd = \Carbon\Carbon::parse($this->end_time);
        $otherStart = \Carbon\Carbon::parse($otherSchedule->start_time);
        $otherEnd = \Carbon\Carbon::parse($otherSchedule->end_time);

        return $thisStart < $otherEnd && $thisEnd > $otherStart;
    }

    /**
     * Obtener el estado del horario
     */
    public function getStatusAttribute()
    {
        if ($this->is_blocked) {
            return 'bloqueado';
        }

        if (!$this->is_available) {
            return 'no disponible';
        }

        if ($this->appointments()->exists()) {
            return 'agendado';
        }

        return 'disponible';
    }

    /**
     * Obtener el color del estado para la UI
     */
    public function getStatusColorAttribute()
    {
        switch ($this->status) {
            case 'disponible':
                return 'green';
            case 'agendado':
                return 'blue';
            case 'bloqueado':
                return 'red';
            case 'no disponible':
                return 'gray';
            default:
                return 'gray';
        }
    }
} 