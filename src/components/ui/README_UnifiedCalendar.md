# 📅 Calendario Unificado - Sistema Centralizado

## 🎯 Descripción

El **UnifiedCalendar** es el calendario centralizado y unificado del Instituto Túpac Amaru, diseñado para servir a todos los tipos de usuarios con una interfaz consistente y funcionalidades adaptativas según el rol del usuario.

## ✨ Características Principales

### 🎨 **Diseño Unificado y Profesional**
- **Interfaz consistente** para todos los tipos de usuario
- **Colores institucionales** (#8e161a - Granate principal)
- **Temas adaptativos** según el tipo de usuario
- **Diseño responsive** y accesible

### 🚀 **Funcionalidades Multi-Usuario**
- **Estudiantes**: Agendar citas, ver horarios disponibles
- **Psicólogos**: Gestionar agenda, bloquear fechas
- **Tutores**: Supervisar actividades, coordinar citas
- **Administradores**: Control total del sistema

### 📱 **Características Técnicas**
- **Props configurables** para mostrar/ocultar elementos
- **Estados visuales claros** para cada tipo de día
- **Tooltips informativos** al hacer hover
- **Estadísticas en tiempo real** del mes actual
- **Leyenda visual completa** con iconos descriptivos

## 🏗️ Estructura del Componente

### **Archivos Principales**
```
src/components/ui/
├── UnifiedCalendar.tsx          # Componente principal del calendario
├── UnifiedCalendarDemo.tsx      # Demostración con selector de usuarios
├── unified-calendar.css         # Estilos personalizados
└── README_UnifiedCalendar.md    # Este archivo
```

### **Dependencias Requeridas**
```json
{
  "react": "^18.0.0",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.263.0"
}
```

## 🎨 Sistema de Colores y Temas

### **Paleta Principal (Institucional)**
- **Granate Principal**: `#8e161a` - Color base del instituto
- **Granate Oscuro**: `#6b1013` - Variación oscura
- **Granate Claro**: `#b91c1c` - Variación clara

### **Temas por Tipo de Usuario**
- **Estudiantes**: Verde (`#10b981`) - Días disponibles
- **Psicólogos**: Púrpura (`#8b5cf6`) - Días disponibles
- **Tutores**: Naranja (`#f59e0b`) - Días disponibles
- **Administradores**: Rosa (`#ec4899`) - Días disponibles

### **Estados del Calendario (Consistentes)**
- **Disponible**: Color según tema del usuario
- **Cita Programada**: Azul (`#3b82f6`) - Ya tienes cita
- **Feriado**: Rojo (`#dc2626`) - No se atiende
- **Bloqueado**: Gris (`#6b7280`) - No disponible
- **Fin de Semana**: Gris azulado (`#64748b`) - No se atiende
- **Día Actual**: Granate (`#8e161a`) - Destacado especial

## 📋 Uso Básico

### **Importación**
```tsx
import { UnifiedCalendar } from './components/ui/UnifiedCalendar';
import './components/ui/unified-calendar.css';
```

### **Implementación Mínima**
```tsx
<UnifiedCalendar
  userType="student"
  onDateSelect={(date) => console.log('Fecha seleccionada:', date)}
/>
```

### **Implementación Completa**
```tsx
<UnifiedCalendar
  userType="psychologist"
  onDateSelect={handleDateSelect}
  selectedDate={selectedDate}
  availableDates={availableDates}
  blockedDates={blockedDates}
  holidays={holidays}
  appointments={appointments}
  showStats={true}
  showLegend={true}
  showNavigation={true}
  className="psychologist-theme"
/>
```

## 🔧 Props del Componente

### **UnifiedCalendarProps**
```tsx
interface UnifiedCalendarProps {
  className?: string;                    // Clases CSS adicionales
  onDateSelect?: (date: Date) => void;  // Callback al seleccionar fecha
  selectedDate?: Date | null;            // Fecha actualmente seleccionada
  availableDates?: Date[];               // Fechas disponibles para agendar
  blockedDates?: Date[];                 // Fechas bloqueadas
  holidays?: Holiday[];                  // Feriados
  appointments?: Appointment[];           // Citas existentes
  userType?: 'student' | 'psychologist' | 'tutor' | 'admin';  // Tipo de usuario
  showStats?: boolean;                   // Mostrar estadísticas del mes
  showLegend?: boolean;                  // Mostrar leyenda del calendario
  showNavigation?: boolean;              // Mostrar navegación por meses
}
```

### **Tipos de Datos**
```tsx
interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  psychologist_name: string;
  status: string;
}
```

## 🎯 Estados del Calendario

### **Lógica de Estados (Consistente)**
1. **Día Actual**: Siempre destacado con borde granate
2. **Feriado**: Prioridad máxima, no se puede agendar
3. **Cita Existente**: Muestra información de la cita
4. **Disponible**: Permite agendar nueva cita (color según tema)
5. **Bloqueado**: No disponible por el psicólogo
6. **Fin de Semana**: No se atiende
7. **Día Pasado**: Ya no disponible

### **Orden de Prioridad**
```
Feriado > Cita Existente > Día Actual > Disponible > Bloqueado > Fin de Semana > Día Pasado
```

## 🎨 Personalización y Temas

### **Temas Automáticos por Tipo de Usuario**
```tsx
// El componente aplica automáticamente el tema según userType
<UnifiedCalendar userType="psychologist" className="psychologist-theme" />
<UnifiedCalendar userType="tutor" className="tutor-theme" />
<UnifiedCalendar userType="admin" className="admin-theme" />
```

### **Clases CSS Personalizables**
- `.unified-calendar` - Contenedor principal
- `.unified-calendar.psychologist-theme` - Tema para psicólogos
- `.unified-calendar.tutor-theme` - Tema para tutores
- `.unified-calendar.admin-theme` - Tema para administradores
- `.calendar-day` - Días individuales
- `.calendar-day.available` - Días disponibles

### **Variables CSS Disponibles**
```css
:root {
  --granate-principal: #8e161a;
  --granate-oscuro: #6b1013;
  --granate-claro: #b91c1c;
  --beige-accent: #d3b7a0;
  --azul-marino: #1f2937;
}
```

## 📱 Responsive Design

### **Breakpoints**
- **Desktop**: `> 1024px` - Calendario completo con estadísticas
- **Tablet**: `768px - 1024px` - Calendario adaptado
- **Mobile**: `< 768px` - Vista compacta optimizada

### **Adaptaciones Móviles**
- **Altura reducida** de los días del calendario
- **Iconos más pequeños** para mejor ajuste
- **Texto adaptativo** según el espacio disponible
- **Grid responsivo** para la leyenda y estadísticas

## 🚀 Funcionalidades Avanzadas

### **Navegación Inteligente**
- **Navegación por meses** con botones intuitivos
- **Cálculo automático** de días de la semana
- **Manejo de años bisiestos** automático
- **Localización en español** con date-fns

### **Interacciones del Usuario**
- **Hover effects** con información detallada
- **Click handlers** solo para días disponibles
- **Estados de focus** para navegación por teclado
- **Animaciones suaves** en todas las interacciones

### **Estadísticas en Tiempo Real**
- **Conteo automático** de días disponibles
- **Resumen de feriados** del mes actual
- **Total de citas** programadas
- **Actualización dinámica** al cambiar de mes

## 🔍 Ejemplos de Uso por Tipo de Usuario

### **Para Estudiantes**
```tsx
function StudentCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <UnifiedCalendar
      userType="student"
      onDateSelect={setSelectedDate}
      selectedDate={selectedDate}
      availableDates={availableDates}
      showStats={true}
      showLegend={true}
      showNavigation={true}
    />
  );
}
```

### **Para Psicólogos**
```tsx
function PsychologistCalendarView() {
  return (
    <UnifiedCalendar
      userType="psychologist"
      onDateSelect={handleDateSelect}
      availableDates={availableDates}
      blockedDates={blockedDates}
      appointments={appointments}
      showStats={true}
      showLegend={false}
      showNavigation={true}
      className="psychologist-theme"
    />
  );
}
```

### **Para Tutores**
```tsx
function TutorCalendarView() {
  return (
    <UnifiedCalendar
      userType="tutor"
      onDateSelect={handleDateSelect}
      availableDates={availableDates}
      appointments={appointments}
      showStats={true}
      showLegend={true}
      showNavigation={true}
      className="tutor-theme"
    />
  );
}
```

### **Para Administradores**
```tsx
function AdminCalendarView() {
  return (
    <UnifiedCalendar
      userType="admin"
      onDateSelect={handleDateSelect}
      availableDates={availableDates}
      blockedDates={blockedDates}
      holidays={holidays}
      appointments={appointments}
      showStats={true}
      showLegend={true}
      showNavigation={true}
      className="admin-theme"
    />
  );
}
```

## 🎨 Personalización Avanzada

### **Temas Personalizados**
```css
/* Tema personalizado para un departamento específico */
.unified-calendar.department-theme .calendar-day.available {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%);
  border-color: #22c55e;
}

/* Tema oscuro personalizado */
.unified-calendar.dark-theme {
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
  --border-primary: #374151;
}
```

### **Animaciones Personalizadas**
```css
/* Animación de entrada personalizada */
.unified-calendar .calendar-day {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🧪 Testing y Debugging

### **Componente de Demostración**
El archivo `UnifiedCalendarDemo.tsx` incluye:
- **Selector de tipo de usuario** para testing
- **Datos de ejemplo** para todas las funcionalidades
- **Formulario de cita** funcional
- **Interfaz completa** con todos los elementos

### **Herramientas de Desarrollo**
- **React DevTools** para inspeccionar props
- **CSS DevTools** para personalizar estilos
- **Console logs** para debugging de fechas
- **Responsive testing** con DevTools

## 🔄 Migración desde Calendarios Anteriores

### **Reemplazo Directo**
```tsx
// ANTES (StudentCalendar)
import { StudentCalendar } from './students/StudentCalendar';

// DESPUÉS (UnifiedCalendar)
import { UnifiedCalendar } from './ui/UnifiedCalendar';

// Cambiar el componente
<StudentCalendar {...props} />
// Por:
<UnifiedCalendar userType="student" {...props} />
```

### **Mantenimiento de Funcionalidades**
- **Todas las funcionalidades** del StudentCalendar están preservadas
- **Props compatibles** para migración fácil
- **Estilos consistentes** con el diseño anterior
- **Mejoras adicionales** en temas y personalización

## 🚀 Próximos Pasos

### **Mejoras Planificadas**
1. **Integración con API** de citas y usuarios
2. **Sistema de notificaciones** para recordatorios
3. **Calendario de múltiples psicólogos** en vista
4. **Exportación de horarios** en PDF/Excel
5. **Sincronización con Google Calendar**

### **Optimizaciones Técnicas**
1. **Virtualización** para meses con muchos días
2. **Lazy loading** de datos históricos
3. **Caching** de feriados y citas
4. **Service Worker** para funcionalidad offline
5. **PWA** para acceso móvil nativo

## 📚 Recursos Adicionales

### **Documentación Relacionada**
- [Sistema de Colores Coherente](../SISTEMA_COLORES_COHERENTE.md)
- [Mejoras de Diseño Formal](../MEJORAS_DISENO_FORMAL.md)
- [Componentes UI](../README.md)

### **Librerías Utilizadas**
- **date-fns**: Manipulación de fechas
- **lucide-react**: Iconos modernos
- **Tailwind CSS**: Sistema de utilidades

---

## 🎉 ¡Calendario Unificado Implementado!

El nuevo **UnifiedCalendar** representa la consolidación exitosa de todos los calendarios anteriores en un solo componente robusto, flexible y profesional.

**Beneficios principales:**
- ✨ **Un solo componente** para todos los usuarios
- 🎨 **Temas adaptativos** según el tipo de usuario
- 📱 **Diseño responsive** y accesible
- 🚀 **Funcionalidades avanzadas** mantenidas
- 🎯 **Experiencia de usuario** consistente
- 🔧 **Mantenimiento simplificado** del código

**Tipos de usuario soportados:**
- 🎓 **Estudiantes**: Agendar citas psicológicas
- 👨‍⚕️ **Psicólogos**: Gestionar agenda personal
- 👨‍🏫 **Tutores**: Supervisar actividades estudiantiles
- 🛡️ **Administradores**: Control total del sistema

¡El calendario unificado está listo para ser utilizado por todo el Instituto Túpac Amaru! 🎊







