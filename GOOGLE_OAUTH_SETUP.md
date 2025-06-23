# Configuración de Google OAuth para el Sistema de Psicología

## 1. Configurar Google Cloud Console

### Crear Proyecto y Habilitar APIs
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ y Google OAuth2

### Configurar Credenciales OAuth2
1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Selecciona "Web application"
4. Configura las siguientes URIs de redirección autorizadas:

**Para desarrollo local:**
```
http://localhost:8000/auth/google/callback
http://localhost:5173
http://localhost:5173/
http://localhost:3000
http://localhost:3000/
http://localhost:3000/auth/callback
http://localhost:3000/login
```

**Para producción (cuando despliegues):**
```
https://tu-dominio.com/auth/google/callback
https://tu-dominio.com
https://tu-dominio.com/
https://tu-dominio.com/auth/callback
https://tu-dominio.com/login
```

5. Guarda el Client ID generado

## 2. Configurar el Frontend

### Actualizar Client ID
En el archivo `src/config/auth.ts`:

```typescript
export const AUTH_CONFIG = {
  // Reemplaza con tu Client ID real
  GOOGLE_CLIENT_ID: '25922165495-7ip4geihfadda3m7mph74pe76fr5ujdm.apps.googleusercontent.com',
  
  // URL de la API
  API_BASE_URL: 'http://localhost:8000/api',
  
  // Dominios permitidos
  ALLOWED_DOMAINS: {
    INSTITUTIONAL: '@istta.edu.pe',
    PERSONAL: ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com']
  }
};
```

### Configurar Google OAuth Service
En el archivo `src/services/googleAuth.ts`, asegúrate de que esté usando el Client ID correcto:

```typescript
// La configuración ya está usando AUTH_CONFIG.GOOGLE_CLIENT_ID
this.googleAuth.initTokenClient({
  client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
  scope: 'email profile',
  // ...
});
```

## 3. Configurar el Backend

### Variables de Entorno
En el archivo `.env` del backend:

```env
GOOGLE_CLIENT_ID=25922165495-7ip4geihfadda3m7mph74pe76fr5ujdm.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

### Configurar CORS
En `config/cors.php`:

```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## 4. Probar la Configuración

### Usuarios de Prueba
El sistema incluye usuarios de prueba para cada rol:

**Estudiantes (Google OAuth con @istta.edu.pe):**
- jquispe.231ds24@istta.edu.pe
- maria.gonzalez.2023@istta.edu.pe

**Psicólogos (Email personal + contraseña):**
- dr.ana.garcia@gmail.com / password123
- psicologo.juan@hotmail.com / password123

**Administradores (Email personal + contraseña):**
- admin.sistema@gmail.com / admin123
- director.psicologia@outlook.com / director123

## 5. Solución de Problemas

### Error: redirect_uri_mismatch
Si ves este error, verifica que las URIs de redirección en Google Cloud Console incluyan:
- `http://localhost:8000/auth/google/callback` (tu URI actual)
- `http://localhost:3000`
- `http://localhost:3000/`
- `http://localhost:3000/auth/callback`

### Error: invalid_client
Verifica que el Client ID en `src/config/auth.ts` coincida exactamente con el de Google Cloud Console.

### Error: access_denied
Asegúrate de que el dominio del email esté en la lista de dominios permitidos:
- Estudiantes: `@istta.edu.pe`
- Psicólogos/Admin: dominios personales (@gmail.com, @hotmail.com, etc.)

## 6. Flujo de Autenticación

1. **Estudiantes**: Usan Google OAuth con correo `@istta.edu.pe`
2. **Psicólogos**: Usan email personal + contraseña
3. **Administradores**: Usan email personal + contraseña

El sistema determina automáticamente el rol basado en el dominio del email. 