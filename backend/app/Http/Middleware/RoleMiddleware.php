<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Maneja una solicitud entrante.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $roles  (ejemplo: 'admin,super_admin')
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $roles)
    {
        $user = Auth::user();
        $allowedRoles = explode(',', $roles);
        if (!$user || !in_array($user->role, $allowedRoles)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para acceder a este recurso.'
            ], 403);
        }
        return $next($request);
    }
} 