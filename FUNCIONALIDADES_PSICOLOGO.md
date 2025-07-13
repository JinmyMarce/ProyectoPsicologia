# Funcionalidades del Psicólogo - Sistema de Psicología

## Descripción General

El sistema permite que los psicólogos accedan con sus credenciales (correo y contraseña) creadas por el superadministrador. No utilizan el inicio de sesión con Google.

## Funcionalidades Implementadas

### 1. Panel General (Dashboard)

**Endpoint:** `GET /api/psychologist-dashboard/dashboard`

**Descripción:** Vista consolidada de las actividades del psicólogo que incluye:
- Estadísticas del día (citas y sesiones)
- Citas pendientes de aprobación
- Próximas citas confirmadas
- Sesiones del día
- Notificaciones no leídas
- Estadísticas mensuales

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "today_stats": {
      "appointments": 2,
      "sessions": 1
    },
    "pending_appointments": [...],
    "upcoming_appointments": [...],
    "today_sessions": [...],
    "unread_notifications": [...],
    "monthly_stats": {
      "total_appointments": 15,
      "completed_sessions": 8,
      "total_patients": 12
    }
  }
}
```

### 2. Gestión de Citas

#### Aprobar Cita
**Endpoint:** `POST /api/psychologist-dashboard/appointments/{id}/approve`

**Descripción:** Aprueba una cita pendiente y notifica al estudiante.

#### Rechazar Cita con Motivo
**Endpoint:** `POST /api/psychologist-dashboard/appointments/{id}/reject`

**Parámetros:**
- `rejection_reason` (string, requerido): Motivo del rechazo

**Descripción:** Rechaza una cita pendiente con motivo y notifica al estudiante.

#### Agendar Cita para Estudiante
**Endpoint:** `POST /api/psychologist-dashboard/appointments/schedule-for-student`

**Parámetros:**
- `student_identifier` (string, requerido): DNI o email del estudiante
- `fecha` (date, requerido): Fecha de la cita
- `hora` (time, requerido): Hora de la cita
- `duracion` (integer, requerido): Duración en minutos
- `motivo_consulta` (string, requerido): Motivo de la consulta

**Descripción:** Permite al psicólogo agendar citas directamente para estudiantes buscándolos por DNI o email.

### 3. Gestión de Horarios

#### Ver Mis Horarios
**Endpoint:** `GET /api/schedule/my-schedule`

**Parámetros opcionales:**
- `date_from`: Fecha desde
- `date_to`: Fecha hasta
- `is_available`: Filtrar por disponibilidad
- `is_blocked`: Filtrar por bloqueos

#### Crear Horario
**Endpoint:** `POST /api/schedule/my-schedule`

**Parámetros:**
- `date` (date, requerido): Fecha del horario
- `start_time` (time, requerido): Hora de inicio
- `end_time` (time, requerido): Hora de fin
- `is_available` (boolean, opcional): Si está disponible
- `block_reason` (string, opcional): Motivo del bloqueo

#### Bloquear Horario
**Endpoint:** `POST /api/schedule/my-schedule/{id}/block`

**Parámetros:**
- `reason` (string, requerido): Motivo del bloqueo

#### Desbloquear Horario
**Endpoint:** `POST /api/schedule/my-schedule/{id}/unblock`

#### Eliminar Horario
**Endpoint:** `DELETE /api/schedule/my-schedule/{id}`

#### Estadísticas de Horarios
**Endpoint:** `GET /api/schedule/my-schedule/stats`

### 4. Registro de Pacientes

#### Lista Completa de Pacientes
**Endpoint:** `GET /api/psychologist-dashboard/patients`

**Parámetros opcionales:**
- `search`: Búsqueda general
- `dni`: Filtrar por DNI
- `email`: Filtrar por email
- `career`: Filtrar por carrera
- `semester`: Filtrar por semestre
- `per_page`: Elementos por página

**Respuesta incluye:**
- Datos del paciente
- Total de citas
- Total de sesiones

#### Buscar Estudiante
**Endpoint:** `GET /api/psychologist-dashboard/students/search`

**Parámetros:**
- `identifier` (string, requerido): DNI, email o nombre

### 5. Registro de Sesión

#### Registrar Nueva Sesión
**Endpoint:** `POST /api/psychologist-dashboard/sessions/register`

**Parámetros:**
- `patient_dni` (string, requerido): DNI del paciente
- `fecha_sesion` (date, requerido): Fecha de la sesión
- `hora_sesion` (time, requerido): Hora de la sesión
- `duracion_minutos` (integer, requerido): Duración en minutos
- `estado` (string, requerido): Programada, Realizada, Cancelada
- `tipo_sesion` (string, opcional): Tipo de terapia
- `temas_tratados` (string, opcional): Temas tratados
- `notas` (string, opcional): Notas de la sesión
- `objetivos` (string, opcional): Objetivos de la sesión
- `conclusiones` (string, opcional): Conclusiones

**Características:**
- Los campos fecha, hora, duración y estado se precargan
- Al ingresar el DNI del paciente, sus datos se vinculan automáticamente
- Se registran temas tratados, notas y objetivos

### 6. Historial de Sesiones

#### Ver Historial con Filtros
**Endpoint:** `GET /api/psychologist-dashboard/sessions/history`

**Parámetros opcionales:**
- `patient_search`: Buscar por estudiante (correo, DNI, programa)
- `estado`: Filtrar por estado
- `date_from`: Fecha desde
- `date_to`: Fecha hasta
- `tipo_sesion`: Filtrar por tipo de sesión
- `per_page`: Elementos por página

#### Estadísticas por Estudiante
**Endpoint:** `GET /api/psychologist-dashboard/sessions/student-stats`

**Parámetros:**
- `student_identifier` (string, requerido): DNI, email o programa

**Respuesta incluye:**
- Datos del estudiante
- Total de sesiones
- Lista de sesiones con detalles

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer. El usuario debe tener rol `psychologist`.

## Ejemplo de Uso

### 1. Login del Psicólogo
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.rodriguez@gmail.com",
    "password": "password123"
  }'
```

### 2. Obtener Dashboard
```bash
curl -X GET http://localhost:8000/api/psychologist-dashboard/dashboard \
  -H "Authorization: Bearer {token}"
```

### 3. Aprobar Cita
```bash
curl -X POST http://localhost:8000/api/psychologist-dashboard/appointments/1/approve \
  -H "Authorization: Bearer {token}"
```

### 4. Rechazar Cita con Motivo
```bash
curl -X POST http://localhost:8000/api/psychologist-dashboard/appointments/1/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "rejection_reason": "Horario no disponible"
  }'
```

### 5. Registrar Sesión
```bash
curl -X POST http://localhost:8000/api/psychologist-dashboard/sessions/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "patient_dni": "87654321",
    "fecha_sesion": "2024-01-15",
    "hora_sesion": "14:00",
    "duracion_minutos": 60,
    "estado": "Realizada",
    "tipo_sesion": "Terapia Cognitivo-Conductual",
    "temas_tratados": "Manejo de ansiedad",
    "notas": "Paciente muestra mejoría",
    "objetivos": "Reducir niveles de ansiedad",
    "conclusiones": "Sesión productiva"
  }'
```

## Datos de Prueba

Para probar las funcionalidades, ejecutar:

```bash
php artisan db:seed --class=PsychologistTestDataSeeder
```

**Credenciales de prueba:**
- Psicólogo: `maria.rodriguez@gmail.com` / `password123`
- Estudiantes: 
  - `carlos.rodriguez@istta.edu.pe` / `password123`
  - `ana.lopez@istta.edu.pe` / `password123`
  - `juan.perez@istta.edu.pe` / `password123`

## Notas Técnicas

- Todos los endpoints validan que el usuario autenticado sea psicólogo
- Las notificaciones se crean automáticamente para citas aprobadas/rechazadas
- Los horarios se validan para evitar conflictos
- Las sesiones se pueden filtrar por múltiples criterios
- El sistema mantiene historial completo de todas las actividades 