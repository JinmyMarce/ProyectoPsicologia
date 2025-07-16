<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
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
                           ->with(['sender']);

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
                           ->with(['recipient']);

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
                             ->with(['sender', 'recipient'])
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
            }

            return response()->json([
                'success' => true,
                'data' => $message
            ]);

        } catch (\Exception $e) {
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
     * Obtener usuarios para enviar mensajes (para psicólogos)
     */
    public function getRecipients(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Solo psicólogos pueden obtener lista de destinatarios
            if ($user->role !== 'psychologist') {
                return response()->json([
                    'success' => false,
                    'message' => 'No tienes permisos para realizar esta acción'
                ], 403);
            }

            $query = User::where('role', 'student')
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
                               ->limit(20)
                               ->get();

            return response()->json([
                'success' => true,
                'data' => $recipients
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener destinatarios'
            ], 500);
        }
    }
} 