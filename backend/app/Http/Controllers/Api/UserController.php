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
    /**
     * @var \App\Models\User|null
     */
    public function index(Request $request)
    {
        try {
            /** @var \App\Models\User|null $user */
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autenticado.'
                ], 401);
            }

            // Permitir solo a superadmin y admin
            if (!in_array($user->role, ['super_admin', 'admin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo el superadministrador o administrador puede acceder.'
                ], 403);
            }

            $query = User::query();

            // Si es admin, solo puede ver usuarios activos (de cualquier rol)
            if ($user->role === 'admin') {
                $query->where('active', true);
            }

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
            Log::error('Error en UserController@index: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Verificar autenticación
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No estás autenticado',
                    'error' => 'Authentication required'
                ], 401);
            }

            /** @var \App\Models\User|null $user */
            $user = Auth::user();
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
                'dni' => 'required|string|size:8|unique:users,dni',
                'phone' => [
                    'required',
                    'string',
                    'size:12',
                    'regex:/^\\+519[0-9]{8}$/',
                    'unique:users,phone'
                ],
                'birthdate' => 'required|date',
                'gender' => 'required|in:masculino,femenino,otro',
                'specialization' => 'nullable|string|max:255',
                'verified' => 'boolean',
            ], [
                'name.required' => 'El nombre completo es obligatorio',
                'email.required' => 'El correo es obligatorio',
                'email.email' => 'El correo debe tener un formato válido',
                'email.unique' => 'El correo ya está registrado',
                'password.required' => 'La contraseña es obligatoria',
                'password.min' => 'La contraseña debe tener al menos 8 caracteres',
                'role.required' => 'El rol es obligatorio',
                'dni.required' => 'El DNI es obligatorio',
                'dni.size' => 'El DNI debe tener 8 dígitos',
                'dni.unique' => 'El DNI ya está registrado',
                'phone.required' => 'El número de celular es obligatorio',
                'phone.size' => 'El número de celular debe tener 12 caracteres (+519xxxxxxxx)',
                'phone.regex' => 'El número debe estar en formato +519xxxxxxxx',
                'phone.unique' => 'El número de celular ya está registrado',
                'birthdate.required' => 'La fecha de nacimiento es obligatoria',
                'birthdate.date' => 'La fecha de nacimiento no es válida',
                'gender.required' => 'El género es obligatorio',
                'gender.in' => 'El género debe ser masculino, femenino u otro',
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
                'dni' => $request->dni,
                'phone' => $request->phone,
                'birthdate' => $request->birthdate,
                'gender' => $request->gender,
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
            Log::error('Error en UserController@store: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        /** @var \App\Models\User|null $user */
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

    /**
     * @param Request $request
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        /** @var \App\Models\User|null $user */
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // Si viene un archivo avatar, guárdalo y actualiza el campo
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = uniqid('avatar_') . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/avatars', $filename); // guarda en storage/app/public/avatars
            $user->avatar = '/storage/avatars/' . $filename; // URL pública
            $user->save();
        }

        /** @var \Illuminate\Support\Facades\Validator $validator */
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($id)],
            'dni' => 'sometimes|string|size:8|unique:users,dni,' . $id,
            'phone' => 'sometimes|string|size:9|regex:/^9[0-9]{8}$/|unique:users,phone,' . $id,
            'birthdate' => 'sometimes|date',
            'gender' => 'sometimes|in:masculino,femenino,otro',
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

        $user->update($request->only(['name', 'email', 'dni', 'phone', 'birthdate', 'gender', 'specialization', 'verified', 'active']));

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente',
            'data' => $user
        ]);
    }

    /**
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        /** @var \App\Models\User|null $user */
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

    /**
     * @param Request $request
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deactivate(Request $request, $id)
    {
        /** @var \App\Models\User|null $user */
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        /** @var \Illuminate\Support\Facades\Validator $validator */
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
                'original_user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'specialization' => $user->specialization,
                'rating' => $user->rating,
                'total_appointments' => $user->total_appointments,
                'avatar' => $user->avatar,
                'google_id' => $user->google_id,
                'verified' => $user->verified,
                'deactivated_at' => now(),
                'deactivated_by' => Auth::user() ? Auth::user()->email : null,
                'deactivation_reason' => $request->reason,
            ]);
        }

        $user->update(['active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario desactivado exitosamente'
        ]);
    }

    /**
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function reactivate($id)
    {
        /** @var \App\Models\User|null $user */
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

    /**
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function history($id)
    {
        /** @var \App\Models\User|null $user */
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

    /**
     * @param Request $request
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request, $id)
    {
        /** @var \App\Models\User|null $user */
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

    /**
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendVerificationEmail($id)
    {
        /** @var \App\Models\User|null $user */
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

    /**
     * @param Request $request
     * @param int|string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendPasswordResetEmail(Request $request, $id)
    {
        /** @var \App\Models\User|null $user */
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

    /**
     * @return \Illuminate\Http\JsonResponse
     */
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
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        try {
            /** @var \App\Models\User|null $user */
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
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        try {
            /** @var \App\Models\User|null $user */
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