# Reglas de Agendamiento Implementadas

## 🎯 **Reglas Principales**

### **1. Solo Días Laborables (Lunes a Viernes)**
- **✅ Lunes (día 1)**: Disponible para agendar
- **✅ Martes (día 2)**: Disponible para agendar
- **✅ Miércoles (día 3)**: Disponible para agendar
- **✅ Jueves (día 4)**: Disponible para agendar
- **✅ Viernes (día 5)**: Disponible para agendar
- **❌ Sábado (día 6)**: BLOQUEADO PERMANENTEMENTE
- **❌ Domingo (día 0)**: BLOQUEADO PERMANENTEMENTE

### **2. Límite de 2 Semanas**
- **✅ Solo se pueden agendar citas hasta 2 semanas (14 días) después de hoy**
- **❌ No se pueden agendar citas más allá de 2 semanas**

## 🔧 **Implementación Técnica**

### **1. Verificación en Inicialización de Estado**
```typescript
// Verificar si es fin de semana (sábado = 6, domingo = 0) - BLOQUEADO PERMANENTEMENTE
const dayOfWeek = date.getDay();
const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

// Calcular límite de 2 semanas (14 días) desde hoy
const futureLimit = addDays(todayStart, 14);

// Solo los días laborables (lunes a viernes), futuros y dentro del límite están disponibles
let isAvailable = !isPast && !isWeekend && !isHoliday && !isFutureLimit && !isTodayBlocked;
```

### **2. Verificación en Precarga de Disponibilidad**
```typescript
// Precargar disponibilidad para los próximos 14 días (límite de 2 semanas)
for (let i = 0; i < 14; i++) {
  const date = addDays(todayStart, i);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isWorkday = dayOfWeek >= 1 && dayOfWeek <= 5; // Lunes a viernes
  
  // Solo verificar si el día está en el mes actual, es laborable y dentro del límite
  if (date.getMonth() === currentMonth.getMonth() && 
      date.getFullYear() === currentMonth.getFullYear() && 
      isWorkday && 
      !isWeekend) {
    await checkDateAvailability(dateStr);
  }
}
```

### **3. Verificación en Generación de Eventos**
```typescript
// PRIMERA VERIFICACIÓN: Disponibilidad y slots
if (!day.isAvailable || day.availableSlots <= 0) return false;

// SEGUNDA VERIFICACIÓN: Fines de semana
if (isWeekend) return false;

// TERCERA VERIFICACIÓN: Solo días laborables (lunes a viernes = 1-5)
if (dayOfWeek < 1 || dayOfWeek > 5) return false;

// CUARTA VERIFICACIÓN: Dentro del límite de 2 semanas
if (isAfter(dateObj, futureLimit)) return false;
```

### **4. Verificación en Click de Día**
```typescript
// Verificar si es fin de semana - BLOQUEADO PERMANENTEMENTE
if (isWeekend) {
  setError('❌ FECHA NO VÁLIDA: No se pueden agendar citas en fines de semana. Solo se atiende de lunes a viernes.');
  return;
}

// Verificar límite de 2 semanas
if (isAfter(dateObj, futureLimit)) {
  setError('❌ FECHA NO VÁLIDA: Solo se pueden agendar citas hasta 2 semanas en adelante. Esta fecha está fuera del límite permitido.');
  return;
}
```

## 📊 **Capas de Protección**

### **Capa 1: Inicialización de Estado**
- Los fines de semana se marcan como no disponibles desde el inicio
- Los días fuera del límite de 2 semanas se marcan como no disponibles

### **Capa 2: Precarga de Disponibilidad**
- Solo se verifica disponibilidad para días laborables dentro del límite

### **Capa 3: Generación de Eventos**
- Múltiples verificaciones antes de generar eventos de disponibilidad

### **Capa 4: Filtrado Agresivo**
- Eliminación de eventos de fines de semana después de generarlos

### **Capa 5: Validación en Click**
- Verificaciones adicionales cuando el usuario intenta agendar

## 🔍 **Logs de Debugging**

### **Para Días Laborables Dentro del Límite:**
```
📅 Día 1: 2025-08-25 - día de semana: 1, es fin de semana: false, es laborable: true
✅ Verificando disponibilidad para: 2025-08-25 (día laborable)
✅ DÍA LABORABLE DENTRO DEL LÍMITE ACEPTADO: 2025-08-25 (día 1)
```

### **Para Fines de Semana:**
```
📅 Día 2: 2025-08-24 - día de semana: 0, es fin de semana: true, es laborable: false
❌ Saltando día: 2025-08-24 (no es laborable o no está en el mes actual)
❌ BLOQUEANDO FIN DE SEMANA: 2025-08-24 (día 0)
```

### **Para Días Fuera del Límite:**
```
❌ BLOQUEANDO DÍA FUERA DEL LÍMITE: 2025-09-15 (más de 2 semanas)
```

## 🎯 **Resultados Esperados**

### **Días que DEBEN Mostrar Disponibilidad:**
- ✅ Lunes a viernes dentro de las próximas 2 semanas
- ✅ Días laborables con slots disponibles
- ✅ Días que no son feriados

### **Días que NO DEBEN Mostrar Disponibilidad:**
- ❌ Sábados y domingos
- ❌ Días fuera del límite de 2 semanas
- ❌ Días pasados
- ❌ Feriados
- ❌ Día actual después de las 13:10

## 🚀 **Beneficios de la Implementación**

1. **Cumplimiento de Reglas**: Solo días laborables y dentro del límite
2. **Protección Múltiple**: 5 capas de verificación
3. **Experiencia de Usuario**: Mensajes de error claros
4. **Consistencia**: Estado y eventos siempre coinciden
5. **Debugging**: Logs detallados para identificar problemas

---

**Las reglas de agendamiento están completamente implementadas: solo lunes a viernes, máximo 2 semanas en adelante.**

























