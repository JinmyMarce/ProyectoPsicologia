# SAPTA (Sistema de Atención Psicológica Túpac Amaru)

Repositorio del sistema de gestión de citas psicológicas.

## Requisitos
- **Backend**: PHP 8.1+, Composer, MySQL 8+
- **Frontend**: Node.js 16+

## Cómo ejecutar (desarrollo)
### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### Frontend (Vite + React)

```bash
npm install
npm run dev
```

## Configuración (Google OAuth)
- **Frontend**: `src/config/auth.ts` → `AUTH_CONFIG.GOOGLE_CLIENT_ID`
- **Backend**: `backend/.env` → `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`