<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PsychologistHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!$user || $user->email !== 'marcelojinmy2024@gmail.com') {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo el superadministrador puede acceder.'
                ], 403);
            }
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        try {
            $query = User::query();

            // Filtros
            if ($request->has('role') && $request->role) {
                $query->where('role', $request->role);
            }

            if ($request->has('active') && $request->active !== null) {
                $query->where('active', $request->active);
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Paginación
            $perPage = $request->get('per_page', 15);
            $users = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en UserController@index: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Verificar autenticación
            if (!auth()->check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No estás autenticado',
                    'error' => 'Authentication required'
                ], 401);
            }

            // Verificar permisos
            $user = auth()->user();
            if (!in_array($user->role, ['admin', 'super_admin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para crear usuarios',
                    'error' => 'Insufficient permissions'
                ], 403);
            }

            // Solo se pueden crear usuarios con rol admin o psychologist desde el panel de gestión
            $allowedRoles = ['admin', 'psychologist'];

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => ['required', Rule::in($allowedRoles)],
                'specialization' => 'nullable|string|max:255',
                'verified' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'specialization' => $request->specialization,
                'verified' => $request->verified ?? false,
                'active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuario creado exitosamente',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error en UserController@store: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($id)],
            'specialization' => 'nullable|string|max:255',
            'verified' => 'boolean',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'email', 'specialization', 'verified', 'active']));

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // No permitir eliminar super admins
        if ($user->role === 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un super administrador'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }

    public function deactivate(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Guardar en historial si es psicólogo
        if ($user->role === 'psychologist') {
            PsychologistHistory::create([
                'psychologist_id' => $user->id,
                'action' => 'deactivated',
                'reason' => $request->reason,
                'performed_by' => auth()->id(),
            ]);
        }

        $user->update(['active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario desactivado exitosamente'
        ]);
    }

    public function reactivate($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // Guardar en historial si es psicólogo
        if ($user->role === 'psychologist') {
            PsychologistHistory::create([
                'psychologist_id' => $user->id,
                'action' => 'reactivated',
                'reason' => 'Usuario reactivado',
                'performed_by' => auth()->id(),
            ]);
        }

        $user->update(['active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario reactivado exitosamente'
        ]);
    }

    public function history($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        if ($user->role !== 'psychologist') {
            return response()->json([
                'success' => false,
                'message' => 'Solo los psicólogos tienen historial'
            ], 400);
        }

        $history = PsychologistHistory::where('psychologist_id', $id)
            ->with('performedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    public function changePassword(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar contraseña actual
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'La contraseña actual es incorrecta'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contraseña cambiada exitosamente'
        ]);
    }

    public function sendVerificationEmail($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // Generar token de restablecimiento
        $token = Str::random(64);
        
        // Guardar token en la base de datos (aquí podrías usar una tabla de password_resets)
        // Por ahora simulamos el envío del correo
        
        // En un entorno real, aquí enviarías el email con el token
        // Mail::to($user->email)->send(new PasswordResetMail($user, $token));

        return response()->json([
            'success' => true,
            'message' => 'Correo de restablecimiento de contraseña enviado exitosamente a ' . $user->email
        ]);
    }

    public function sendPasswordResetEmail(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // Generar token de restablecimiento
        $token = Str::random(64);
        
        // En un entorno real, aquí enviarías el email con el token
        // Mail::to($user->email)->send(new PasswordResetMail($user, $token));

        return response()->json([
            'success' => true,
            'message' => 'Correo de restablecimiento de contraseña enviado exitosamente a ' . $user->email
        ]);
    }

    public function stats()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('active', true)->count(),
            'inactive_users' => User::where('active', false)->count(),
            'verified_users' => User::where('verified', true)->count(),
            'unverified_users' => User::where('verified', false)->count(),
            'by_role' => [
                'students' => User::where('role', 'student')->count(),
                'psychologists' => User::where('role', 'psychologist')->count(),
                'admins' => User::where('role', 'admin')->count(),
                'super_admins' => User::where('role', 'super_admin')->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Obtener el perfil del usuario autenticado
     */
    public function profile()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'career' => $user->career,
                    'semester' => $user->semester,
                    'student_id' => $user->student_id,
                    'specialization' => $user->specialization,
                    'verified' => $user->verified,
                    'active' => $user->active,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el perfil del usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar el perfil del usuario autenticado
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $validator = \Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'career' => 'sometimes|nullable|string|max:255',
                'semester' => 'sometimes|nullable|integer|min:1|max:10',
                'specialization' => 'sometimes|nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->update($request->only(['name', 'career', 'semester', 'specialization']));

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado exitosamente',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'career' => $user->career,
                    'semester' => $user->semester,
                    'student_id' => $user->student_id,
                    'specialization' => $user->specialization,
                    'verified' => $user->verified,
                    'active' => $user->active,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el perfil: ' . $e->getMessage()
            ], 500);
        }
    }
} 