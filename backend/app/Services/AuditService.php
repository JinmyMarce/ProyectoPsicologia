<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Registrar una acción en el log de auditoría
     *
     * @param string $action Acción realizada (create, update, delete, login, etc.)
     * @param string $resourceType Tipo de recurso (User, Cita, Appointment, etc.)
     * @param int|null $resourceId ID del recurso afectado
     * @param array|null $oldValues Valores anteriores (para updates)
     * @param array|null $newValues Valores nuevos (para updates)
     * @param string|null $details Detalles adicionales
     * @param string $status Estado de la acción (success, failed, warning)
     * @return AuditLog
     */
    public static function log(
        string $action,
        string $resourceType,
        ?int $resourceId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $details = null,
        string $status = 'success'
    ): AuditLog {
        $user = Auth::user();
        
        return AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_email' => $user?->email,
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'details' => $details,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'status' => $status,
        ]);
    }

    /**
     * Registrar creación de un recurso
     */
    public static function logCreate(string $resourceType, int $resourceId, ?array $data = null, ?string $details = null): AuditLog
    {
        return self::log(
            'create',
            $resourceType,
            $resourceId,
            null,
            $data,
            $details
        );
    }

    /**
     * Registrar actualización de un recurso
     */
    public static function logUpdate(string $resourceType, int $resourceId, array $oldValues, array $newValues, ?string $details = null): AuditLog
    {
        return self::log(
            'update',
            $resourceType,
            $resourceId,
            $oldValues,
            $newValues,
            $details
        );
    }

    /**
     * Registrar eliminación de un recurso
     */
    public static function logDelete(string $resourceType, int $resourceId, ?array $deletedData = null, ?string $details = null): AuditLog
    {
        return self::log(
            'delete',
            $resourceType,
            $resourceId,
            $deletedData,
            null,
            $details
        );
    }

    /**
     * Registrar inicio de sesión
     */
    public static function logLogin(?int $userId = null, ?string $userEmail = null, ?string $userName = null, string $status = 'success'): AuditLog
    {
        $user = Auth::user();
        
        return AuditLog::create([
            'user_id' => $userId ?? $user?->id,
            'user_name' => $userName ?? $user?->name,
            'user_email' => $userEmail ?? $user?->email,
            'action' => 'login',
            'resource_type' => 'User',
            'resource_id' => $userId ?? $user?->id,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'details' => $status === 'success' ? 'Inicio de sesión exitoso' : 'Intento de inicio de sesión fallido',
            'status' => $status,
        ]);
    }

    /**
     * Registrar cierre de sesión
     */
    public static function logLogout(): AuditLog
    {
        return self::log(
            'logout',
            'User',
            Auth::id(),
            null,
            null,
            'Cierre de sesión'
        );
    }

    /**
     * Registrar visualización de un recurso
     */
    public static function logView(string $resourceType, int $resourceId, ?string $details = null): AuditLog
    {
        return self::log(
            'view',
            $resourceType,
            $resourceId,
            null,
            null,
            $details
        );
    }

    /**
     * Registrar acción personalizada
     */
    public static function logCustom(string $action, string $resourceType, ?int $resourceId = null, ?string $details = null, string $status = 'success'): AuditLog
    {
        return self::log(
            $action,
            $resourceType,
            $resourceId,
            null,
            null,
            $details,
            $status
        );
    }
}

