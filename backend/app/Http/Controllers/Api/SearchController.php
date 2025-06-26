<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cita;
use App\Models\User;
use App\Models\PsychologicalSession;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    /**
     * Buscar psicólogos disponibles
     */
    public function searchPsychologists(Request $request): JsonResponse
    {
        try {
            $query = User::where('role', 'psychologist')
                ->where('active', true)
                ->where('verified', true);

            // Filtro por especialidad
            if ($request->has('specialization') && $request->specialization) {
                $query->where('specialization', 'like', '%' . $request->specialization . '%');
            }

            // Filtro por nombre
            if ($request->has('name') && $request->name) {
                $query->where('name', 'like', '%' . $request->name . '%');
            }

            // Filtro por disponibilidad en fecha específica
            if ($request->has('date') && $request->date) {
                $date = $request->date;
                $query->whereDoesntHave('psychologistCitas', function($q) use ($date) {
                    $q->where('fecha', $date)
                      ->where('estado', '!=', 'cancelada');
                });
            }

            $perPage = $request->get('per_page', 15);
            $psychologists = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $psychologists->items(),
                'pagination' => [
                    'current_page' => $psychologists->currentPage(),
                    'last_page' => $psychologists->lastPage(),
                    'per_page' => $psychologists->perPage(),
                    'total' => $psychologists->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar citas con filtros
     */
    public function searchAppointments(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $query = Cita::with(['student', 'psychologist']);

            // Filtrar por rol del usuario
            if ($user->role === 'student') {
                $query->where('student_id', $user->id);
            } elseif ($user->role === 'psychologist') {
                $query->where('psychologist_id', $user->id);
            }

            // Filtros adicionales
            if ($request->has('date_from') && $request->date_from) {
                $query->where('fecha', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('fecha', '<=', $request->date_to);
            }

            if ($request->has('estado') && $request->estado) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('psychologist_id') && $request->psychologist_id) {
                $query->where('psychologist_id', $request->psychologist_id);
            }

            if ($request->has('student_id') && $request->student_id) {
                $query->where('student_id', $request->student_id);
            }

            $perPage = $request->get('per_page', 15);
            $appointments = $query->orderBy('fecha', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $appointments->items(),
                'pagination' => [
                    'current_page' => $appointments->currentPage(),
                    'last_page' => $appointments->lastPage(),
                    'per_page' => $appointments->perPage(),
                    'total' => $appointments->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar sesiones psicológicas
     */
    public function searchSessions(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $query = PsychologicalSession::with(['patient', 'psychologist']);

            // Filtrar por rol del usuario
            if ($user->role === 'student') {
                $query->where('patient_id', $user->id);
            } elseif ($user->role === 'psychologist') {
                $query->where('psychologist_id', $user->id);
            }

            // Filtros adicionales
            if ($request->has('date_from') && $request->date_from) {
                $query->where('fecha', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('fecha', '<=', $request->date_to);
            }

            if ($request->has('estado') && $request->estado) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('tipo_sesion') && $request->tipo_sesion) {
                $query->where('tipo_sesion', 'like', '%' . $request->tipo_sesion . '%');
            }

            $perPage = $request->get('per_page', 15);
            $sessions = $query->orderBy('fecha', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $sessions->items(),
                'pagination' => [
                    'current_page' => $sessions->currentPage(),
                    'last_page' => $sessions->lastPage(),
                    'per_page' => $sessions->perPage(),
                    'total' => $sessions->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Búsqueda general en el sistema
     */
    public function globalSearch(Request $request): JsonResponse
    {
        try {
            $search = $request->get('q');
            
            if (!$search || strlen($search) < 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'El término de búsqueda debe tener al menos 3 caracteres'
                ], 400);
            }

            $user = auth()->user();
            $results = [];

            // Buscar en citas
            $appointmentsQuery = Cita::with(['student', 'psychologist']);
            if ($user->role === 'student') {
                $appointmentsQuery->where('student_id', $user->id);
            } elseif ($user->role === 'psychologist') {
                $appointmentsQuery->where('psychologist_id', $user->id);
            }

            $appointments = $appointmentsQuery->where(function($q) use ($search) {
                $q->where('motivo_consulta', 'like', '%' . $search . '%')
                  ->orWhere('notas', 'like', '%' . $search . '%');
            })->limit(5)->get();

            $results['appointments'] = $appointments;

            // Buscar en usuarios (solo para super admin)
            if ($user->role === 'super_admin') {
                $users = User::where(function($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%')
                      ->orWhere('specialization', 'like', '%' . $search . '%');
                })->limit(5)->get();

                $results['users'] = $users;
            }

            return response()->json([
                'success' => true,
                'data' => $results
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda: ' . $e->getMessage()
            ], 500);
        }
    }
} 