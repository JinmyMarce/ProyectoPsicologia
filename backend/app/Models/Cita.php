<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cita extends Model
{
    protected $fillable = [
        'student_id',
        'psychologist_id',
        'fecha',
        'hora',
        'duracion',
        'motivo_consulta',
        'estado',
        'notas',
        // Datos personales del paciente
        'patient_dni',
        'patient_full_name',
        'patient_age',
        'patient_gender',
        'patient_address',
        'patient_study_program',
        'patient_semester',
        // Datos de contacto del paciente
        'patient_phone',
        'patient_email',
        // Contacto de emergencia
        'emergency_contact_name',
        'emergency_contact_relationship',
        'emergency_contact_phone',
        // Información médica
        'medical_history',
        'current_medications',
        'allergies'
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime:H:i',
        'duracion' => 'integer',
        'patient_age' => 'integer',
    ];

    /**
     * Relación con el estudiante
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Relación con el psicólogo
     */
    public function psychologist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'psychologist_id');
    }

    /**
     * Scope para citas activas (no canceladas)
     */
    public function scopeActive($query)
    {
        return $query->where('estado', '!=', 'cancelada');
    }

    /**
     * Scope para citas pendientes
     */
    public function scopePending($query)
    {
        return $query->where('estado', 'pendiente');
    }

    /**
     * Scope para citas confirmadas
     */
    public function scopeConfirmed($query)
    {
        return $query->where('estado', 'confirmada');
    }

    /**
     * Scope para citas completadas
     */
    public function scopeCompleted($query)
    {
        return $query->where('estado', 'completada');
    }

    /**
     * Obtener datos de la cita para API
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'psychologist_id' => $this->psychologist_id,
            'fecha' => $this->fecha->format('Y-m-d'),
            'hora' => $this->hora->format('H:i'),
            'duracion' => $this->duracion,
            'motivo_consulta' => $this->motivo_consulta,
            'estado' => $this->estado,
            'notas' => $this->notas,
            // Datos del paciente
            'patient_dni' => $this->patient_dni,
            'patient_full_name' => $this->patient_full_name,
            'patient_age' => $this->patient_age,
            'patient_gender' => $this->patient_gender,
            'patient_address' => $this->patient_address,
            'patient_phone' => $this->patient_phone,
            'patient_email' => $this->patient_email,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_relationship' => $this->emergency_contact_relationship,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'medical_history' => $this->medical_history,
            'current_medications' => $this->current_medications,
            'allergies' => $this->allergies,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'student' => $this->student ? $this->student->toApiArray() : null,
            'psychologist' => $this->psychologist ? $this->psychologist->toApiArray() : null,
        ];
    }
}
