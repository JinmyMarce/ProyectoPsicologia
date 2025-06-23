<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsychologicalSession extends Model
{
    use HasFactory;

    protected $table = 'psychological_sessions';

    protected $fillable = [
        'patient_id',
        'psychologist_id',
        'fecha_sesion',
        'temas_tratados',
        'notas',
        'estado',
        'duracion_minutos',
        'tipo_sesion',
        'objetivos',
        'conclusiones'
    ];

    protected $casts = [
        'fecha_sesion' => 'datetime',
        'duracion_minutos' => 'integer'
    ];

    /**
     * Get the patient for this session.
     */
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Get the psychologist for this session.
     */
    public function psychologist()
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    /**
     * Scope for future sessions
     */
    public function scopeFuture($query)
    {
        return $query->where('fecha_sesion', '>', now());
    }

    /**
     * Scope for past sessions
     */
    public function scopePast($query)
    {
        return $query->where('fecha_sesion', '<', now());
    }

    /**
     * Scope for today's sessions
     */
    public function scopeToday($query)
    {
        return $query->whereDate('fecha_sesion', today());
    }

    /**
     * Scope for sessions by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('estado', $status);
    }

    /**
     * Scope for sessions by psychologist
     */
    public function scopeByPsychologist($query, $psychologistId)
    {
        return $query->where('psychologist_id', $psychologistId);
    }

    /**
     * Scope for sessions by patient
     */
    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Scope para sesiones por estado
     */
    public function scopeByEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope para sesiones programadas
     */
    public function scopeProgramadas($query)
    {
        return $query->where('estado', 'Programada');
    }

    /**
     * Scope para sesiones realizadas
     */
    public function scopeRealizadas($query)
    {
        return $query->where('estado', 'Realizada');
    }

    /**
     * Scope para sesiones canceladas
     */
    public function scopeCanceladas($query)
    {
        return $query->where('estado', 'Cancelada');
    }

    /**
     * Scope para sesiones por fecha
     */
    public function scopeByDate($query, $date)
    {
        return $query->whereDate('fecha_sesion', $date);
    }

    /**
     * Scope para sesiones por rango de fechas
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('fecha_sesion', [$startDate, $endDate]);
    }

    /**
     * Obtener la duración formateada
     */
    public function getDurationFormattedAttribute()
    {
        if (!$this->duracion_minutos) {
            return 'No especificada';
        }

        $hours = floor($this->duracion_minutos / 60);
        $minutes = $this->duracion_minutos % 60;

        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }

    /**
     * Verificar si la sesión está programada
     */
    public function isProgramada()
    {
        return $this->estado === 'Programada';
    }

    /**
     * Verificar si la sesión está realizada
     */
    public function isRealizada()
    {
        return $this->estado === 'Realizada';
    }

    /**
     * Verificar si la sesión está cancelada
     */
    public function isCancelada()
    {
        return $this->estado === 'Cancelada';
    }

    /**
     * Verificar si la sesión es futura
     */
    public function isFuture()
    {
        return $this->fecha_sesion > now();
    }

    /**
     * Verificar si la sesión es pasada
     */
    public function isPast()
    {
        return $this->fecha_sesion < now();
    }

    /**
     * Obtener el color del estado para la UI
     */
    public function getStatusColorAttribute()
    {
        switch ($this->estado) {
            case 'Programada':
                return 'blue';
            case 'Realizada':
                return 'green';
            case 'Cancelada':
                return 'red';
            default:
                return 'gray';
        }
    }
}
