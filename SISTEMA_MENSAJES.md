# Sistema de Mensajes - Psicología

## Descripción General

Se ha implementado un sistema completo de mensajería que permite a los psicólogos enviar mensajes a los estudiantes y viceversa. El sistema incluye funcionalidades de envío, recepción, gestión y notificaciones de mensajes.

## Funcionalidades Implementadas

### Backend

#### 1. Modelo Message
- **Ubicación**: `backend/app/Models/Message.php`
- **Campos principales**:
  - `sender_id`: ID del remitente
  - `recipient_id`: ID del destinatario
  - `subject`: Asunto del mensaje
  - `content`: Contenido del mensaje
  - `read`: Estado de lectura
  - `read_at`: Timestamp de lectura
  - `priority`: Prioridad (low, normal, high, urgent)
  - `type`: Tipo de mensaje (general, appointment, session, system)
  - `related_id`: ID de cita o sesión relacionada
  - `related_type`: Tipo de relación
  - `attachments`: Archivos adjuntos (JSON)

#### 2. Controlador MessageController
- **Ubicación**: `backend/app/Http/Controllers/Api/MessageController.php`
- **Endpoints implementados**:
  - `GET /api/messages` - Obtener mensajes recibidos
  - `GET /api/messages/sent` - Obtener mensajes enviados
  - `GET /api/messages/{id}` - Obtener mensaje específico
  - `POST /api/messages` - Enviar mensaje
  - `POST /api/messages/{id}/read` - Marcar como leído
  - `POST /api/messages/mark-all-read` - Marcar todos como leídos
  - `DELETE /api/messages/{id}` - Eliminar mensaje
  - `GET /api/messages/conversation/{userId}` - Obtener conversación
  - `GET /api/messages/stats` - Obtener estadísticas
  - `GET /api/messages/recipients` - Obtener destinatarios (solo psicólogos)

#### 3. Migración
- **Ubicación**: `backend/database/migrations/2025_01_15_000001_create_messages_table.php`
- **Características**:
  - Índices optimizados para rendimiento
  - Relaciones con usuarios
  - Campos para archivos adjuntos
  - Soporte para diferentes tipos y prioridades

#### 4. Seeder
- **Ubicación**: `backend/database/seeders/MessageSeeder.php`
- **Datos de prueba**: 10 mensajes entre psicólogos y estudiantes
- **Tipos**: Confirmaciones, cambios de horario, seguimientos, cancelaciones

### Frontend

#### 1. Servicio de Mensajes
- **Ubicación**: `src/services/messages.ts`
- **Funcionalidades**:
  - Interfaz TypeScript completa
  - Métodos para todas las operaciones CRUD
  - Métodos especializados para tipos de mensajes
  - Manejo de errores

#### 2. Componente MessagePanel
- **Ubicación**: `src/components/messages/MessagePanel.tsx`
- **Características**:
  - Panel modal completo
  - Vista de bandeja de entrada y enviados
  - Búsqueda y filtros
  - Marcado como leído/no leído
  - Eliminación de mensajes
  - Indicadores de prioridad
  - Formato de fechas inteligente

#### 3. Componente SendMessageModal
- **Ubicación**: `src/components/messages/SendMessageModal.tsx`
- **Funcionalidades**:
  - Búsqueda de destinatarios
  - Selección de prioridad y tipo
  - Validación de formularios
  - Indicadores visuales de prioridad
  - Integración con el servicio

#### 4. Integración en Header
- **Ubicación**: `src/components/layout/Header.tsx`
- **Características**:
  - Botón de mensajes solo para psicólogos
  - Contador de mensajes no leídos
  - Panel flotante integrado
  - Cierre automático al hacer clic fuera

## Características del Sistema

### 1. Prioridades de Mensajes
- **🔴 Urgente**: Para cancelaciones o cambios críticos
- **🟠 Alta**: Para cambios importantes de horarios
- **🔵 Normal**: Para confirmaciones y comunicaciones generales
- **⚪ Baja**: Para seguimientos y material de apoyo

### 2. Tipos de Mensajes
- **General**: Comunicaciones generales
- **Appointment**: Relacionados con citas
- **Session**: Relacionados con sesiones psicológicas
- **System**: Mensajes del sistema

### 3. Funcionalidades de Gestión
- **Búsqueda**: Por contenido, asunto o remitente
- **Filtros**: Por estado de lectura, tipo, prioridad
- **Marcado**: Individual y masivo como leído
- **Eliminación**: Mensajes individuales
- **Estadísticas**: Contadores de mensajes por tipo

### 4. Interfaz de Usuario
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Intuitiva**: Iconos y colores para prioridades
- **Accesible**: Navegación por teclado
- **Rápida**: Carga asíncrona de datos

## Uso del Sistema

### Para Psicólogos

1. **Acceso a Mensajes**:
   - Hacer clic en el icono de correo en el header
   - Ver contador de mensajes no leídos
   - Abrir panel completo de mensajes

2. **Enviar Mensaje**:
   - Buscar estudiante por nombre, email o DNI
   - Seleccionar prioridad y tipo
   - Escribir asunto y contenido
   - Enviar mensaje

3. **Gestionar Mensajes**:
   - Ver bandeja de entrada y enviados
   - Marcar como leído/no leído
   - Buscar y filtrar mensajes
   - Eliminar mensajes

### Para Estudiantes

1. **Recibir Mensajes**:
   - Los mensajes aparecen en el panel de mensajes
   - Notificaciones automáticas
   - Indicadores de prioridad

2. **Responder**:
   - Los estudiantes pueden enviar mensajes a psicólogos
   - Misma interfaz de envío

## Integración con Otros Módulos

### 1. Citas
- Mensajes automáticos de confirmación
- Notificaciones de cambios de horario
- Comunicaciones de cancelación

### 2. Sesiones Psicológicas
- Seguimientos post-sesión
- Material de apoyo
- Recordatorios de técnicas

### 3. Notificaciones
- Sistema integrado con notificaciones
- Contadores sincronizados
- Experiencia unificada

## Ventajas del Sistema

### 1. Comunicación Eficiente
- Mensajes directos entre psicólogos y estudiantes
- Prioridades claras para urgencias
- Historial completo de conversaciones

### 2. Gestión Organizada
- Filtros y búsquedas avanzadas
- Estados de lectura claros
- Estadísticas detalladas

### 3. Experiencia de Usuario
- Interfaz intuitiva y moderna
- Indicadores visuales de prioridad
- Navegación fluida

### 4. Escalabilidad
- Base de datos optimizada
- API RESTful completa
- Arquitectura modular

## Configuración y Mantenimiento

### 1. Base de Datos
```bash
# Ejecutar migración
php artisan migrate

# Crear datos de prueba
php artisan db:seed --class=MessageSeeder
```

### 2. Frontend
```bash
# Instalar dependencias
npm install

# Compilar
npm run build
```

### 3. Limpieza Automática
- Los mensajes antiguos se pueden limpiar automáticamente
- Configurable por días de retención
- Mantiene el rendimiento de la base de datos

## Seguridad y Privacidad

### 1. Autenticación
- Solo usuarios autenticados pueden enviar/recibir mensajes
- Verificación de roles para funcionalidades específicas

### 2. Privacidad
- Los mensajes son privados entre remitente y destinatario
- No hay acceso a mensajes de otros usuarios

### 3. Validación
- Validación de entrada en frontend y backend
- Sanitización de contenido
- Prevención de inyección de código

## Próximas Mejoras

### 1. Funcionalidades Adicionales
- Archivos adjuntos
- Mensajes grupales
- Plantillas de mensajes
- Programación de mensajes

### 2. Notificaciones Avanzadas
- Notificaciones push
- Notificaciones por email
- Recordatorios automáticos

### 3. Análisis y Reportes
- Estadísticas de comunicación
- Reportes de actividad
- Métricas de engagement

## Conclusión

El sistema de mensajes está completamente funcional y proporciona una comunicación eficiente entre psicólogos y estudiantes. La implementación incluye todas las funcionalidades básicas y avanzadas necesarias para un sistema de mensajería profesional, con una interfaz moderna y una arquitectura escalable. 