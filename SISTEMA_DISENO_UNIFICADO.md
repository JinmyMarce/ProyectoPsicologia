# Sistema de Diseño Unificado - Sistema de Psicología ISTTA

## Descripción

Este documento describe el sistema de diseño unificado implementado para todas las interfaces del Sistema de Psicología del Instituto Túpac Amaru, Cusco, Perú. El sistema está basado en los colores y estilos del login para mantener coherencia visual en toda la aplicación.

## Colores del Sistema

### Colores Principales
- **Primary (Granate)**: `#8e161a` - Color principal del sistema
- **Primary Light**: `#b91c1c` - Variante más clara del granate
- **Primary Dark**: `#6d1115` - Variante más oscura del granate

### Colores Secundarios
- **Secondary (Beige/Camel)**: `#d3b7a0` - Color secundario del sistema
- **Secondary Light**: `#e2c7b0` - Variante más clara del beige
- **Secondary Dark**: `#c2b280` - Variante más oscura del beige

### Colores de Acento
- **Accent (Azul Marino)**: `#1e2a37` - Color de acento oscuro
- **Accent Light**: `#334155` - Variante más clara del azul marino
- **Accent Dark**: `#0f172a` - Variante más oscura del azul marino

### Colores Neutrales
- **Neutral**: `#f8fafc` - Fondo principal
- **Neutral Light**: `#ffffff` - Blanco puro
- **Neutral Dark**: `#e2e8f0` - Gris muy claro

### Colores de Texto
- **Text Primary**: `#1e293b` - Texto principal oscuro
- **Text Secondary**: `#64748b` - Texto secundario
- **Text Light**: `#94a3b8` - Texto claro

### Colores de Estado
- **Success**: `#10b981` - Verde para éxito
- **Warning**: `#f59e0b` - Amarillo para advertencias
- **Error**: `#ef4444` - Rojo para errores
- **Info**: `#3b82f6` - Azul para información

## Componentes del Sistema

### Botones

#### Clases Base
- `.btn` - Estilo base para todos los botones
- `.btn-primary` - Botón principal (granate)
- `.btn-secondary` - Botón secundario (beige)
- `.btn-outline` - Botón con borde
- `.btn-ghost` - Botón transparente
- `.btn-error` - Botón de error

#### Tamaños
- `.btn-sm` - Botón pequeño
- `.btn-lg` - Botón grande

#### Ejemplo de Uso
```tsx
<button className="btn btn-primary btn-lg">
  Botón Principal Grande
</button>
```

### Tarjetas

#### Clases Base
- `.card` - Estilo base para tarjetas
- `.card-header` - Encabezado de tarjeta
- `.card-body` - Cuerpo de tarjeta
- `.card-footer` - Pie de tarjeta

#### Efectos
- `.hover-lift` - Efecto de elevación al hacer hover

#### Ejemplo de Uso
```tsx
<div className="card hover-lift">
  <div className="card-header">
    <h3>Título de la Tarjeta</h3>
  </div>
  <div className="card-body">
    Contenido de la tarjeta
  </div>
</div>
```

### Formularios

#### Clases Base
- `.form-group` - Grupo de formulario
- `.form-label` - Etiqueta de campo
- `.form-input` - Campo de entrada
- `.form-error` - Mensaje de error

#### Ejemplo de Uso
```tsx
<div className="form-group">
  <label className="form-label">Correo Electrónico</label>
  <input className="form-input" type="email" />
  <p className="form-error">Error de validación</p>
</div>
```

### Badges

#### Clases Base
- `.badge` - Estilo base para badges
- `.badge-primary` - Badge principal
- `.badge-secondary` - Badge secundario
- `.badge-success` - Badge de éxito
- `.badge-warning` - Badge de advertencia
- `.badge-error` - Badge de error
- `.badge-info` - Badge de información

#### Ejemplo de Uso
```tsx
<span className="badge badge-success">
  Completado
</span>
```

### Alertas

#### Clases Base
- `.alert` - Estilo base para alertas
- `.alert-success` - Alerta de éxito
- `.alert-warning` - Alerta de advertencia
- `.alert-error` - Alerta de error
- `.alert-info` - Alerta de información

#### Ejemplo de Uso
```tsx
<div className="alert alert-success">
  Operación completada exitosamente
</div>
```

### Tablas

#### Clases Base
- `.table` - Estilo base para tablas
- `.table th` - Encabezados de tabla
- `.table td` - Celdas de tabla

#### Ejemplo de Uso
```tsx
<table className="table">
  <thead>
    <tr>
      <th>Nombre</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Juan Pérez</td>
      <td>juan@ejemplo.com</td>
    </tr>
  </tbody>
</table>
```

### Navegación

#### Clases Base
- `.nav-item` - Elemento de navegación
- `.nav-item.active` - Elemento activo
- `.nav-item:hover` - Estado hover

#### Ejemplo de Uso
```tsx
<a href="/dashboard" className="nav-item active">
  Dashboard
</a>
```

### Modales

#### Clases Base
- `.modal-overlay` - Fondo del modal
- `.modal` - Contenedor del modal
- `.modal-header` - Encabezado del modal
- `.modal-body` - Cuerpo del modal
- `.modal-footer` - Pie del modal
- `.modal-title` - Título del modal
- `.modal-close` - Botón de cerrar

#### Ejemplo de Uso
```tsx
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h2 className="modal-title">Título del Modal</h2>
      <button className="modal-close">×</button>
    </div>
    <div className="modal-body">
      Contenido del modal
    </div>
    <div className="modal-footer">
      <button className="btn btn-primary">Aceptar</button>
    </div>
  </div>
</div>
```

## Utilidades

### Colores de Texto
- `.text-primary` - Color de texto primario
- `.text-secondary` - Color de texto secundario
- `.text-accent` - Color de texto de acento
- `.text-success` - Color de texto de éxito
- `.text-warning` - Color de texto de advertencia
- `.text-error` - Color de texto de error
- `.text-info` - Color de texto de información

### Colores de Fondo
- `.bg-primary` - Fondo primario
- `.bg-secondary` - Fondo secundario
- `.bg-accent` - Fondo de acento
- `.bg-success` - Fondo de éxito
- `.bg-warning` - Fondo de advertencia
- `.bg-error` - Fondo de error
- `.bg-info` - Fondo de información

### Bordes
- `.border-primary` - Borde primario
- `.border-secondary` - Borde secundario
- `.border-accent` - Borde de acento

### Gradientes
- `.gradient-primary` - Gradiente primario
- `.gradient-secondary` - Gradiente secundario
- `.gradient-accent` - Gradiente de acento

### Efectos de Hover
- `.hover-lift` - Elevación al hacer hover
- `.hover-scale` - Escalado al hacer hover

### Transiciones
- `.transition-fast` - Transición rápida (0.15s)
- `.transition-normal` - Transición normal (0.3s)
- `.transition-slow` - Transición lenta (0.5s)

## Implementación

### 1. Importar el Sistema
El sistema de diseño unificado se importa automáticamente en `src/index.css`:

```css
@import './styles/unified-design-system.css';
```

### 2. Usar las Clases CSS
Aplicar las clases CSS directamente en los componentes:

```tsx
<button className="btn btn-primary btn-lg hover-lift">
  Botón con Efectos
</button>
```

### 3. Componentes React
Los componentes UI ya están actualizados para usar el sistema:

```tsx
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

// Los componentes usan automáticamente el sistema unificado
<Button variant="primary" size="lg">
  Botón Principal
</Button>
```

## Responsive Design

El sistema incluye utilidades responsive que se aplican automáticamente:

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: Adaptación automática a diferentes tamaños de pantalla
- **Flexibilidad**: Componentes que se adaptan al espacio disponible

## Accesibilidad

El sistema incluye características de accesibilidad:

- **Contraste**: Colores con suficiente contraste para legibilidad
- **Focus**: Estados de focus claros y visibles
- **Semántica**: Estructura HTML semántica correcta
- **ARIA**: Atributos ARIA cuando sea necesario

## Mantenimiento

### Actualizar Colores
Para cambiar los colores del sistema, editar las variables CSS en `src/styles/unified-design-system.css`:

```css
:root {
  --color-primary: #nuevo-color;
  --color-secondary: #nuevo-color;
}
```

### Agregar Nuevos Componentes
Para agregar nuevos componentes al sistema:

1. Definir las clases CSS en `unified-design-system.css`
2. Crear el componente React correspondiente
3. Documentar el uso en este archivo

### Consistencia
Mantener la consistencia visual:

- Usar siempre las clases del sistema
- No crear estilos inline personalizados
- Seguir la paleta de colores establecida
- Mantener la jerarquía visual consistente

## Beneficios

1. **Consistencia Visual**: Todas las interfaces tienen el mismo aspecto
2. **Mantenibilidad**: Cambios centralizados en un solo archivo
3. **Desarrollo Rápido**: Componentes predefinidos listos para usar
4. **Experiencia de Usuario**: Interfaz coherente y profesional
5. **Accesibilidad**: Estándares de accesibilidad integrados
6. **Responsive**: Adaptación automática a diferentes dispositivos

## Conclusión

El sistema de diseño unificado proporciona una base sólida para mantener la consistencia visual en toda la aplicación del Sistema de Psicología ISTTA. Al seguir estas guías y usar los componentes predefinidos, se asegura una experiencia de usuario coherente y profesional.


