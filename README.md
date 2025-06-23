# Sistema de Gestión de Citas Psicológicas

## 🎨 **MEJORAS IMPLEMENTADAS**

### ✨ **Diseño Mejorado**
- **Iconos Enormes**: Todos los iconos institucionales ahora son mucho más grandes y visibles
- **Loading Profesional**: Pantalla de carga con icono de 64x64 y animaciones suaves
- **Header Rediseñado**: Icono de 24x24 con efectos de blur y animaciones
- **Sidebar Mejorado**: Icono de 28x28 con mejor espaciado y diseño
- **Interfaces Unificadas**: Todas las páginas mantienen el mismo diseño profesional

### 🔧 **Funcionalidad Arreglada**
- **Citas con Correos Institucionales**: Sistema completamente funcional para estudiantes
- **Botones Operativos**: Todos los botones funcionan correctamente
- **Navegación Mejorada**: Transiciones suaves entre páginas
- **Estados de Carga**: Indicadores visuales durante operaciones
- **Manejo de Errores**: Mensajes claros y útiles

## 🚀 **Características Principales**

### 👥 **Roles de Usuario**
- **Super Administrador**: Gestión completa del sistema
- **Administrador**: Gestión de usuarios y reportes
- **Psicólogo**: Gestión de pacientes, sesiones y citas
- **Estudiante**: Agendar citas y ver historial

### 📅 **Gestión de Citas**
- Agendar citas con psicólogos disponibles
- Ver horarios disponibles en tiempo real
- Confirmar, cancelar y completar citas
- Historial completo de citas

### 👨‍⚕️ **Gestión de Psicólogos**
- Registro y gestión de psicólogos
- Historial de psicólogos inactivos
- Reactivación de cuentas
- Estadísticas de rendimiento

### 📊 **Reportes y Análisis**
- Reportes de citas por período
- Estadísticas de psicólogos
- Análisis de estudiantes
- Generación de PDF y Excel

### 🔔 **Sistema de Notificaciones**
- Notificaciones en tiempo real
- Recordatorios de citas
- Cambios de estado
- Preferencias personalizadas

## 🛠️ **Instalación y Configuración**

### **Requisitos Previos**
- PHP 8.1 o superior
- Composer
- Node.js 16 o superior
- MySQL 8.0 o superior

### **Backend (Laravel)**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### **Frontend (React)**
```bash
npm install
npm run dev
```

## 🔑 **Credenciales de Prueba**

### **Super Administrador**
- **Email**: `superadmin@tupac-amaru.edu.pe`
- **Contraseña**: `superadmin123`

### **Psicólogos**
- **Email**: `maria.rodriguez@tupac-amaru.edu.pe`
- **Contraseña**: `password123`
- **Email**: `carlos.martinez@tupac-amaru.edu.pe`
- **Contraseña**: `password123`
- **Email**: `ana.lopez@tupac-amaru.edu.pe`
- **Contraseña**: `password123`

### **Estudiantes**
- **Email**: `maria.garcia@instituto.edu.pe`
- **Contraseña**: `password123`
- **Email**: `carlos.rodriguez@instituto.edu.pe`
- **Contraseña**: `password123`
- **Email**: `ana.fernandez@instituto.edu.pe`
- **Contraseña**: `password123`
- **Email**: `luis.perez@instituto.edu.pe`
- **Contraseña**: `password123`
- **Email**: `carmen.jimenez@instituto.edu.pe`
- **Contraseña**: `password123`

## 🎯 **Funcionalidades por Rol**

### **Estudiante**
- ✅ Agendar citas con psicólogos
- ✅ Ver historial de citas
- ✅ Recibir notificaciones
- ✅ Ver dashboard personalizado
- ✅ Cancelar citas pendientes

### **Psicólogo**
- ✅ Ver citas asignadas
- ✅ Gestionar pacientes
- ✅ Registrar sesiones psicológicas
- ✅ Ver horarios disponibles
- ✅ Recibir notificaciones

### **Super Administrador**
- ✅ Gestión completa de psicólogos
- ✅ Gestión de usuarios
- ✅ Ver todos los reportes
- ✅ Configurar horarios
- ✅ Gestión de notificaciones

## 🎨 **Diseño Visual**

### **Colores Institucionales**
- **Primario**: `#8e161a` (Rojo institucional)
- **Secundario**: `#a52a2a` (Rojo medio)
- **Acento**: `#d3b7a0` (Beige institucional)

### **Iconografía**
- **Logo Principal**: `psicologia.png` (64x64 en loading, 48x48 en headers)
- **Iconos**: Lucide React para consistencia
- **Animaciones**: Pulse y scale para interactividad

### **Tipografía**
- **Títulos**: Font-black para máxima legibilidad
- **Subtítulos**: Font-bold para jerarquía
- **Texto**: Font-semibold para claridad

## 🔧 **API Endpoints**

### **Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/profile` - Perfil del usuario

### **Citas**
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `GET /api/appointments/user/{email}` - Citas por usuario
- `PATCH /api/appointments/{id}/confirm` - Confirmar cita
- `PATCH /api/appointments/{id}/cancel` - Cancelar cita

### **Psicólogos**
- `GET /api/psychologists` - Listar psicólogos
- `POST /api/psychologists` - Crear psicólogo
- `PUT /api/psychologists/{id}` - Actualizar psicólogo
- `POST /api/psychologists/{id}/deactivate` - Desactivar psicólogo

### **Usuarios**
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

## 📱 **Responsive Design**

El sistema está completamente optimizado para:
- **Desktop**: 1920x1080 y superiores
- **Tablet**: 768px - 1024px
- **Mobile**: 320px - 767px

## 🚀 **Despliegue**

### **Producción**
```bash
# Backend
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
npm run build
```

### **Variables de Entorno**
```env
APP_NAME="Sistema de Gestión de Citas"
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_citas
DB_USERNAME=root
DB_PASSWORD=
```

## 📞 **Soporte**

Para soporte técnico o consultas:
- **Email**: soporte@tupac-amaru.edu.pe
- **Teléfono**: +51 1 123-4567
- **Horario**: Lunes a Viernes 8:00 AM - 6:00 PM

---

**© 2024 Instituto Túpac Amaru - Sistema de Gestión de Citas Psicológicas**