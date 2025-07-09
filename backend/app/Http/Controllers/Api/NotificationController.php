<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::where('user_id', auth()->user()->id);

        // Filtros
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('read') && $request->read !== null) {
            $query->where('read', $request->read);
        }

        // Paginación
        $perPage = $request->get('per_page', 15);
        $notifications = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ]
        ]);
    }

    public function show($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->user()->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notificación no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $notification
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->user()->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notificación no encontrada'
            ], 404);
        }

        $notification->update(['read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notificación marcada como leída'
        ]);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->user()->id)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Todas las notificaciones marcadas como leídas'
        ]);
    }

    public function destroy($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->user()->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notificación no encontrada'
            ], 404);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notificación eliminada exitosamente'
        ]);
    }

    public function destroyAll()
    {
        Notification::where('user_id', auth()->user()->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Todas las notificaciones eliminadas'
        ]);
    }

    public function store(Request $request)
    {
        // Solo super admins y admins pueden crear notificaciones
        if (!auth()->user()->isSuperAdmin() && !auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para crear notificaciones'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:appointment,reminder,status,system',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $notification = Notification::create([
            'user_id' => $request->user_id,
            'type' => $request->type,
            'title' => $request->title,
            'message' => $request->message,
            'read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notificación creada exitosamente',
            'data' => $notification
        ], 201);
    }

    public function stats()
    {
        $stats = [
            'total' => Notification::where('user_id', auth()->user()->id)->count(),
            'unread' => Notification::where('user_id', auth()->user()->id)->where('read', false)->count(),
            'read' => Notification::where('user_id', auth()->user()->id)->where('read', true)->count(),
            'by_type' => [
                'appointment' => Notification::where('user_id', auth()->user()->id)->where('type', 'appointment')->count(),
                'reminder' => Notification::where('user_id', auth()->user()->id)->where('type', 'reminder')->count(),
                'status' => Notification::where('user_id', auth()->user()->id)->where('type', 'status')->count(),
                'system' => Notification::where('user_id', auth()->user()->id)->where('type', 'system')->count(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function sendAppointmentReminder($appointmentId)
    {
        // Solo psicólogos pueden enviar recordatorios
        if (!auth()->user()->isPsychologist()) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para enviar recordatorios'
            ], 403);
        }

        // Aquí se implementaría la lógica para enviar recordatorios
        // Por ahora solo simulamos el envío

        return response()->json([
            'success' => true,
            'message' => 'Recordatorio enviado exitosamente'
        ]);
    }

    public function sendAppointmentStatusChange(Request $request, $appointmentId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Aquí se implementaría la lógica para enviar notificaciones de cambio de estado
        // Por ahora solo simulamos el envío

        return response()->json([
            'success' => true,
            'message' => 'Notificación de cambio de estado enviada'
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'appointment_reminders' => 'boolean',
            'status_updates' => 'boolean',
            'system_notifications' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $user->update($request->only([
            'email_notifications',
            'push_notifications',
            'appointment_reminders',
            'status_updates',
            'system_notifications'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Preferencias actualizadas exitosamente'
        ]);
    }

    public function getPreferences()
    {
        $user = auth()->user();
        
        $preferences = [
            'email_notifications' => $user->email_notifications ?? true,
            'sms_notifications' => $user->sms_notifications ?? false,
            'app_notifications' => $user->app_notifications ?? true,
            'appointment_reminders' => $user->appointment_reminders ?? true,
            'status_updates' => $user->status_updates ?? true,
        ];

        return response()->json([
            'success' => true,
            'data' => $preferences
        ]);
    }

    // Enviar notificación de cita aprobada
    public function sendAppointmentApproved($appointmentId)
    {
        try {
            $appointment = \App\Models\Cita::with(['student', 'psychologist'])->find($appointmentId);
            
            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cita no encontrada'
                ], 404);
            }

            // Crear notificación para el estudiante
            $notification = Notification::create([
                'user_id' => $appointment->student_id,
                'type' => 'appointment',
                'title' => 'Cita Aprobada',
                'message' => "Tu cita del {$appointment->fecha} a las {$appointment->hora} ha sido aprobada por el psicólogo. Te esperamos en el consultorio.",
                'read' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notificación de aprobación enviada exitosamente',
                'data' => $notification
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar notificación: ' . $e->getMessage()
            ], 500);
        }
    }

    // Enviar notificación de cita rechazada
    public function sendAppointmentRejected($appointmentId, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $appointment = \App\Models\Cita::with(['student', 'psychologist'])->find($appointmentId);
            
            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cita no encontrada'
                ], 404);
            }

            // Crear notificación para el estudiante
            $notification = Notification::create([
                'user_id' => $appointment->student_id,
                'type' => 'appointment',
                'title' => 'Cita Rechazada',
                'message' => "Tu cita del {$appointment->fecha} a las {$appointment->hora} ha sido rechazada. Razón: {$request->reason}. Por favor, agenda una nueva cita.",
                'read' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Notificación de rechazo enviada exitosamente',
                'data' => $notification
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar notificación: ' . $e->getMessage()
            ], 500);
        }
    }
} 