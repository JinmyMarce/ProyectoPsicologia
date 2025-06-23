<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PsychologicalSession;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class PsychologicalSessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = PsychologicalSession::with(['patient', 'psychologist']);

            // Filtros
            if ($request->has('patient_id') && $request->patient_id) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('psychologist_id') && $request->psychologist_id) {
                $query->where('psychologist_id', $request->psychologist_id);
            }

            if ($request->has('estado') && $request->estado) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->where('fecha_sesion', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->where('fecha_sesion', '<=', $request->date_to . ' 23:59:59');
            }

            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->whereHas('patient', function($patientQuery) use ($request) {
                        $patientQuery->where('name', 'like', '%' . $request->search . '%')
                                    ->orWhere('dni', 'like', '%' . $request->search . '%');
                    })
                    ->orWhere('temas_tratados', 'like', '%' . $request->search . '%')
                    ->orWhere('notas', 'like', '%' . $request->search . '%');
                });
            }

            // Ordenar por fecha
            $query->orderBy('fecha_sesion', 'desc');

            // Paginación
            $perPage = $request->get('per_page', 10);
            $sessions = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $sessions->items(),
                'pagination' => [
                    'current_page' => $sessions->currentPage(),
                    'last_page' => $sessions->lastPage(),
                    'per_page' => $sessions->perPage(),
                    'total' => $sessions->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sesiones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_id' => 'required|exists:users,id',
                'psychologist_id' => 'required|exists:users,id',
                'fecha_sesion' => 'required|date',
                'temas_tratados' => 'nullable|string',
                'notas' => 'nullable|string',
                'estado' => 'required|in:Programada,Realizada,Cancelada',
                'duracion_minutos' => 'nullable|integer|min:15|max:300',
                'tipo_sesion' => 'nullable|string|max:100',
                'objetivos' => 'nullable|string',
                'conclusiones' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar que el paciente sea un estudiante
            $patient = User::find($request->patient_id);
            if (!$patient || $patient->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'El paciente debe ser un estudiante'
                ], 422);
            }

            // Verificar que el psicólogo sea un psicólogo
            $psychologist = User::find($request->psychologist_id);
            if (!$psychologist || $psychologist->role !== 'psychologist') {
                return response()->json([
                    'success' => false,
                    'message' => 'El psicólogo debe tener rol de psicólogo'
                ], 422);
            }

            $session = PsychologicalSession::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Sesión registrada exitosamente',
                'data' => $session->load(['patient', 'psychologist'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(PsychologicalSession $psychologicalSession)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $psychologicalSession->load(['patient', 'psychologist'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PsychologicalSession $psychologicalSession)
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_id' => 'sometimes|exists:users,id',
                'psychologist_id' => 'sometimes|exists:users,id',
                'fecha_sesion' => 'sometimes|date',
                'temas_tratados' => 'nullable|string',
                'notas' => 'nullable|string',
                'estado' => 'sometimes|in:Programada,Realizada,Cancelada',
                'duracion_minutos' => 'nullable|integer|min:15|max:300',
                'tipo_sesion' => 'nullable|string|max:100',
                'objetivos' => 'nullable|string',
                'conclusiones' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $psychologicalSession->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Sesión actualizada exitosamente',
                'data' => $psychologicalSession->load(['patient', 'psychologist'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PsychologicalSession $psychologicalSession)
    {
        try {
            $psychologicalSession->delete();

            return response()->json([
                'success' => true,
                'message' => 'Sesión eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener sesiones por paciente
     */
    public function getSessionsByPatient($patientId)
    {
        try {
            $sessions = PsychologicalSession::where('patient_id', $patientId)
                                          ->with(['psychologist'])
                                          ->orderBy('fecha_sesion', 'desc')
                                          ->get();

            return response()->json([
                'success' => true,
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sesiones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener sesiones por psicólogo
     */
    public function getSessionsByPsychologist($psychologistId)
    {
        try {
            $sessions = PsychologicalSession::where('psychologist_id', $psychologistId)
                                          ->with(['patient'])
                                          ->orderBy('fecha_sesion', 'desc')
                                          ->get();

            return response()->json([
                'success' => true,
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sesiones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener sesiones por fecha
     */
    public function getSessionsByDate($date)
    {
        try {
            $sessions = PsychologicalSession::whereDate('fecha_sesion', $date)
                                          ->with(['patient', 'psychologist'])
                                          ->orderBy('fecha_sesion', 'asc')
                                          ->get();

            return response()->json([
                'success' => true,
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener sesiones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar paciente por DNI
     */
    public function searchPatientByDni($dni)
    {
        try {
            $patient = User::where('role', 'student')
                          ->where('dni', $dni)
                          ->first();

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Paciente no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $patient
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar paciente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de sesiones
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_sessions' => PsychologicalSession::count(),
                'programadas' => PsychologicalSession::where('estado', 'Programada')->count(),
                'realizadas' => PsychologicalSession::where('estado', 'Realizada')->count(),
                'canceladas' => PsychologicalSession::where('estado', 'Cancelada')->count(),
                'futuras' => PsychologicalSession::where('fecha_sesion', '>', now())->count(),
                'pasadas' => PsychologicalSession::where('fecha_sesion', '<', now())->count(),
                'by_psychologist' => User::where('role', 'psychologist')
                                        ->withCount('psychologicalSessions')
                                        ->get()
                                        ->map(function($psychologist) {
                                            return [
                                                'id' => $psychologist->id,
                                                'name' => $psychologist->name,
                                                'total_sessions' => $psychologist->psychological_sessions_count
                                            ];
                                        })
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }
}
