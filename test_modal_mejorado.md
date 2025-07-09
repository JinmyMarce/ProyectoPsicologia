# Script de Prueba - Modal Mejorado de Agendar Cita

## Objetivo
Verificar que el modal de agendar cita funciona correctamente con los nuevos campos del paciente.

## Pasos de Prueba

### 1. Acceso al Modal
- [ ] Navegar a la página de agendar citas
- [ ] Seleccionar una fecha disponible
- [ ] Verificar que se abre el modal con 3 pasos

### 2. Paso 1 - Selección de Hora
- [ ] Verificar que se muestran los horarios disponibles
- [ ] Seleccionar una hora disponible
- [ ] Verificar que el botón "Siguiente" se habilita
- [ ] Hacer clic en "Siguiente"

### 3. Paso 2 - Datos Personales
- [ ] Verificar que se muestran los campos:
  - [ ] DNI (8 dígitos)
  - [ ] Nombre Completo
  - [ ] Edad (1-120 años)
  - [ ] Género (dropdown)
  - [ ] Dirección
  - [ ] Teléfono
  - [ ] Email

### 4. Validaciones del Paso 2
- [ ] Intentar continuar sin llenar campos obligatorios
- [ ] Verificar mensajes de error para:
  - [ ] DNI inválido (debe ser 8 dígitos)
  - [ ] Edad inválida (fuera del rango 1-120)
  - [ ] Email inválido
  - [ ] Teléfono inválido

### 5. Paso 3 - Contacto de Emergencia e Información Médica
- [ ] Verificar campos de contacto de emergencia:
  - [ ] Nombre del contacto
  - [ ] Relación (dropdown)
  - [ ] Teléfono de emergencia
- [ ] Verificar campos de información médica (opcional):
  - [ ] Antecedentes médicos
  - [ ] Medicamentos actuales
  - [ ] Alergias
- [ ] Verificar políticas:
  - [ ] Política de Privacidad
  - [ ] Política de Cancelación

### 6. Resumen y Confirmación
- [ ] Verificar que el resumen muestra todos los datos ingresados
- [ ] Confirmar la cita
- [ ] Verificar que se crea correctamente en la base de datos

## Campos Nuevos Agregados

### Datos Personales
- `patient_dni`: DNI del paciente (8 dígitos)
- `patient_full_name`: Nombre completo
- `patient_age`: Edad (1-120 años)
- `patient_gender`: Género (masculino/femenino/otro)
- `patient_address`: Dirección completa

### Datos de Contacto
- `patient_phone`: Teléfono del paciente
- `patient_email`: Email del paciente

### Contacto de Emergencia
- `emergency_contact_name`: Nombre del contacto de emergencia
- `emergency_contact_relationship`: Relación con el paciente
- `emergency_contact_phone`: Teléfono de emergencia

### Información Médica (Opcional)
- `medical_history`: Antecedentes médicos
- `current_medications`: Medicamentos actuales
- `allergies`: Alergias conocidas

## Mejoras Implementadas

### Frontend
1. **Modal con 3 pasos**: Navegación progresiva
2. **Validaciones en tiempo real**: Mensajes de error específicos
3. **Campos organizados**: Agrupación lógica de información
4. **Resumen detallado**: Muestra todos los datos antes de confirmar
5. **Información médica opcional**: Campos para antecedentes médicos

### Backend
1. **Nueva migración**: Campos adicionales en tabla citas
2. **Validaciones robustas**: Reglas de validación para cada campo
3. **Modelo actualizado**: Nuevos campos en fillable y casts
4. **Controlador mejorado**: Manejo de todos los nuevos campos

### Base de Datos
1. **Campos personales**: DNI, nombre, edad, género, dirección
2. **Datos de contacto**: Teléfono y email del paciente
3. **Contacto de emergencia**: Nombre, relación y teléfono
4. **Información médica**: Antecedentes, medicamentos, alergias

## Resultado Esperado
- Modal funcional con navegación por pasos
- Validaciones completas de todos los campos
- Datos del paciente guardados correctamente
- Resumen detallado antes de confirmar
- Integración completa con el backend

## Notas
- La información médica es opcional y confidencial
- Todos los campos personales son obligatorios
- El contacto de emergencia es obligatorio
- Las políticas deben ser aceptadas para continuar 