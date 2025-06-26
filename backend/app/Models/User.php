<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'apellido_paterno',
        'apellido_materno',
        'email',
        'password',
        'role',
        'google_id',
        'avatar',
        'verified',
        'active',
        'student_id',
        'career',
        'semester',
        'specialization',
        'rating',
        'total_appointments',
        'dni',
        'celular',
        'fecha_nacimiento'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'verified' => 'boolean',
            'active' => 'boolean',
            'rating' => 'decimal:2',
            'fecha_nacimiento' => 'date',
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is psychologist
     */
    public function isPsychologist(): bool
    {
        return $this->role === 'psychologist';
    }

    /**
     * Check if user is student
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->active;
    }

    /**
     * Check if email is institutional
     */
    public function isInstitutionalEmail(): bool
    {
        return str_ends_with($this->email, '@istta.edu.pe');
    }

    /**
     * Determine role based on email
     */
    public static function determineRoleFromEmail(string $email): string
    {
        if (str_ends_with($email, '@istta.edu.pe')) {
            return 'student';
        } elseif (str_contains($email, '@')) {
            return 'psychologist';
        }
        
        throw new \InvalidArgumentException('Email no válido para el sistema');
    }

    /**
     * Scope to get only active users
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to get only psychologists
     */
    public function scopePsychologists($query)
    {
        return $query->where('role', 'psychologist');
    }

    /**
     * Get user data for API response
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'apellido_paterno' => $this->apellido_paterno,
            'apellido_materno' => $this->apellido_materno,
            'email' => $this->email,
            'role' => $this->role,
            'avatar' => $this->avatar,
            'verified' => $this->verified,
            'active' => $this->active,
            'student_id' => $this->student_id,
            'career' => $this->career,
            'semester' => $this->semester,
            'specialization' => $this->specialization,
            'rating' => $this->rating,
            'total_appointments' => $this->total_appointments,
            'celular' => $this->celular,
            'fecha_nacimiento' => $this->fecha_nacimiento,
        ];
    }

    /**
     * Get the citas for the user (as patient).
     */
    public function citas()
    {
        return $this->hasMany(Cita::class, 'patient_id');
    }

    /**
     * Get the citas for the user (as psychologist).
     */
    public function psychologistCitas()
    {
        return $this->hasMany(Cita::class, 'psychologist_id');
    }

    /**
     * Get the schedules for the user.
     */
    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'psychologist_id');
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    /**
     * Get the psychological sessions for the user (as patient).
     */
    public function psychologicalSessions()
    {
        return $this->hasMany(PsychologicalSession::class, 'patient_id');
    }

    /**
     * Get the psychological sessions for the user (as psychologist).
     */
    public function psychologistSessions()
    {
        return $this->hasMany(PsychologicalSession::class, 'psychologist_id');
    }

    /**
     * Get the psychologist history records.
     */
    public function psychologistHistory()
    {
        return $this->hasMany(PsychologistHistory::class, 'psychologist_id');
    }
}
