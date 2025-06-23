<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PsychologicalSession;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = User::where('role', 'student')
                        ->where('email', 'like', '%@instituto.edu.pe');

            // Filtros
            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%')
                      ->orWhere('dni', 'like', '%' . $request->search . '%');
                });
            }

            if ($request->has('dni') && $request->dni) {
                $query->where('dni', 'like', '%' . $request->dni . '%');
            }

            if ($request->has('activo') && $request->activo !== '') {
                $query->where('active', $request->activo);
            }

            // Paginación
            $perPage = $request->get('per_page', 10);
            $patients = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $patients->items(),
                'pagination' => [
                    'current_page' => $patients->currentPage(),
                    'last_page' => $patients->lastPage(),
                    'per_page' => $patients->perPage(),
                    'total' => $patients->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener pacientes: ' . $e->getMessage()
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
                'dni' => 'required|string|max:20|unique:users,dni',
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email|regex:/^[^@]+@instituto\.edu\.pe$/',
                'password' => 'required|string|min:6'
            ], [
                'email.regex' => 'El correo debe ser institucional (@instituto.edu.pe)',
                'dni.unique' => 'El DNI ya está registrado',
                'email.unique' => 'El correo ya está registrado'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $patient = User::create([
                'dni' => $request->dni,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'student',
                'active' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Paciente registrado exitosamente',
                'data' => $patient
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar paciente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $patient)
    {
        try {
            if ($patient->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no es un paciente'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $patient
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener paciente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $patient)
    {
        try {
            if ($patient->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no es un paciente'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'dni' => 'sometimes|string|max:20|unique:users,dni,' . $patient->id,
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $patient->id . '|regex:/^[^@]+@instituto\.edu\.pe$/'
            ], [
                'email.regex' => 'El correo debe ser institucional (@instituto.edu.pe)',
                'dni.unique' => 'El DNI ya está registrado',
                'email.unique' => 'El correo ya está registrado'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $patient->update($request->only(['dni', 'name', 'email']));

            return response()->json([
                'success' => true,
                'message' => 'Paciente actualizado exitosamente',
                'data' => $patient
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar paciente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $patient)
    {
        try {
            if ($patient->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no es un paciente'
                ], 404);
            }

            $patient->delete();

            return response()->json([
                'success' => true,
                'message' => 'Paciente eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar paciente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar paciente por DNI
     */
    public function searchByDni($dni)
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
     * Obtener sesiones de un paciente
     */
    public function getSessions(User $patient)
    {
        try {
            if ($patient->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no es un paciente'
                ], 404);
            }

            $sessions = PsychologicalSession::where('patient_id', $patient->id)
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
     * Obtener estadísticas de pacientes
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_patients' => User::where('role', 'student')->count(),
                'active_patients' => User::where('role', 'student')->where('active', true)->count(),
                'inactive_patients' => User::where('role', 'student')->where('active', false)->count(),
                'by_estado_civil' => [
                    'soltero' => 0,
                    'casado' => 0,
                    'divorciado' => 0,
                    'viudo' => 0
                ],
                'by_ocupacion' => [
                    'estudiante' => User::where('role', 'student')->count(),
                    'trabajador' => 0,
                    'docente' => 0
                ],
                'by_sexo' => [
                    'masculino' => 0,
                    'femenino' => 0
                ]
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
