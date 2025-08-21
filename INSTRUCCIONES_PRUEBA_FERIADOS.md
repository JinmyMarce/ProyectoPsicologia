# 🔍 Instrucciones para Probar Feriados en Calendarios

## 🚀 Pasos para Verificar que los Feriados se Ven

### **1. Asegurar que el Backend Esté Running**
```bash
# En terminal (desde carpeta backend):
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

### **2. Probar la API Directamente**
Abre el archivo `test-holidays-api.html` en tu navegador y:
- ✅ Haz clic en "Probar Próximos Feriados"
- ✅ Haz clic en "Probar Mes Actual"
- ✅ Verifica que aparezcan feriados con colores

### **3. Verificar en la Consola del Navegador**
1. **Abre el calendario** (estudiante o psicólogo)
2. **Abre DevTools** (F12)
3. **Ve a la pestaña Console**
4. **Busca estos mensajes:**
   ```
   🎉 Cargando feriados para 8/2025...
   ✅ Conexión exitosa con API de feriados: true
   ✅ Feriados encontrados para 8/2025: 2
   🎉 Feriados cargados: 2 encontrados
   🎉 DÍA FERIADO DETECTADO: Sat Aug 30 2025 (Santa Rosa de Lima)
   ```

### **4. Buscar Feriados Visualmente**
En el calendario, busca días con:
- 🔴 **Fondo rojo** + borde rojo = Feriados nacionales
- 🟡 **Fondo amarillo** + borde amarillo = Feriados regionales

### **5. Feriados que Deberías Ver en 2025:**

#### **Agosto 2025:**
- **30 de Agosto**: Santa Rosa de Lima (Nacional) - ROJO

#### **Octubre 2025:**
- **8 de Octubre**: Combate de Angamos (Nacional) - ROJO
- **18 de Octubre**: Señor de los Milagros (Regional Lima) - AMARILLO

#### **Noviembre 2025:**
- **1 de Noviembre**: Todos los Santos (Nacional) - ROJO
- **3 de Noviembre**: San Martín de Porres (Regional Lima) - AMARILLO

#### **Diciembre 2025:**
- **8 de Diciembre**: Inmaculada Concepción (Nacional) - ROJO
- **25 de Diciembre**: Navidad (Nacional) - ROJO

## 🔧 Si NO Ves Feriados:

### **Problema 1: Error de Conexión**
**Síntomas:** En consola aparece `❌ Error de conexión`
**Solución:**
```bash
# Verificar que el servidor esté corriendo:
curl http://127.0.0.1:8000/api/holidays/stats
# O en PowerShell:
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/holidays/stats"
```

### **Problema 2: CORS**
**Síntomas:** Error de CORS en consola
**Solución:** Verificar que el frontend corra en puerto permitido (5173, 3000, etc.)

### **Problema 3: Base de Datos Vacía**
**Síntomas:** API responde pero sin feriados
**Solución:**
```bash
cd backend
php artisan holidays:generate --auto
```

### **Problema 4: Frontend No Actualiza**
**Solución:** Refrescar la página (Ctrl+F5) o limpiar caché

## 📱 Comandos de Emergencia:

```bash
# 1. Regenerar todos los feriados
cd backend
php artisan holidays:generate --start-year=2024 --end-year=2026

# 2. Verificar que se crearon
php artisan tinker
>>> \App\Models\Holiday::count()
>>> \App\Models\Holiday::where('date', '2025-12-25')->first()

# 3. Probar API manualmente
curl http://127.0.0.1:8000/api/holidays/upcoming
```

## ✅ Resultado Esperado:

Cuando todo funcione, deberías ver:
1. **En la consola**: Mensajes de carga exitosa
2. **En el calendario**: Días con colores distintivos
3. **Al hacer clic**: Mensaje informativo del feriado
4. **En la leyenda**: Sección de feriados explicativa

## 🎯 Pruebas Específicas:

1. **Navega a Diciembre 2025** → deberías ver el 25 en ROJO
2. **Haz clic en el 25** → mensaje "FERIADO NACIONAL: Navidad"
3. **Navega a Octubre 2025** → deberías ver el 18 en AMARILLO
4. **Verifica la leyenda** → nueva sección "Feriados"

Si sigues estos pasos, los feriados deberían aparecer claramente en tu calendario! 🎉







