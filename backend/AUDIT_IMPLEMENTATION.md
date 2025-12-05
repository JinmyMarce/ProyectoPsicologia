# Guía de Implementación del Sistema de Auditoría

## Descripción

El sistema de auditoría permite registrar todas las acciones importantes realizadas en el sistema, incluyendo:
- Inicios y cierres de sesión
- Creación, actualización y eliminación de recursos
- Visualizaciones importantes
- Acciones personalizadas

## Componentes Implementados

### 1. Base de Datos
- **Tabla**: `audit_logs`
- **Migración**: `2025_12_05_160305_create_audit_logs_table.php`
- **Campos principales**:
  - `user_id`, `user_name`, `user_email`: Información del usuario
  - `action`: Tipo de acción (create, update, delete, login, logout, view, etc.)
  - `resource_type`: Tipo de recurso (User, Cita, Appointment, etc.)
  - `resource_id`: ID del recurso afectado
  - `ip_address`, `user_agent`: Información de la solicitud
  - `old_values`, `new_values`: Valores anteriores y nuevos (para updates)
  - `details`: Detalles adicionales
  - `status`: Estado de la acción (success, failed, warning)

### 2. Modelo
- **Archivo**: `app/Models/AuditLog.php`
- **Relaciones**: `belongsTo(User::class)`
- **Scopes**: `byAction()`, `byResourceType()`, `byUser()`, `byDate()`, `recent()`

### 3. Servicio
- **Archivo**: `app/Services/AuditService.php`
- **Métodos principales**:
  - `log()`: Método genérico para registrar cualquier acción
  - `logCreate()`: Registrar creación de recursos
  - `logUpdate()`: Registrar actualización de recursos
  - `logDelete()`: Registrar eliminación de recursos
  - `logLogin()`: Registrar inicio de sesión
  - `logLogout()`: Registrar cierre de sesión
  - `logView()`: Registrar visualización de recursos
  - `logCustom()`: Registrar acciones personalizadas

### 4. Controlador
- **Archivo**: `app/Http/Controllers/Api/AuditLogController.php`
- **Endpoints**:
  - `GET /api/audit-logs`: Listar logs con filtros
  - `GET /api/audit-logs/{id}`: Obtener un log específico
  - `GET /api/audit-logs/stats`: Obtener estadísticas
  - `GET /api/audit-logs/export/pdf`: Exportar a PDF
  - `GET /api/audit-logs/export/excel`: Exportar a Excel

## Uso del Servicio de Auditoría

### Ejemplo 1: Registrar creación de usuario

```php
use App\Services\AuditService;

public function store(Request $request)
{
    $user = User::create($request->validated());
    
    // Registrar en auditoría
    AuditService::logCreate(
        'User',
        $user->id,
        $user->toArray(),
        "Usuario creado: {$user->name} ({$user->email})"
    );
    
    return response()->json(['success' => true, 'data' => $user]);
}
```

### Ejemplo 2: Registrar actualización de usuario

```php
public function update(Request $request, $id)
{
    $user = User::findOrFail($id);
    $oldValues = $user->toArray();
    
    $user->update($request->validated());
    $newValues = $user->toArray();
    
    // Registrar en auditoría
    AuditService::logUpdate(
        'User',
        $user->id,
        $oldValues,
        $newValues,
        "Usuario actualizado: {$user->name}"
    );
    
    return response()->json(['success' => true, 'data' => $user]);
}
```

### Ejemplo 3: Registrar eliminación de usuario

```php
public function destroy($id)
{
    $user = User::findOrFail($id);
    $deletedData = $user->toArray();
    
    $user->delete();
    
    // Registrar en auditoría
    AuditService::logDelete(
        'User',
        $user->id,
        $deletedData,
        "Usuario eliminado: {$user->name} ({$user->email})"
    );
    
    return response()->json(['success' => true]);
}
```

### Ejemplo 4: Registrar acción personalizada

```php
public function activate($id)
{
    $user = User::findOrFail($id);
    $user->update(['active' => true]);
    
    // Registrar en auditoría
    AuditService::logCustom(
        'activate',
        'User',
        $user->id,
        "Usuario activado: {$user->name}",
        'success'
    );
    
    return response()->json(['success' => true]);
}
```

### Ejemplo 5: Registrar visualización de recurso sensible

```php
public function show($id)
{
    $user = User::findOrFail($id);
    
    // Registrar visualización de datos sensibles
    AuditService::logView(
        'User',
        $user->id,
        "Visualización de perfil de usuario: {$user->name}"
    );
    
    return response()->json(['success' => true, 'data' => $user]);
}
```

## Implementación Automática

### Login/Logout
Ya está implementado en `AuthController`:
- `login()`: Registra inicio de sesión exitoso o fallido
- `loginWithGoogle()`: Registra inicio de sesión con Google
- `logout()`: Registra cierre de sesión

### Próximos Pasos Recomendados

1. **Agregar auditoría en UserController**:
   - `store()`: Creación de usuarios
   - `update()`: Actualización de usuarios
   - `destroy()`: Eliminación de usuarios
   - `deactivate()`: Desactivación de usuarios
   - `reactivate()`: Reactivación de usuarios

2. **Agregar auditoría en otros controladores**:
   - `CitaController`: Creación, actualización, cancelación de citas
   - `AppointmentController`: Gestión de citas
   - `PsychologistController`: Gestión de psicólogos
   - `MessageController`: Envío y eliminación de mensajes

3. **Middleware de Auditoría** (Opcional):
   Crear un middleware que registre automáticamente todas las acciones en rutas específicas.

## Consultas y Filtros

### Filtros disponibles en el endpoint `/api/audit-logs`:
- `type`: Tipo de acción (create, update, delete, login, etc.)
- `date`: Fecha específica (formato: YYYY-MM-DD)
- `date_from`: Fecha desde (formato: YYYY-MM-DD)
- `date_to`: Fecha hasta (formato: YYYY-MM-DD)
- `user_id`: ID del usuario
- `resource_type`: Tipo de recurso
- `per_page`: Registros por página (default: 50)

### Ejemplo de consulta:
```
GET /api/audit-logs?type=create&date_from=2025-12-01&date_to=2025-12-31&per_page=100
```

## Exportación

### PDF
```
GET /api/audit-logs/export/pdf?type=create&date=2025-12-05
```

### Excel
```
GET /api/audit-logs/export/excel?date_from=2025-12-01&date_to=2025-12-31
```

## Estadísticas

```
GET /api/audit-logs/stats?date_from=2025-12-01&date_to=2025-12-31
```

Retorna:
- Total de logs
- Conteo por acción
- Conteo por tipo de recurso
- Conteo por estado
- Top 10 usuarios con más acciones

## Notas Importantes

1. **Rendimiento**: Los logs se almacenan en la base de datos. Para sistemas con mucho tráfico, considera:
   - Implementar un sistema de limpieza automática de logs antiguos
   - Usar índices en las columnas más consultadas
   - Considerar almacenamiento en archivos o servicios externos para logs muy antiguos

2. **Privacidad**: Los logs pueden contener información sensible. Asegúrate de:
   - Limitar el acceso a los logs solo a administradores
   - No registrar contraseñas ni datos sensibles en `old_values` o `new_values`
   - Implementar políticas de retención de datos

3. **Seguridad**: 
   - Los logs son inmutables (no se pueden editar después de crearse)
   - Solo usuarios con rol `admin` o `super_admin` pueden acceder a los logs
   - Las exportaciones también requieren autenticación

