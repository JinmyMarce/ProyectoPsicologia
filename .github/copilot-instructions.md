# Copilot Instructions for ProyectoPsicologia

## Project Overview
- **Full-stack system** for psychological appointment management, built with **React (frontend)** and **Laravel (backend)**.
- Key user roles: Super Admin, Admin, Psychologist, Student. Each has distinct dashboard and permissions.
- Data flows via RESTful API endpoints (`/api/*`), with authentication and role-based access.
- **Frontend**: Located in `src/`, uses React, Tailwind CSS, and Lucide React icons. UI/UX is highly customized to institutional branding (see color and typography in `README.md`).
- **Backend**: Located in `backend/`, standard Laravel structure. All business logic, migrations, and API endpoints are here.

## Developer Workflows
- **Backend setup**: `cd backend; composer install; cp .env.example .env; php artisan key:generate; php artisan migrate:fresh --seed; php artisan serve`
- **Frontend setup**: `npm install; npm run dev`
- **Build for production**: Backend: `php artisan config:cache` etc. Frontend: `npm run build`
- **Testing**: Laravel tests in `backend/tests/`. Frontend tests in root (e.g., `test_modal_mejorado.md`, `test_sistema_citas.js`).
- **API contracts**: See `README.md` for endpoint list and sample payloads.

## Project Conventions & Patterns
- **UI Components**: All reusable UI in `src/components/ui/`. Role-specific components in subfolders (e.g., `psychologist/`, `admin/`).
- **State/context**: Shared React context in `src/contexts/`.
- **Services**: API calls and business logic in `src/services/`.
- **Types**: Shared TypeScript types in `src/types/`.
- **Styling**: Tailwind CSS, with custom colors and fonts (see `tailwind.config.js`).
- **Icons**: Use Lucide React icons for consistency. See usage in `PatientDetailsModalOld.tsx`.
- **Images**: Place in `public/images/` (see `public/images/README.md` for structure and usage).
- **Error handling**: User-facing errors are shown via clear UI messages (see modal components for patterns).
- **Loading states**: Use animated loaders and skeletons for async UI.

## Integration & Cross-Component Patterns
- **Frontend-backend communication**: Always via `/api/*` endpoints. Auth required for most routes.
- **Notifications**: Real-time and persistent, handled via backend events and frontend listeners.
- **Role-based rendering**: UI adapts based on user role (see dashboard and sidebar components).
- **Responsive design**: All UI is mobile-first and tested for 320px+ widths.

## Key Files & Directories
- `src/components/` — All React components, organized by domain/role.
- `src/services/` — API and business logic.
- `backend/app/Http/Controllers/` — Laravel controllers for API.
- `backend/routes/api.php` — All API route definitions.
- `README.md` — Project features, setup, API reference, and design guidelines.
- `public/images/README.md` — Image usage and conventions.

## Examples
- **Patient modal**: See `src/components/psychologist/PatientDetailsModalOld.tsx` for data display, formatting, and UI conventions.
- **API usage**: See `src/services/` for fetch patterns and error handling.

---
For any unclear conventions, check the main `README.md` or ask for clarification.
