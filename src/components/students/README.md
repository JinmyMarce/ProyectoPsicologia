# 📅 Calendario del Estudiante - Rediseñado

## 🎯 Descripción

El **StudentCalendar** es un componente completamente rediseñado desde cero, creado específicamente para el sistema de agendamiento de citas psicológicas del Instituto Túpac Amaru. Ofrece una experiencia de usuario moderna, profesional y completamente funcional.

## ✨ Características Principales

### 🎨 **Diseño Moderno y Profesional**
- **Interfaz elegante** con gradientes y sombras sofisticadas
- **Colores institucionales** (#8e161a - Granate principal)
- **Tipografía profesional** con espaciado optimizado
- **Bordes redondeados** y efectos de profundidad

### 🚀 **Funcionalidades Avanzadas**
- **Navegación por meses** con botones intuitivos
- **Estados visuales claros** para cada tipo de día
- **Tooltips informativos** al hacer hover
- **Estadísticas del mes** en tiempo real
- **Leyenda visual completa** con iconos descriptivos

### 📱 **Responsive y Accesible**
- **Diseño adaptativo** para todos los dispositivos
- **Navegación por teclado** con estados de focus
- **Alto contraste** para mejor legibilidad
- **Animaciones suaves** y transiciones fluidas

## 🏗️ Estructura del Componente

### **Archivos Principales**
```
src/components/students/
├── StudentCalendar.tsx          # Componente principal del calendario
├── StudentCalendarDemo.tsx      # Demostración con datos de ejemplo
├── student-calendar.css         # Estilos personalizados
└── README.md                    # Este archivo
```

### **Dependencias Requeridas**
```json
{
  "react": "^18.0.0",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.263.0"
}
```

## 🎨 Sistema de Colores

### **Paleta Principal**
- **Granate Principal**: `#8e161a` - Color institucional
- **Granate Oscuro**: `#6b1013` - Variación oscura
- **Granate Claro**: `#b91c1c` - Variación clara

### **Estados del Calendario**
- **Disponible**: Verde (`#10b981`) - Puedes agendar cita
- **Cita Programada**: Azul (`#3b82f6`) - Ya tienes cita
- **Feriado**: Rojo (`#dc2626`) - No se atiende
- **Bloqueado**: Gris (`#6b7280`) - No disponible
- **Fin de Semana**: Gris azulado (`#64748b`) - No se atiende
- **Día Actual**: Granate (`#8e161a`) - Destacado especial

## 📋 Uso Básico

### **Importación**
```tsx
import { StudentCalendar } from './components/students/StudentCalendar';
import './components/students/student-calendar.css';
```

### **Implementación Mínima**
```tsx
<StudentCalendar
  onDateSelect={(date) => console.log('Fecha seleccionada:', date)}
/>
```

### **Implementación Completa**
```tsx
<StudentCalendar
  onDateSelect={handleDateSelect}
  selectedDate={selectedDate}
  availableDates={availableDates}
  blockedDates={blockedDates}
  holidays={holidays}
  appointments={appointments}
  className="custom-calendar"
/>
```

## 🔧 Props del Componente

### **StudentCalendarProps**
```tsx
interface StudentCalendarProps {
  className?: string;                    // Clases CSS adicionales
  onDateSelect?: (date: Date) => void;  // Callback al seleccionar fecha
  selectedDate?: Date | null;            // Fecha actualmente seleccionada
  availableDates?: Date[];               // Fechas disponibles para agendar
  blockedDates?: Date[];                 // Fechas bloqueadas
  holidays?: Holiday[];                  // Feriados
  appointments?: Appointment[];           // Citas existentes
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

### **Lógica de Estados**
1. **Día Actual**: Siempre destacado con borde granate
2. **Feriado**: Prioridad máxima, no se puede agendar
3. **Cita Existente**: Muestra información de la cita
4. **Disponible**: Permite agendar nueva cita
5. **Bloqueado**: No disponible por el psicólogo
6. **Fin de Semana**: No se atiende
7. **Día Pasado**: Ya no disponible

### **Orden de Prioridad**
```
Feriado > Cita Existente > Día Actual > Disponible > Bloqueado > Fin de Semana > Día Pasado
```

## 🎨 Personalización de Estilos

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

### **Clases CSS Personalizables**
- `.student-calendar` - Contenedor principal
- `.calendar-day` - Días individuales
- `.calendar-day.available` - Días disponibles
- `.calendar-day.appointment` - Días con cita
- `.calendar-day.holiday` - Días feriados
- `.calendar-day.today` - Día actual

## 📱 Responsive Design

### **Breakpoints**
- **Desktop**: `> 1024px` - Calendario completo con estadísticas
- **Tablet**: `768px - 1024px` - Calendario adaptado
- **Mobile**: `< 768px` - Vista compacta optimizada

### **Adaptaciones Móviles**
- **Altura reducida** de los días del calendario
- **Iconos más pequeños** para mejor ajuste
- **Texto adaptativo** según el espacio disponible
- **Grid responsivo** para la leyenda

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

## 🔍 Ejemplos de Uso

### **Calendario Simple**
```tsx
function SimpleCalendar() {
  return (
    <StudentCalendar
      onDateSelect={(date) => alert(`Fecha seleccionada: ${date}`)}
    />
  );
}
```

### **Calendario con Datos**
```tsx
function CalendarWithData() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const availableDates = [
    addDays(new Date(), 1),
    addDays(new Date(), 3),
    addDays(new Date(), 5)
  ];
  
  return (
    <StudentCalendar
      onDateSelect={setSelectedDate}
      selectedDate={selectedDate}
      availableDates={availableDates}
    />
  );
}
```

### **Calendario Completo**
```tsx
function CompleteCalendar() {
  // Estado y lógica del componente...
  
  return (
    <div className="student-calendar-container">
      <StudentCalendar
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        availableDates={availableDates}
        blockedDates={blockedDates}
        holidays={holidays}
        appointments={appointments}
        className="custom-styles"
      />
      
      {selectedDate && (
        <AppointmentForm 
          date={selectedDate}
          onSubmit={handleAppointmentSubmit}
        />
      )}
    </div>
  );
}
```

## 🎨 Personalización Avanzada

### **Temas Personalizados**
```css
/* Tema oscuro */
.student-calendar.dark-theme {
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
  --border-primary: #374151;
}

/* Tema institucional */
.student-calendar.institutional {
  --granate-principal: #8e161a;
  --beige-accent: #d3b7a0;
}
```

### **Animaciones Personalizadas**
```css
/* Animación de entrada personalizada */
.student-calendar .calendar-day {
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
El archivo `StudentCalendarDemo.tsx` incluye:
- **Datos de ejemplo** para todas las funcionalidades
- **Formulario de cita** funcional
- **Estados de ejemplo** para testing
- **Interfaz completa** del estudiante

### **Herramientas de Desarrollo**
- **React DevTools** para inspeccionar props
- **CSS DevTools** para personalizar estilos
- **Console logs** para debugging de fechas
- **Responsive testing** con DevTools

## 🚀 Próximos Pasos

### **Mejoras Planificadas**
1. **Integración con API** de citas
2. **Sistema de notificaciones** para recordatorios
3. **Calendario de múltiples psicólogos**
4. **Exportación de horarios** en PDF
5. **Sincronización con Google Calendar**

### **Optimizaciones Técnicas**
1. **Virtualización** para meses con muchos días
2. **Lazy loading** de datos históricos
3. **Caching** de feriados y citas
4. **Service Worker** para offline

## 📚 Recursos Adicionales

### **Documentación Relacionada**
- [Sistema de Colores Coherente](../SISTEMA_COLORES_COHERENTE.md)
- [Mejoras de Diseño Formal](../MEJORAS_DISENO_FORMAL.md)
- [Componentes UI](../ui/README.md)

### **Librerías Utilizadas**
- **date-fns**: Manipulación de fechas
- **lucide-react**: Iconos modernos
- **Tailwind CSS**: Sistema de utilidades

---

## 🎉 ¡Calendario Rediseñado Completamente!

El nuevo **StudentCalendar** representa un salto cualitativo en la experiencia del usuario, ofreciendo una interfaz moderna, profesional y completamente funcional para el agendamiento de citas psicológicas en el Instituto Túpac Amaru.

**Características destacadas:**
- ✨ Diseño completamente nuevo desde cero
- 🎨 Colores institucionales coherentes
- 📱 Responsive y accesible
- 🚀 Funcionalidades avanzadas
- 🎯 Experiencia de usuario optimizada

¡Disfruta del nuevo calendario! 🎊







