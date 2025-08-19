<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Derivation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class DerivationController extends Controller
{
    /**
     * Obtener todas las derivaciones
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        try {
            $query = Derivation::with(['student', 'tutor', 'psychologist']);

            // Filtrar según el rol del usuario
            if ($user->isTutor()) {
                // Tutores solo ven sus derivaciones
                $query->where('tutor_id', $user->id);
            } elseif ($user->isPsychologist()) {
                // Psicólogos ven derivaciones asignadas a ellos
                $query->where('psychologist_id', $user->id);
            } elseif (!$user->isAdmin() && !$user->isSuperAdmin()) {
                // Otros roles no autorizados
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado.'
                ], 403);
            }

            // Filtros opcionales
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('urgency')) {
                $query->where('urgency', $request->urgency);
            }

            if ($request->has('tutor_id')) {
                $query->where('tutor_id', $request->tutor_id);
            }

            if ($request->has('psychologist_id')) {
                $query->where('psychologist_id', $request->psychologist_id);
            }

            $derivations = $query->latest()->get();

            return response()->json([
                'success' => true,
                'data' => $derivations->map(function ($derivation) {
                    return $derivation->toApiArray();
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener derivaciones'
            ], 500);
        }
    }

    /**
     * Crear una nueva derivación (Solo tutores)
     */
    public function store(Request $request): JsonResponse
    {
        // Solo tutores pueden crear derivaciones
        if (!Auth::user()->isTutor()) {
            return response()->json([
                'success' => false,
                'message' => 'Solo los tutores pueden crear derivaciones.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'reason' => 'required|string|min:10',
            'urgency' => 'required|in:low,medium,high,critical',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar que el estudiante existe y es estudiante
        $student = User::find($request->student_id);
        if (!$student || !$student->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'El estudiante seleccionado no es válido.'
            ], 422);
        }

        try {
            $derivation = Derivation::create([
                'student_id' => $request->student_id,
                'tutor_id' => Auth::id(),
                'reason' => $request->reason,
                'urgency' => $request->urgency,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            // Actualizar contador de derivaciones activas del tutor
            $tutor = Auth::user();
            $tutor->increment('active_derivations');

            return response()->json([
                'success' => true,
                'message' => 'Derivación creada exitosamente',
                'data' => $derivation->load(['student', 'tutor'])->toApiArray()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la derivación'
            ], 500);
        }
    }

    /**
     * Mostrar una derivación específica
     */
    public function show($id): JsonResponse
    {
        $derivation = Derivation::with(['student', 'tutor', 'psychologist'])->find($id);

        if (!$derivation) {
            return response()->json([
                'success' => false,
                'message' => 'Derivación no encontrada'
            ], 404);
        }

        // Verificar permisos
        $user = Auth::user();
        if (!$user->isAdmin() && !$user->isSuperAdmin() && 
            $derivation->tutor_id !== $user->id && 
            $derivation->psychologist_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $derivation->toApiArray()
        ]);
    }

    /**
     * Asignar psicólogo a una derivación (Solo admin/super_admin)
     */
    public function assignPsychologist(Request $request, $id): JsonResponse
    {
        // Solo admin/super_admin pueden asignar psicólogos
        if (!Auth::user()->isAdmin() && !Auth::user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'psychologist_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $derivation = Derivation::find($id);
        if (!$derivation) {
            return response()->json([
                'success' => false,
                'message' => 'Derivación no encontrada'
            ], 404);
        }

        // Verificar que el psicólogo existe y es psicólogo
        $psychologist = User::find($request->psychologist_id);
        if (!$psychologist || !$psychologist->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'El psicólogo seleccionado no es válido.'
            ], 422);
        }

        try {
            $derivation->assignPsychologist($request->psychologist_id);

            return response()->json([
                'success' => true,
                'message' => 'Psicólogo asignado exitosamente',
                'data' => $derivation->fresh(['student', 'tutor', 'psychologist'])->toApiArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al asignar psicólogo'
            ], 500);
        }
    }

    /**
     * Actualizar estado de derivación
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,assigned,in_progress,completed,cancelled',
            'psychologist_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $derivation = Derivation::find($id);
        if (!$derivation) {
            return response()->json([
                'success' => false,
                'message' => 'Derivación no encontrada'
            ], 404);
        }

        // Verificar permisos según el estado
        $user = Auth::user();
        if ($request->status === 'in_progress' || $request->status === 'completed') {
            // Solo el psicólogo asignado puede cambiar a estos estados
            if ($derivation->psychologist_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo el psicólogo asignado puede actualizar este estado.'
                ], 403);
            }
        } elseif ($request->status === 'cancelled') {
            // Tutor, psicólogo asignado o admin pueden cancelar
            if (!$user->isAdmin() && !$user->isSuperAdmin() && 
                $derivation->tutor_id !== $user->id && 
                $derivation->psychologist_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para cancelar esta derivación.'
                ], 403);
            }
        }

        try {
            $updateData = ['status' => $request->status];
            
            if ($request->has('psychologist_notes')) {
                $updateData['psychologist_notes'] = $request->psychologist_notes;
            }

            // Actualizar timestamps según el estado
            switch ($request->status) {
                case 'in_progress':
                    $updateData['started_at'] = now();
                    break;
                case 'completed':
                    $updateData['completed_at'] = now();
                    // Decrementar derivaciones activas del tutor
                    $derivation->tutor->decrement('active_derivations');
                    break;
                case 'cancelled':
                    // Decrementar derivaciones activas del tutor si no estaba ya cancelada/completada
                    if (in_array($derivation->status, ['pending', 'assigned', 'in_progress'])) {
                        $derivation->tutor->decrement('active_derivations');
                    }
                    break;
            }

            $derivation->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado exitosamente',
                'data' => $derivation->fresh(['student', 'tutor', 'psychologist'])->toApiArray()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado'
            ], 500);
        }
    }

    /**
     * Obtener derivaciones pendientes (Para admin/psicólogos)
     */
    public function pending(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && !$user->isSuperAdmin() && !$user->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        try {
            $derivations = Derivation::pending()
                ->with(['student', 'tutor'])
                ->orderBy('urgency', 'desc')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $derivations->map(function ($derivation) {
                    return $derivation->toApiArray();
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener derivaciones pendientes'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de derivaciones
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && !$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado.'
            ], 403);
        }

        try {
            $stats = [
                'total' => Derivation::count(),
                'pending' => Derivation::where('status', 'pending')->count(),
                'assigned' => Derivation::where('status', 'assigned')->count(),
                'in_progress' => Derivation::where('status', 'in_progress')->count(),
                'completed' => Derivation::where('status', 'completed')->count(),
                'cancelled' => Derivation::where('status', 'cancelled')->count(),
                'by_urgency' => [
                    'critical' => Derivation::where('urgency', 'critical')->count(),
                    'high' => Derivation::where('urgency', 'high')->count(),
                    'medium' => Derivation::where('urgency', 'medium')->count(),
                    'low' => Derivation::where('urgency', 'low')->count(),
                ],
                'monthly' => Derivation::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count')
                    ->groupBy('year', 'month')
                    ->orderBy('year', 'desc')
                    ->orderBy('month', 'desc')
                    ->limit(12)
                    ->get(),
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


