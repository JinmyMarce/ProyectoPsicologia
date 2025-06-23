<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'read',
        'data',
    ];

    protected $casts = [
        'read' => 'boolean',
        'data' => 'array',
    ];

    /**
     * Relación con el usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para notificaciones no leídas
     */
    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    /**
     * Scope para notificaciones leídas
     */
    public function scopeRead($query)
    {
        return $query->where('read', true);
    }

    /**
     * Scope para notificaciones por tipo
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para notificaciones recientes
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Marcar como leída
     */
    public function markAsRead()
    {
        $this->update(['read' => true]);
    }

    /**
     * Marcar como no leída
     */
    public function markAsUnread()
    {
        $this->update(['read' => false]);
    }

    /**
     * Obtener el icono según el tipo
     */
    public function getIconAttribute()
    {
        switch ($this->type) {
            case 'appointment':
                return 'calendar';
            case 'reminder':
                return 'clock';
            case 'status':
                return 'check-circle';
            case 'system':
                return 'info';
            default:
                return 'bell';
        }
    }

    /**
     * Obtener el color según el tipo
     */
    public function getColorAttribute()
    {
        switch ($this->type) {
            case 'appointment':
                return 'blue';
            case 'reminder':
                return 'yellow';
            case 'status':
                return 'green';
            case 'system':
                return 'gray';
            default:
                return 'gray';
        }
    }

    /**
     * Obtener el tiempo transcurrido
     */
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Crear notificación de cita
     */
    public static function createAppointmentNotification($userId, $title, $message, $data = [])
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'appointment',
            'title' => $title,
            'message' => $message,
            'read' => false,
            'data' => $data,
        ]);
    }

    /**
     * Crear notificación de recordatorio
     */
    public static function createReminderNotification($userId, $title, $message, $data = [])
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'reminder',
            'title' => $title,
            'message' => $message,
            'read' => false,
            'data' => $data,
        ]);
    }

    /**
     * Crear notificación de cambio de estado
     */
    public static function createStatusNotification($userId, $title, $message, $data = [])
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'status',
            'title' => $title,
            'message' => $message,
            'read' => false,
            'data' => $data,
        ]);
    }

    /**
     * Crear notificación del sistema
     */
    public static function createSystemNotification($userId, $title, $message, $data = [])
    {
        return self::create([
            'user_id' => $userId,
            'type' => 'system',
            'title' => $title,
            'message' => $message,
            'read' => false,
            'data' => $data,
        ]);
    }

    /**
     * Enviar notificación a múltiples usuarios
     */
    public static function sendToMultipleUsers($userIds, $type, $title, $message, $data = [])
    {
        $notifications = [];
        
        foreach ($userIds as $userId) {
            $notifications[] = self::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'read' => false,
                'data' => $data,
            ]);
        }

        return $notifications;
    }

    /**
     * Enviar notificación a todos los usuarios con un rol específico
     */
    public static function sendToUsersByRole($role, $type, $title, $message, $data = [])
    {
        $userIds = User::where('role', $role)->where('active', true)->pluck('id');
        return self::sendToMultipleUsers($userIds, $type, $title, $message, $data);
    }

    /**
     * Limpiar notificaciones antiguas
     */
    public static function cleanOldNotifications($days = 30)
    {
        return self::where('created_at', '<', now()->subDays($days))->delete();
    }

    /**
     * Obtener estadísticas de notificaciones
     */
    public static function getStats($userId = null)
    {
        $query = $userId ? self::where('user_id', $userId) : self::query();

        return [
            'total' => $query->count(),
            'unread' => $query->where('read', false)->count(),
            'read' => $query->where('read', true)->count(),
            'by_type' => [
                'appointment' => $query->where('type', 'appointment')->count(),
                'reminder' => $query->where('type', 'reminder')->count(),
                'status' => $query->where('type', 'status')->count(),
                'system' => $query->where('type', 'system')->count(),
            ]
        ];
    }
} 