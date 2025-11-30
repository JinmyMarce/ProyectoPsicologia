<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\Cita;
use App\Models\PsychologicalSession;
use App\Models\Derivation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Obtener mensajes recibidos
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Message::where('recipient_id', $user->id)
                           ->with([
                               'sender' => function($query) {
                                   $query->select('id', 'name', 'email');
                               },
                               'recipient' => function($query) {
                                   $query->select('id', 'name', 'email');
                               }
                           ]);

            // Filtros
            if ($request->has('read') && $request->read !== null) {
                $query->where('read', $request->read);
            }

            if ($request->has('type') && $request->type) {
                $query->where('type', $request->type);
            }

            if ($request->has('priority') && $request->priority) {
                $query->where('priority', $request->priority);
            }

            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('subject', 'like', '%' . $request->search . '%')
                      ->orWhere('content', 'like', '%' . $request->search . '%')
                      ->orWhereHas('sender', function($senderQuery) use ($request) {
                          $senderQuery->where('name', 'like', '%' . $request->search . '%');
                      });
                });
            }

            // Ordenar por fecha de creación (más recientes primero)
            $query->orderBy('created_at', 'desc');

            // Paginación
            $perPage = $request->get('per_page', 15);
            $messages = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $messages->items(),
                'pagination' => [
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener mensajes'
            ], 500);
        }
    }

    /**
     * Obtener mensajes enviados
     */
    public function sent(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = Message::where('sender_id', $user->id)
                           ->with([
                               'sender' => function($query) {
                                   $query->select('id', 'name', 'email');
                               },
                               'recipient' => function($query) {
                                   $query->select('id', 'name', 'email');
                               }
                           ]);

            // Filtros
            if ($request->has('type') && $request->type) {
                $query->where('type', $request->type);
            }

            if ($request->has('priority') && $request->priority) {
                $query->where('priority', $request->priority);
            }

            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('subject', 'like', '%' . $request->search . '%')
                      ->orWhere('content', 'like', '%' . $request->search . '%')
                      ->orWhereHas('recipient', function($recipientQuery) use ($request) {
                          $recipientQuery->where('name', 'like', '%' . $request->search . '%');
                      });
                });
            }

            // Ordenar por fecha de creación
            $query->orderBy('created_at', 'desc');

            // Paginación
            $perPage = $request->get('per_page', 15);
            $messages = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $messages->items(),
                'pagination' => [
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener mensajes enviados'
            ], 500);
        }
    }

    /**
     * Obtener un mensaje específico
     */
    public function show($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $message = Message::where('id', $id)
                             ->where(function($query) use ($user) {
                                 $query->where('sender_id', $user->id)
                                       ->orWhere('recipient_id', $user->id);
                             })
                             ->with([
                                 'sender' => function($query) {
                                     $query->select('id', 'name', 'email');
                                 },
                                 'recipient' => function($query) {
                                     $query->select('id', 'name', 'email');
                                 }
                             ])
                             ->first();

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mensaje no encontrado'
                ], 404);
            }

            // Marcar como leído si el usuario es el destinatario
            if ($message->recipient_id === $user->id && !$message->read) {
                $message->markAsRead();
                // Recargar el mensaje para obtener el read_at actualizado
                $message->refresh();
                $message->load([
                    'sender' => function($query) {
                        $query->select('id', 'name', 'email');
                    },
                    'recipient' => function($query) {
                        $query->select('id', 'name', 'email');
                    }
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $message
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener mensaje: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el mensaje'
            ], 500);
        }
    }

    /**
     * Enviar un mensaje
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'recipient_id' => 'required|exists:users,id',
                'subject' => 'required|string|max:255',
                'content' => 'required|string',
                'priority' => 'sometimes|in:low,normal,high,urgent',
                'type' => 'sometimes|in:general,appointment,session,system',
                'related_id' => 'sometimes|integer',
                'related_type' => 'sometimes|string',
                'attachments' => 'sometimes|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Verificar que el destinatario existe y está activo
            $recipient = User::where('id', $request->recipient_id)
                            ->where('active', true)
                            ->first();

            if (!$recipient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destinatario no encontrado o inactivo'
                ], 404);
            }

            // VALIDACIONES DE RESTRICCIONES POR ROL
            
            // Admin/Super Admin: Puede comunicarse con cualquiera
            if (in_array($user->role, ['admin', 'super_admin'])) {
                // Los admins pueden comunicarse con cualquier usuario
            }
            // Estudiante: Solo puede enviar mensajes a su psicólogo asignado
            elseif ($user->role === 'student') {
                // Verificar que el destinatario es un psicólogo
                if ($recipient->role !== 'psychologist') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Solo puedes enviar mensajes a tu psicólogo asignado'
                    ], 403);
                }

                // Verificar que el estudiante tiene al menos una cita o sesión con este psicólogo
                $hasRelationship = Cita::where('student_id', $user->id)
                    ->where('psychologist_id', $recipient->id)
                    ->where('estado', '!=', 'cancelada')
                    ->exists();

                if (!$hasRelationship) {
                    $hasSessionRelationship = PsychologicalSession::where('patient_id', $user->id)
                        ->where('psychologist_id', $recipient->id)
                        ->exists();

                    if (!$hasSessionRelationship) {
                        $hasDerivationRelationship = Derivation::where('student_id', $user->id)
                            ->where('psychologist_id', $recipient->id)
                            ->where('status', '!=', 'cancelled')
                            ->exists();

                        if (!$hasDerivationRelationship) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Solo puedes enviar mensajes a tu psicólogo asignado. No tienes citas, sesiones o derivaciones activas con este psicólogo.'
                            ], 403);
                        }
                    }
                }
            }
            // Psicólogo: Solo puede enviar mensajes a sus pacientes asignados
            elseif ($user->role === 'psychologist') {
                // Verificar que el destinatario es un estudiante
                if ($recipient->role !== 'student') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Solo puedes enviar mensajes a tus pacientes asignados'
                    ], 403);
                }

                // Verificar que el psicólogo tiene al menos una cita o sesión con este estudiante
                $hasRelationship = Cita::where('psychologist_id', $user->id)
                    ->where('student_id', $recipient->id)
                    ->where('estado', '!=', 'cancelada')
                    ->exists();

                if (!$hasRelationship) {
                    $hasSessionRelationship = PsychologicalSession::where('psychologist_id', $user->id)
                        ->where('patient_id', $recipient->id)
                        ->exists();

                    if (!$hasSessionRelationship) {
                        $hasDerivationRelationship = Derivation::where('psychologist_id', $user->id)
                            ->where('student_id', $recipient->id)
                            ->where('status', '!=', 'cancelled')
                            ->exists();

                        if (!$hasDerivationRelationship) {
                            return response()->json([
                                'success' => false,
                                'message' => 'Solo puedes enviar mensajes a tus pacientes asignados. No tienes citas, sesiones o derivaciones activas con este estudiante.'
                            ], 403);
                        }
                    }
                }
            }
            // Otros roles no tienen permiso para enviar mensajes
            else {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para enviar mensajes'
                ], 403);
            }

            // Crear el mensaje
            $message = Message::create([
                'sender_id' => $user->id,
                'recipient_id' => $request->recipient_id,
                'subject' => $request->subject,
                'content' => $request->content,
                'priority' => $request->priority ?? 'normal',
                'type' => $request->type ?? 'general',
                'related_id' => $request->related_id,
                'related_type' => $request->related_type,
                'attachments' => $request->attachments,
            ]);

            $message->load(['sender', 'recipient']);

            return response()->json([
                'success' => true,
                'message' => 'Mensaje enviado exitosamente',
                'data' => $message
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar el mensaje'
            ], 500);
        }
    }

    /**
     * Marcar mensaje como leído
     */
    public function markAsRead($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $message = Message::where('id', $id)
                             ->where('recipient_id', $user->id)
                             ->first();

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mensaje no encontrado'
                ], 404);
            }

            $message->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Mensaje marcado como leído'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar mensaje como leído'
            ], 500);
        }
    }

    /**
     * Marcar todos los mensajes como leídos
     */
    public function markAllAsRead(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            Message::where('recipient_id', $user->id)
                   ->where('read', false)
                   ->update([
                       'read' => true,
                       'read_at' => now()
                   ]);

            return response()->json([
                'success' => true,
                'message' => 'Todos los mensajes marcados como leídos'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar mensajes como leídos'
            ], 500);
        }
    }

    /**
     * Eliminar un mensaje
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = Auth::user();
            $message = Message::where('id', $id)
                             ->where(function($query) use ($user) {
                                 $query->where('sender_id', $user->id)
                                       ->orWhere('recipient_id', $user->id);
                             })
                             ->first();

            if (!$message) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mensaje no encontrado'
                ], 404);
            }

            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Mensaje eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el mensaje'
            ], 500);
        }
    }

    /**
     * Obtener conversación con un usuario específico
     */
    public function conversation($userId, Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Verificar que el otro usuario existe
            $otherUser = User::find($userId);
            if (!$otherUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // VALIDACIONES DE RESTRICCIONES POR ROL
            // Admin/Super Admin: Puede ver cualquier conversación
            if (!in_array($user->role, ['admin', 'super_admin'])) {
                // Estudiante: Solo puede ver conversaciones con su psicólogo
                if ($user->role === 'student') {
                    if ($otherUser->role !== 'psychologist') {
                        return response()->json([
                            'success' => false,
                            'message' => 'Solo puedes ver conversaciones con tu psicólogo asignado'
                        ], 403);
                    }

                    // Verificar relación
                    $hasRelationship = Cita::where('student_id', $user->id)
                        ->where('psychologist_id', $otherUser->id)
                        ->where('estado', '!=', 'cancelada')
                        ->exists();

                    if (!$hasRelationship) {
                        $hasRelationship = PsychologicalSession::where('patient_id', $user->id)
                            ->where('psychologist_id', $otherUser->id)
                            ->exists();

                        if (!$hasRelationship) {
                            $hasRelationship = Derivation::where('student_id', $user->id)
                                ->where('psychologist_id', $otherUser->id)
                                ->where('status', '!=', 'cancelled')
                                ->exists();

                            if (!$hasRelationship) {
                                return response()->json([
                                    'success' => false,
                                    'message' => 'No tienes una relación activa con este psicólogo'
                                ], 403);
                            }
                        }
                    }
                }
                // Psicólogo: Solo puede ver conversaciones con sus pacientes
                elseif ($user->role === 'psychologist') {
                    if ($otherUser->role !== 'student') {
                        return response()->json([
                            'success' => false,
                            'message' => 'Solo puedes ver conversaciones con tus pacientes asignados'
                        ], 403);
                    }

                    // Verificar relación
                    $hasRelationship = Cita::where('psychologist_id', $user->id)
                        ->where('student_id', $otherUser->id)
                        ->where('estado', '!=', 'cancelada')
                        ->exists();

                    if (!$hasRelationship) {
                        $hasRelationship = PsychologicalSession::where('psychologist_id', $user->id)
                            ->where('patient_id', $otherUser->id)
                            ->exists();

                        if (!$hasRelationship) {
                            $hasRelationship = Derivation::where('psychologist_id', $user->id)
                                ->where('student_id', $otherUser->id)
                                ->where('status', '!=', 'cancelled')
                                ->exists();

                            if (!$hasRelationship) {
                                return response()->json([
                                    'success' => false,
                                    'message' => 'No tienes una relación activa con este estudiante'
                                ], 403);
                            }
                        }
                    }
                }
                // Otros roles no tienen permiso
                else {
                    return response()->json([
                        'success' => false,
                        'message' => 'No tienes permisos para ver esta conversación'
                    ], 403);
                }
            }

            $query = Message::conversation($user->id, $userId)
                           ->with(['sender', 'recipient'])
                           ->orderBy('created_at', 'asc');

            // Paginación
            $perPage = $request->get('per_page', 50);
            $messages = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $messages->items(),
                'pagination' => [
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la conversación'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de mensajes
     */
    public function stats(): JsonResponse
    {
        try {
            Log::info('MessageController::stats - Iniciando método');
            
            $user = Auth::user();
            Log::info('MessageController::stats - Usuario autenticado', [
                'user_id' => $user ? $user->id : null,
                'user_email' => $user ? $user->email : null,
                'auth_check' => Auth::check()
            ]);
            
            if (!$user) {
                Log::warning('MessageController::stats - Usuario no autenticado');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            Log::info('MessageController::stats - Llamando a Message::getStats', ['user_id' => $user->id]);
            $stats = Message::getStats($user->id);
            Log::info('MessageController::stats - Stats obtenidos', ['stats' => $stats]);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('MessageController::stats - Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener usuarios para enviar mensajes
     */
    public function getRecipients(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Admin/Super Admin: Puede ver todos los usuarios
            if (in_array($user->role, ['admin', 'super_admin'])) {
                $query = User::where('id', '!=', $user->id)
                            ->where('active', true);

                // Búsqueda por nombre o email
                if ($request->has('search') && $request->search) {
                    $query->where(function($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%')
                          ->orWhere('email', 'like', '%' . $request->search . '%')
                          ->orWhere('dni', 'like', '%' . $request->search . '%');
                    });
                }

                $recipients = $query->select('id', 'name', 'email', 'dni', 'role')
                                   ->orderBy('name')
                                   ->limit(50)
                                   ->get();

                return response()->json([
                    'success' => true,
                    'data' => $recipients
                ]);
            }
            // Psicólogo: Solo puede ver sus pacientes asignados
            elseif ($user->role === 'psychologist') {
                // Obtener IDs de estudiantes que tienen citas, sesiones o derivaciones con este psicólogo
                $studentIdsFromCitas = Cita::where('psychologist_id', $user->id)
                    ->where('estado', '!=', 'cancelada')
                    ->distinct()
                    ->pluck('student_id');

                $studentIdsFromSessions = PsychologicalSession::where('psychologist_id', $user->id)
                    ->distinct()
                    ->pluck('patient_id');

                $studentIdsFromDerivations = Derivation::where('psychologist_id', $user->id)
                    ->where('status', '!=', 'cancelled')
                    ->distinct()
                    ->pluck('student_id');

                $allStudentIds = $studentIdsFromCitas
                    ->merge($studentIdsFromSessions)
                    ->merge($studentIdsFromDerivations)
                    ->unique();

                $query = User::whereIn('id', $allStudentIds)
                            ->where('role', 'student')
                            ->where('active', true);

                // Búsqueda por nombre o email
                if ($request->has('search') && $request->search) {
                    $query->where(function($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%')
                          ->orWhere('email', 'like', '%' . $request->search . '%')
                          ->orWhere('dni', 'like', '%' . $request->search . '%');
                    });
                }

                $recipients = $query->select('id', 'name', 'email', 'dni')
                                   ->orderBy('name')
                                   ->limit(50)
                                   ->get();

                return response()->json([
                    'success' => true,
                    'data' => $recipients
                ]);
            }
            // Estudiante: Solo puede ver su psicólogo asignado
            elseif ($user->role === 'student') {
                // Obtener el psicólogo de las citas, sesiones o derivaciones más recientes
                $psychologistIdFromCita = Cita::where('student_id', $user->id)
                    ->where('estado', '!=', 'cancelada')
                    ->orderBy('created_at', 'desc')
                    ->value('psychologist_id');

                $psychologistIdFromSession = PsychologicalSession::where('patient_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->value('psychologist_id');

                $psychologistIdFromDerivation = Derivation::where('student_id', $user->id)
                    ->where('status', '!=', 'cancelled')
                    ->orderBy('created_at', 'desc')
                    ->value('psychologist_id');

                $psychologistIds = collect([
                    $psychologistIdFromCita,
                    $psychologistIdFromSession,
                    $psychologistIdFromDerivation
                ])->filter()->unique();

                if ($psychologistIds->isEmpty()) {
                    return response()->json([
                        'success' => true,
                        'data' => []
                    ]);
                }

                $query = User::whereIn('id', $psychologistIds)
                            ->where('role', 'psychologist')
                            ->where('active', true);

                // Búsqueda por nombre o email
                if ($request->has('search') && $request->search) {
                    $query->where(function($q) use ($request) {
                        $q->where('name', 'like', '%' . $request->search . '%')
                          ->orWhere('email', 'like', '%' . $request->search . '%');
                    });
                }

                $recipients = $query->select('id', 'name', 'email')
                                   ->orderBy('name')
                                   ->get();

                return response()->json([
                    'success' => true,
                    'data' => $recipients
                ]);
            }
            // Otros roles no tienen permiso
            else {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para realizar esta acción'
                ], 403);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener destinatarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener mi psicólogo asignado (solo para estudiantes)
     */
    public function getMyPsychologist(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo los estudiantes pueden usar este endpoint'
                ], 403);
            }

            // Obtener el psicólogo de la cita más reciente
            $latestCita = Cita::where('student_id', $user->id)
                ->where('estado', '!=', 'cancelada')
                ->orderBy('created_at', 'desc')
                ->with('psychologist')
                ->first();

            if ($latestCita && $latestCita->psychologist) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $latestCita->psychologist->id,
                        'name' => $latestCita->psychologist->name,
                        'email' => $latestCita->psychologist->email
                    ]
                ]);
            }

            // Si no hay cita, buscar en sesiones
            $latestSession = PsychologicalSession::where('patient_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->with('psychologist')
                ->first();

            if ($latestSession && $latestSession->psychologist) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $latestSession->psychologist->id,
                        'name' => $latestSession->psychologist->name,
                        'email' => $latestSession->psychologist->email
                    ]
                ]);
            }

            // Si no hay sesión, buscar en derivaciones
            $latestDerivation = Derivation::where('student_id', $user->id)
                ->where('status', '!=', 'cancelled')
                ->whereNotNull('psychologist_id')
                ->orderBy('created_at', 'desc')
                ->with('psychologist')
                ->first();

            if ($latestDerivation && $latestDerivation->psychologist) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $latestDerivation->psychologist->id,
                        'name' => $latestDerivation->psychologist->name,
                        'email' => $latestDerivation->psychologist->email
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No tienes un psicólogo asignado aún'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tu psicólogo asignado: ' . $e->getMessage()
            ], 500);
        }
    }
} 