<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'recipient_id',
        'subject',
        'content',
        'read',
        'read_at',
        'priority',
        'attachments',
        'type',
        'related_id',
        'related_type'
    ];

    protected $casts = [
        'read' => 'boolean',
        'read_at' => 'datetime',
        'attachments' => 'array',
    ];

    /**
     * Relación con el remitente
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Relación con el destinatario
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Scope para mensajes no leídos
     */
    public function scopeUnread($query)
    {
        return $query->where('read', false);
    }

    /**
     * Scope para mensajes leídos
     */
    public function scopeRead($query)
    {
        return $query->where('read', true);
    }

    /**
     * Scope para mensajes por tipo
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para mensajes por prioridad
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope para mensajes recientes
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope para mensajes enviados por un usuario
     */
    public function scopeSentBy($query, $userId)
    {
        return $query->where('sender_id', $userId);
    }

    /**
     * Scope para mensajes recibidos por un usuario
     */
    public function scopeReceivedBy($query, $userId)
    {
        return $query->where('recipient_id', $userId);
    }

    /**
     * Scope para conversación entre dos usuarios
     */
    public function scopeConversation($query, $user1Id, $user2Id)
    {
        return $query->where(function($q) use ($user1Id, $user2Id) {
            $q->where(function($subQ) use ($user1Id, $user2Id) {
                $subQ->where('sender_id', $user1Id)
                      ->where('recipient_id', $user2Id);
            })->orWhere(function($subQ) use ($user1Id, $user2Id) {
                $subQ->where('sender_id', $user2Id)
                      ->where('recipient_id', $user1Id);
            });
        });
    }

    /**
     * Marcar como leído
     */
    public function markAsRead()
    {
        $this->update([
            'read' => true,
            'read_at' => now()
        ]);
    }

    /**
     * Marcar como no leído
     */
    public function markAsUnread()
    {
        $this->update([
            'read' => false,
            'read_at' => null
        ]);
    }

    /**
     * Obtener el icono según la prioridad
     */
    public function getPriorityIconAttribute()
    {
        switch ($this->priority) {
            case 'urgent':
                return 'exclamation-triangle';
            case 'high':
                return 'exclamation-circle';
            case 'normal':
                return 'envelope';
            case 'low':
                return 'envelope-open';
            default:
                return 'envelope';
        }
    }

    /**
     * Obtener el color según la prioridad
     */
    public function getPriorityColorAttribute()
    {
        switch ($this->priority) {
            case 'urgent':
                return 'red';
            case 'high':
                return 'orange';
            case 'normal':
                return 'blue';
            case 'low':
                return 'gray';
            default:
                return 'blue';
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
     * Crear mensaje de cita
     */
    public static function createAppointmentMessage($senderId, $recipientId, $subject, $content, $appointmentId = null)
    {
        return self::create([
            'sender_id' => $senderId,
            'recipient_id' => $recipientId,
            'subject' => $subject,
            'content' => $content,
            'type' => 'appointment',
            'related_id' => $appointmentId,
            'related_type' => 'cita',
            'priority' => 'normal',
        ]);
    }

    /**
     * Crear mensaje de sesión
     */
    public static function createSessionMessage($senderId, $recipientId, $subject, $content, $sessionId = null)
    {
        return self::create([
            'sender_id' => $senderId,
            'recipient_id' => $recipientId,
            'subject' => $subject,
            'content' => $content,
            'type' => 'session',
            'related_id' => $sessionId,
            'related_type' => 'sesion',
            'priority' => 'normal',
        ]);
    }

    /**
     * Crear mensaje del sistema
     */
    public static function createSystemMessage($recipientId, $subject, $content, $data = [])
    {
        return self::create([
            'sender_id' => 1, // ID del usuario sistema
            'recipient_id' => $recipientId,
            'subject' => $subject,
            'content' => $content,
            'type' => 'system',
            'priority' => 'normal',
            'attachments' => $data,
        ]);
    }

    /**
     * Enviar mensaje a múltiples usuarios
     */
    public static function sendToMultipleUsers($senderId, $recipientIds, $subject, $content, $type = 'general', $priority = 'normal')
    {
        $messages = [];
        
        foreach ($recipientIds as $recipientId) {
            $messages[] = self::create([
                'sender_id' => $senderId,
                'recipient_id' => $recipientId,
                'subject' => $subject,
                'content' => $content,
                'type' => $type,
                'priority' => $priority,
            ]);
        }

        return $messages;
    }

    /**
     * Obtener estadísticas de mensajes
     */
    public static function getStats($userId = null)
    {
        $query = self::query();
        
        if ($userId) {
            $query->where('recipient_id', $userId);
        }

        return [
            'total' => $query->count(),
            'unread' => $query->where('read', false)->count(),
            'read' => $query->where('read', true)->count(),
            'urgent' => $query->where('priority', 'urgent')->count(),
            'high' => $query->where('priority', 'high')->count(),
            'normal' => $query->where('priority', 'normal')->count(),
            'low' => $query->where('priority', 'low')->count(),
        ];
    }

    /**
     * Limpiar mensajes antiguos
     */
    public static function cleanOldMessages($days = 90)
    {
        return self::where('created_at', '<', now()->subDays($days))->delete();
    }
} 