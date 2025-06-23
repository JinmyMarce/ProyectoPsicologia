<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PsychologistHistory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PsychologistController extends Controller
{
    /**
     * Listar todos los psicólogos activos
     */
    public function index(): JsonResponse
    {
        // Verificar que el usuario sea super admin
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden acceder.'
            ], 403);
        }

        $psychologists = User::psychologists()
            ->active()
            ->select('id', 'name', 'email', 'specialization', 'rating', 'total_appointments', 'verified', 'created_at')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $psychologists
        ]);
    }

    /**
     * Crear un nuevo psicólogo
     */
    public function store(Request $request): JsonResponse
    {
        // Verificar que el usuario sea super admin
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden crear psicólogos.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'specialization' => 'required|string|max:255',
            'verified' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que sea un email personal (para psicólogos)
        $personalDomains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];
        $isPersonalEmail = false;
        foreach ($personalDomains as $domain) {
            if (str_ends_with($request->email, $domain)) {
                $isPersonalEmail = true;
                break;
            }
        }
        
        if (!$isPersonalEmail) {
            return response()->json([
                'success' => false,
                'message' => 'Los psicólogos deben usar correo personal (Gmail, Hotmail, etc.)'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $psychologist = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'psychologist',
                'specialization' => $request->specialization,
                'rating' => 0.00,
                'total_appointments' => 0,
                'verified' => $request->verified ?? false,
                'active' => true,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Psicólogo creado exitosamente',
                'data' => $psychologist->toApiArray()
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el psicólogo'
            ], 500);
        }
    }

    /**
     * Mostrar un psicólogo específico
     */
    public function show($id): JsonResponse
    {
        // Verificar que el usuario sea super admin
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden acceder.'
            ], 403);
        }

        $psychologist = User::psychologists()
            ->active()
            ->find($id);

        if (!$psychologist) {
            return response()->json([
                'success' => false,
                'message' => 'Psicólogo no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $psychologist->toApiArray()
        ]);
    }

    /**
     * Actualizar un psicólogo
     */
    public function update(Request $request, $id): JsonResponse
    {
        // Verificar que el usuario sea super admin
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden modificar psicólogos.'
            ], 403);
        }

        $psychologist = User::psychologists()
            ->active()
            ->find($id);

        if (!$psychologist) {
            return response()->json([
                'success' => false,
                'message' => 'Psicólogo no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'specialization' => 'sometimes|required|string|max:255',
            'verified' => 'sometimes|boolean',
            'password' => 'sometimes|required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $updateData = $request->only(['name', 'specialization', 'verified']);
            
            if ($request->has('email')) {
                // Verificar que sea un email personal
                $personalDomains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'];
                $isPersonalEmail = false;
                foreach ($personalDomains as $domain) {
                    if (str_ends_with($request->email, $domain)) {
                        $isPersonalEmail = true;
                        break;
                    }
                }
                
                if (!$isPersonalEmail) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Los psicólogos deben usar correo personal (Gmail, Hotmail, etc.)'
                    ], 422);
                }
                $updateData['email'] = $request->email;
            }

            if ($request->has('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $psychologist->update($updateData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Psicólogo actualizado exitosamente',
                'data' => $psychologist->fresh()->toApiArray()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el psicólogo'
            ], 500);
        }
    }

    /**
     * Desactivar un psicólogo (mover a historial)
     */
    public function deactivate(Request $request, $id): JsonResponse
    {
        // Verificar que el usuario sea super admin
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden desactivar psicólogos.'
            ], 403);
        }

        $psychologist = User::psychologists()
            ->active()
            ->find($id);

        if (!$psychologist) {
            return response()->json([
                'success' => false,
                'message' => 'Psicólogo no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'deactivation_reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Crear registro en el historial
            PsychologistHistory::create([
                'original_user_id' => $psychologist->id,
                'name' => $psychologist->name,
                'email' => $psychologist->email,
                'role' => $psychologist->role,
                'specialization' => $psychologist->specialization,
                'rating' => $psychologist->rating,
                'total_appointments' => $psychologist->total_appointments,
                'avatar' => $psychologist->avatar,
                'google_id' => $psychologist->google_id,
                'verified' => $psychologist->verified,
                'deactivated_at' => now(),
                'deactivated_by' => Auth::user()->email,
                'deactivation_reason' => $request->deactivation_reason,
            ]);

            // Desactivar el usuario
            $psychologist->update([
                'active' => false,
            ]);

            // Revocar todos los tokens del psicólogo
            $psychologist->tokens()->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Psicólogo desactivado exitosamente y movido al historial'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar el psicólogo'
            ], 500);
        }
    }

    /**
     * Obtener historial de psicólogos desactivados
     */
    public function history(): JsonResponse
    {
        // Verificar que el usuario sea super admin
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden acceder al historial.'
            ], 403);
        }

        $history = PsychologistHistory::orderBy('deactivated_at', 'desc')
            ->select('id', 'name', 'email', 'specialization', 'rating', 'total_appointments', 'deactivated_at', 'deactivated_by', 'deactivation_reason')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    /**
     * Reactivar un psicólogo desde el historial
     */
    public function reactivate($historyId): JsonResponse
    {
        // Verificar que el usuario sea super admin
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden reactivar psicólogos.'
            ], 403);
        }

        $historyRecord = PsychologistHistory::find($historyId);

        if (!$historyRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Registro de historial no encontrado'
            ], 404);
        }

        // Verificar si el email ya está en uso por otro usuario activo
        $existingUser = User::where('email', $historyRecord->email)
            ->where('id', '!=', $historyRecord->original_user_id)
            ->active()
            ->first();

        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede reactivar. El email ya está en uso por otro usuario.'
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Buscar el usuario original
            $originalUser = User::find($historyRecord->original_user_id);

            if ($originalUser) {
                // Reactivar el usuario original
                $originalUser->update([
                    'active' => true,
                    'name' => $historyRecord->name,
                    'email' => $historyRecord->email,
                    'specialization' => $historyRecord->specialization,
                    'rating' => $historyRecord->rating,
                    'total_appointments' => $historyRecord->total_appointments,
                    'avatar' => $historyRecord->avatar,
                    'google_id' => $historyRecord->google_id,
                    'verified' => $historyRecord->verified,
                ]);
            } else {
                // Crear un nuevo usuario con los datos del historial
                $originalUser = User::create([
                    'name' => $historyRecord->name,
                    'email' => $historyRecord->email,
                    'password' => Hash::make('temporary_password_' . time()), // Contraseña temporal
                    'role' => 'psychologist',
                    'specialization' => $historyRecord->specialization,
                    'rating' => $historyRecord->rating,
                    'total_appointments' => $historyRecord->total_appointments,
                    'avatar' => $historyRecord->avatar,
                    'google_id' => $historyRecord->google_id,
                    'verified' => $historyRecord->verified,
                    'active' => true,
                ]);

                // Actualizar el historial con el nuevo ID
                $historyRecord->update(['original_user_id' => $originalUser->id]);
            }

            // Eliminar el registro del historial
            $historyRecord->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Psicólogo reactivado exitosamente',
                'data' => $originalUser->toApiArray()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al reactivar el psicólogo'
            ], 500);
        }
    }
}
