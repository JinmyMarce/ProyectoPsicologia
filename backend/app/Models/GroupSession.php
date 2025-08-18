<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

class GroupSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutor_id',
        'classroom',
        'date',
        'start_time',
        'end_time',
        'day_of_week',
        'topic',
        'max_students',
        'registered_students',
        'status',
        'notes',
        'session_summary',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'registered_students' => 'array',
        'max_students' => 'integer',
    ];

    /**
     * El tutor que organiza la sesión
     */
    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    /**
     * Los estudiantes registrados en la sesión
     */
    public function students()
    {
        return User::whereIn('id', $this->registered_students ?? [])->get();
    }

    /**
     * Scope para sesiones programadas
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope para sesiones en progreso
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope para sesiones completadas
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope para sesiones por día de la semana
     */
    public function scopeByDay($query, $day)
    {
        return $query->where('day_of_week', $day);
    }

    /**
     * Scope para sesiones futuras
     */
    public function scopeFuture($query)
    {
        return $query->where('date', '>=', now()->toDateString());
    }

    /**
     * Scope para sesiones pasadas
     */
    public function scopePast($query)
    {
        return $query->where('date', '<', now()->toDateString());
    }

    /**
     * Scope para sesiones de hoy
     */
    public function scopeToday($query)
    {
        return $query->where('date', now()->toDateString());
    }

    /**
     * Validar que la sesión sea en horario permitido (1-2 AM, Lunes-Viernes)
     */
    public function isValidTime(): bool
    {
        // Verificar horario (1:00 - 2:00 AM)
        $startHour = Carbon::parse($this->start_time)->hour;
        $endHour = Carbon::parse($this->end_time)->hour;
        
        if ($startHour !== 1 || $endHour !== 2) {
            return false;
        }

        // Verificar día de la semana (lunes a viernes)
        $allowedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        if (!in_array($this->day_of_week, $allowedDays)) {
            return false;
        }

        return true;
    }

    /**
     * Verificar si la sesión tiene cupos disponibles
     */
    public function hasAvailableSlots(): bool
    {
        $registeredCount = count($this->registered_students ?? []);
        return $registeredCount < $this->max_students;
    }

    /**
     * Registrar estudiante en la sesión
     */
    public function registerStudent($studentId): bool
    {
        if (!$this->hasAvailableSlots()) {
            return false;
        }

        $registeredStudents = $this->registered_students ?? [];
        
        if (!in_array($studentId, $registeredStudents)) {
            $registeredStudents[] = $studentId;
            $this->update(['registered_students' => $registeredStudents]);
            return true;
        }

        return false;
    }

    /**
     * Desregistrar estudiante de la sesión
     */
    public function unregisterStudent($studentId): bool
    {
        $registeredStudents = $this->registered_students ?? [];
        $key = array_search($studentId, $registeredStudents);
        
        if ($key !== false) {
            unset($registeredStudents[$key]);
            $this->update(['registered_students' => array_values($registeredStudents)]);
            return true;
        }

        return false;
    }

    /**
     * Iniciar sesión
     */
    public function start()
    {
        $this->update([
            'status' => 'in_progress',
        ]);
    }

    /**
     * Completar sesión
     */
    public function complete($summary = null)
    {
        $this->update([
            'status' => 'completed',
            'session_summary' => $summary,
        ]);
    }

    /**
     * Cancelar sesión
     */
    public function cancel()
    {
        $this->update([
            'status' => 'cancelled',
        ]);
    }

    /**
     * Get data for API response
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'tutor_id' => $this->tutor_id,
            'classroom' => $this->classroom,
            'date' => $this->date->toDateString(),
            'start_time' => $this->start_time->format('H:i'),
            'end_time' => $this->end_time->format('H:i'),
            'day_of_week' => $this->day_of_week,
            'topic' => $this->topic,
            'max_students' => $this->max_students,
            'registered_students' => $this->registered_students ?? [],
            'registered_count' => count($this->registered_students ?? []),
            'available_slots' => $this->max_students - count($this->registered_students ?? []),
            'status' => $this->status,
            'notes' => $this->notes,
            'session_summary' => $this->session_summary,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            // Relaciones
            'tutor' => $this->tutor?->toApiArray(),
            'students' => $this->students()->map(function ($student) {
                return $student->toApiArray();
            }),
        ];
    }
}

