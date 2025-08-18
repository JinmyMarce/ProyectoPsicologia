<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class TutorController extends Controller
{
    /**
     * Obtener todos los tutores (Solo Super Admin)
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

        try {
            $tutors = User::tutors()
                ->active()
                ->with(['tutorDerivations', 'groupSessions'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tutors->map(function ($tutor) {
                    return $tutor->toApiArray();
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tutores'
            ], 500);
        }
    }

    /**
     * Crear un nuevo tutor (Solo Super Admin)
     */
    public function store(Request $request): JsonResponse
    {
        // Verificar que el usuario sea super admin
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden crear tutores.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'dni' => 'required|string|max:8|unique:users,dni',
            'phone' => 'required|string|max:15',
            'classroom' => 'required|string|max:50',
            'study_program' => 'required|string|max:100',
            'semester' => 'nullable|string|max:20',
            'course' => 'nullable|string|max:100',
            'verified' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que sea un email institucional (para tutores)
        if (!str_ends_with($request->email, '@istta.edu.pe')) {
            return response()->json([
                'success' => false,
                'message' => 'Los tutores deben usar correo institucional (@istta.edu.pe)'
            ], 422);
        }

        try {
            $tutor = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'tutor',
                'dni' => $request->dni,
                'phone' => $request->phone,
                'classroom' => $request->classroom,
                'study_program' => $request->study_program,
                'semester' => $request->semester,
                'course' => $request->course,
                'total_students' => 0,
                'active_derivations' => 0,
                'verified' => $request->verified ?? false,
                'active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Tutor creado exitosamente',
                'data' => $tutor->toApiArray()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el tutor'
            ], 500);
        }
    }

    /**
     * Mostrar un tutor específico
     */
    public function show($id): JsonResponse
    {
        // Verificar permisos
        if (!Auth::user()->isSuperAdmin() && !Auth::user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        $tutor = User::tutors()
            ->active()
            ->with(['tutorDerivations.student', 'tutorDerivations.psychologist', 'groupSessions'])
            ->find($id);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $tutor->toApiArray()
        ]);
    }

    /**
     * Actualizar un tutor
     */
    public function update(Request $request, $id): JsonResponse
    {
        // Verificar permisos
        if (!Auth::user()->isSuperAdmin() && !Auth::user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        $tutor = User::tutors()->active()->find($id);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'dni' => 'sometimes|required|string|max:8|unique:users,dni,' . $id,
            'phone' => 'sometimes|required|string|max:15',
            'classroom' => 'sometimes|required|string|max:50',
            'study_program' => 'sometimes|required|string|max:100',
            'semester' => 'nullable|string|max:20',
            'course' => 'nullable|string|max:100',
            'verified' => 'boolean',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $tutor->update($request->only([
                'name', 'email', 'dni', 'phone', 'classroom', 'study_program', 'semester', 'course', 'verified', 'active'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Tutor actualizado exitosamente',
                'data' => $tutor->fresh()->toApiArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el tutor'
            ], 500);
        }
    }

    /**
     * Desactivar un tutor
     */
    public function destroy($id): JsonResponse
    {
        // Solo super admin puede desactivar tutores
        if (!Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Solo super administradores pueden desactivar tutores.'
            ], 403);
        }

        $tutor = User::tutors()->find($id);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor no encontrado'
            ], 404);
        }

        try {
            $tutor->update(['active' => false]);

            return response()->json([
                'success' => true,
                'message' => 'Tutor desactivado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al desactivar el tutor'
            ], 500);
        }
    }

    /**
     * Obtener estudiantes asignados a un tutor
     */
    public function getStudents($tutorId): JsonResponse
    {
        $tutor = User::tutors()->active()->find($tutorId);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor no encontrado'
            ], 404);
        }

        // Verificar permisos: el tutor puede ver sus estudiantes, admin/super_admin pueden ver todos
        if (!Auth::user()->isSuperAdmin() && !Auth::user()->isAdmin() && Auth::id() !== $tutor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        try {
            // Aquí podrías implementar la lógica para obtener estudiantes del tutor
            // Por ejemplo, si hay una relación tutor-estudiante o basado en el aula
            $students = User::where('role', 'student')
                ->where('active', true)
                // Aquí podrías agregar filtros específicos para relacionar estudiantes con tutores
                ->get();

            return response()->json([
                'success' => true,
                'data' => $students->map(function ($student) {
                    return $student->toApiArray();
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estudiantes'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas del tutor
     */
    public function getStats($tutorId): JsonResponse
    {
        $tutor = User::tutors()->active()->find($tutorId);

        if (!$tutor) {
            return response()->json([
                'success' => false,
                'message' => 'Tutor no encontrado'
            ], 404);
        }

        // Verificar permisos
        if (!Auth::user()->isSuperAdmin() && !Auth::user()->isAdmin() && Auth::id() !== $tutor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        try {
            $stats = [
                'total_students' => $tutor->total_students ?? 0,
                'active_derivations' => $tutor->tutorDerivations()->whereIn('status', ['pending', 'assigned', 'in_progress'])->count(),
                'completed_derivations' => $tutor->tutorDerivations()->where('status', 'completed')->count(),
                'total_derivations' => $tutor->tutorDerivations()->count(),
                'scheduled_sessions' => $tutor->groupSessions()->where('status', 'scheduled')->count(),
                'completed_sessions' => $tutor->groupSessions()->where('status', 'completed')->count(),
                'total_sessions' => $tutor->groupSessions()->count(),
                'derivations_by_urgency' => [
                    'critical' => $tutor->tutorDerivations()->where('urgency', 'critical')->count(),
                    'high' => $tutor->tutorDerivations()->where('urgency', 'high')->count(),
                    'medium' => $tutor->tutorDerivations()->where('urgency', 'medium')->count(),
                    'low' => $tutor->tutorDerivations()->where('urgency', 'low')->count(),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas'
            ], 500);
        }
    }
}
