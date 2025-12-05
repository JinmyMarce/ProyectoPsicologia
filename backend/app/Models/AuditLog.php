<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'action',
        'resource_type',
        'resource_id',
        'ip_address',
        'user_agent',
        'details',
        'old_values',
        'new_values',
        'status',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el usuario que realizó la acción
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para filtrar por acción
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope para filtrar por tipo de recurso
     */
    public function scopeByResourceType($query, string $resourceType)
    {
        return $query->where('resource_type', $resourceType);
    }

    /**
     * Scope para filtrar por usuario
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para filtrar por fecha
     */
    public function scopeByDate($query, string $date)
    {
        return $query->whereDate('created_at', $date);
    }

    /**
     * Scope para obtener logs recientes
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
