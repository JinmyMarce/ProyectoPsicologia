# Carpeta de Imágenes

Esta carpeta contiene todas las imágenes utilizadas en el proyecto.

## Estructura de carpetas:

```
public/images/
├── icons/          # Iconos del sistema (logos, favicons, etc.)
├── avatars/        # Imágenes de perfil de usuarios
├── backgrounds/    # Imágenes de fondo
└── README.md       # Este archivo
```

## Cómo usar las imágenes:

### En React (frontend):
```jsx
// Para iconos
<img src="/images/icons/logo.png" alt="Logo" />

// Para avatares
<img src="/images/avatars/user1.jpg" alt="Usuario" />

// Para fondos
<div style={{ backgroundImage: 'url(/images/backgrounds/login-bg.jpg)' }}>
```

### Formatos recomendados:
- **Iconos:** PNG, SVG (preferiblemente SVG para escalabilidad)
- **Avatares:** JPG, PNG (tamaño recomendado: 200x200px)
- **Fondos:** JPG, PNG (tamaño recomendado: 1920x1080px)

### Tamaños recomendados:
- **Iconos pequeños:** 16x16px, 24x24px, 32x32px
- **Iconos medianos:** 48x48px, 64x64px
- **Iconos grandes:** 128x128px, 256x256px
- **Logos:** 200x200px o según proporción original

## Nomenclatura:
- Usar nombres descriptivos en minúsculas
- Separar palabras con guiones: `logo-institucional.png`
- Incluir dimensiones si es necesario: `avatar-user-200x200.jpg` 