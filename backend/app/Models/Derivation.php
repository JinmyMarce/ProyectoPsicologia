<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Derivation extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'tutor_id',
        'psychologist_id',
        'reason',
        'urgency',
        'status',
        'notes',
        'psychologist_notes',
        'assigned_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * El estudiante derivado
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * El tutor que realiza la derivación
     */
    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    /**
     * El psicólogo asignado
     */
    public function psychologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    /**
     * Scope para derivaciones pendientes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope para derivaciones asignadas
     */
    public function scopeAssigned($query)
    {
        return $query->where('status', 'assigned');
    }

    /**
     * Scope para derivaciones en progreso
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    /**
     * Scope para derivaciones por urgencia
     */
    public function scopeByUrgency($query, $urgency)
    {
        return $query->where('urgency', $urgency);
    }

    /**
     * Scope para derivaciones críticas
     */
    public function scopeCritical($query)
    {
        return $query->where('urgency', 'critical');
    }

    /**
     * Asignar psicólogo a la derivación
     */
    public function assignPsychologist($psychologistId)
    {
        $this->update([
            'psychologist_id' => $psychologistId,
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);
    }

    /**
     * Iniciar tratamiento
     */
    public function startTreatment()
    {
        $this->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);
    }

    /**
     * Completar derivación
     */
    public function complete()
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Cancelar derivación
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
            'student_id' => $this->student_id,
            'tutor_id' => $this->tutor_id,
            'psychologist_id' => $this->psychologist_id,
            'reason' => $this->reason,
            'urgency' => $this->urgency,
            'status' => $this->status,
            'notes' => $this->notes,
            'psychologist_notes' => $this->psychologist_notes,
            'assigned_at' => $this->assigned_at?->toISOString(),
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            // Relaciones
            'student' => $this->student?->toApiArray(),
            'tutor' => $this->tutor?->toApiArray(),
            'psychologist' => $this->psychologist?->toApiArray(),
        ];
    }
}


