<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\User;
use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ChatBotController extends Controller
{
    /**
     * Procesar consulta del chatbot
     */
    public function chat(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'message' => 'required|string|max:1000',
                'user_profile' => 'nullable|string|in:estudiante,psicologo,admin,unknown',
                'context' => 'nullable|array'
            ]);

            $message = trim($request->message);
            $userProfile = $request->get('user_profile', 'unknown');
            $context = $request->get('context', []);

            // Procesar mensaje y generar respuesta
            $response = $this->processMessage($message, $userProfile, $context);

            return response()->json([
                'success' => true,
                'message' => 'Respuesta generada exitosamente',
                'data' => $response
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar mensaje del chatbot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener base de conocimiento
     */
    public function getKnowledgeBase(Request $request): JsonResponse
    {
        try {
            $category = $request->get('category', 'all');

            $knowledgeBase = [
                'horarios' => [
                    'title' => 'Horarios de Atención',
                    'content' => [
                        'dias_atencion' => 'Lunes a Viernes',
                        'horario_inicio' => '08:00',
                        'horario_fin' => '14:00',
                        'duracion_sesion' => '45 minutos',
                        'bloques_disponibles' => [
                            '08:00-08:45', '08:45-09:30', '09:30-10:15', '10:15-11:00',
                            '11:00-11:45', '11:45-12:30', '12:30-13:15', '13:15-14:00'
                        ],
                        'limite_agendamiento' => '13:10 del día actual'
                    ]
                ],
                'servicios' => [
                    'title' => 'Servicios Disponibles',
                    'content' => [
                        'consulta_individual' => 'Evaluación diagnóstica y terapia individual',
                        'terapia_grupal' => 'Talleres y grupos de apoyo',
                        'apoyo_academico' => 'Orientación vocacional y manejo de estrés',
                        'emergencias' => 'Protocolo de crisis psicológicas',
                        'costo' => 'Gratuito para estudiantes ISTTA'
                    ]
                ],
                'roles' => [
                    'title' => 'Roles del Sistema',
                    'content' => [
                        'estudiante' => [
                            'descripcion' => 'Puede agendar citas y recibir atención psicológica',
                            'funciones' => ['Agendar citas', 'Ver historial', 'Recibir notificaciones']
                        ],
                        'psicologo' => [
                            'descripcion' => 'Profesional que brinda atención psicológica',
                            'funciones' => ['Aprobar/rechazar citas', 'Agendar directamente', 'Gestionar calendario']
                        ],
                        'admin' => [
                            'descripcion' => 'Gestiona usuarios y configura el sistema',
                            'funciones' => ['Gestión de usuarios', 'Reportes', 'Configuración']
                        ]
                    ]
                ],
                'emergencias' => [
                    'title' => 'Protocolo de Emergencias',
                    'content' => [
                        'lineas_crisis' => [
                            'nacional' => '113',
                            'bomberos' => '116',
                            'policia' => '105'
                        ],
                        'instituto' => [
                            'direccion_academica' => 'Ext. 101',
                            'bienestar' => 'Ext. 102'
                        ],
                        'protocolo' => [
                            'evaluacion_rapida',
                            'contacto_inmediato',
                            'acompanamiento',
                            'seguimiento'
                        ]
                    ]
                ],
                'feriados' => $this->getHolidayInfo()
            ];

            if ($category !== 'all' && isset($knowledgeBase[$category])) {
                $result = [$category => $knowledgeBase[$category]];
            } else {
                $result = $knowledgeBase;
            }

            return response()->json([
                'success' => true,
                'message' => 'Base de conocimiento obtenida exitosamente',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener base de conocimiento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enviar feedback del chatbot
     */
    public function submitFeedback(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'feedback' => 'nullable|string|max:1000',
                'conversation_id' => 'nullable|string',
                'user_profile' => 'nullable|string'
            ]);

            // Aquí se podría guardar en una tabla de feedback
            // Por ahora solo lo registramos como exitoso

            return response()->json([
                'success' => true,
                'message' => 'Feedback enviado exitosamente',
                'data' => [
                    'rating' => $request->rating,
                    'timestamp' => now(),
                    'message' => 'Gracias por tu feedback. Nos ayuda a mejorar el asistente.'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas del chatbot
     */
    public function getStats(Request $request): JsonResponse
    {
        try {
            // Estadísticas básicas del sistema
            $stats = [
                'sistema' => [
                    'usuarios_activos' => User::where('active', true)->count(),
                    'psicologos_disponibles' => User::where('role', 'psychologist')->where('active', true)->count(),
                    'estudiantes_registrados' => User::where('role', 'student')->where('active', true)->count()
                ],
                'citas' => [
                    'total_mes' => Cita::whereYear('fecha', date('Y'))->whereMonth('fecha', date('m'))->count(),
                    'pendientes' => Cita::where('status', 'pendiente')->count(),
                    'confirmadas_hoy' => Cita::where('status', 'confirmada')->whereDate('fecha', today())->count()
                ],
                'feriados' => [
                    'proximos_30_dias' => Holiday::getUpcomingHolidays(30)->count(),
                    'total_año' => Holiday::getHolidaysForYear(date('Y'))->count()
                ],
                'horarios' => [
                    'bloques_disponibles' => 8,
                    'horario_inicio' => '08:00',
                    'horario_fin' => '14:00',
                    'dias_atencion' => 5
                ]
            ];

            return response()->json([
                'success' => true,
                'message' => 'Estadísticas del chatbot obtenidas exitosamente',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesar mensaje del usuario
     */
    private function processMessage(string $message, string $userProfile, array $context): array
    {
        $message = strtolower($message);
        
        // Detectar intención del mensaje
        $intent = $this->detectIntent($message);
        
        // Generar respuesta basada en la intención
        switch ($intent) {
            case 'horarios':
                return $this->getScheduleResponse($userProfile);
            
            case 'feriados':
                return $this->getHolidayResponse($message);
            
            case 'servicios':
                return $this->getServicesResponse($userProfile);
            
            case 'emergencia':
                return $this->getEmergencyResponse();
            
            case 'agendar_cita':
                return $this->getAppointmentResponse($userProfile);
            
            case 'roles':
                return $this->getRolesResponse($userProfile);
            
            case 'saludo':
                return $this->getGreetingResponse($userProfile);
            
            default:
                return $this->getDefaultResponse($message, $userProfile);
        }
    }

    /**
     * Detectar intención del mensaje
     */
    private function detectIntent(string $message): string
    {
        $intentPatterns = [
            'horarios' => ['horario', 'hora', 'tiempo', 'cuando', 'disponibilidad', 'calendario'],
            'feriados' => ['feriado', 'festivo', 'vacaciones', 'holiday', 'libre'],
            'servicios' => ['servicio', 'terapia', 'consulta', 'tratamiento', 'ayuda'],
            'emergencia' => ['emergencia', 'crisis', 'urgente', 'help', 'auxilio'],
            'agendar_cita' => ['agendar', 'reservar', 'cita', 'appointment', 'programar'],
            'roles' => ['rol', 'usuario', 'tipo', 'función', 'puede hacer'],
            'saludo' => ['hola', 'buenos', 'buenas', 'saludos', 'hi', 'hello']
        ];

        foreach ($intentPatterns as $intent => $patterns) {
            foreach ($patterns as $pattern) {
                if (strpos($message, $pattern) !== false) {
                    return $intent;
                }
            }
        }

        return 'general';
    }

    /**
     * Obtener información de feriados
     */
    private function getHolidayInfo(): array
    {
        $upcomingHolidays = Holiday::getUpcomingHolidays(60);
        $nextHoliday = $upcomingHolidays->first();
        
        return [
            'title' => 'Feriados en Perú',
            'content' => [
                'proximo_feriado' => $nextHoliday ? [
                    'nombre' => $nextHoliday->name,
                    'fecha' => $nextHoliday->formatted_date,
                    'dias_restantes' => $nextHoliday->daysUntil()
                ] : null,
                'proximos_feriados' => $upcomingHolidays->take(3)->map(function($holiday) {
                    return [
                        'nombre' => $holiday->name,
                        'fecha' => $holiday->formatted_date,
                        'tipo' => $holiday->type
                    ];
                }),
                'total_año' => Holiday::getHolidaysForYear(date('Y'))->count()
            ]
        ];
    }

    /**
     * Respuesta sobre horarios
     */
    private function getScheduleResponse(string $userProfile): array
    {
        return [
            'type' => 'horarios',
            'title' => 'Horarios de Atención',
            'message' => "📅 **Horarios del Sistema de Psicología ISTTA**\n\n⏰ **Días:** Lunes a Viernes\n🕐 **Horario:** 8:00 AM - 2:00 PM\n⏱️ **Duración:** 45 minutos por sesión\n\n**Bloques disponibles:**\n• 08:00-08:45 • 08:45-09:30\n• 09:30-10:15 • 10:15-11:00\n• 11:00-11:45 • 11:45-12:30\n• 12:30-13:15 • 13:15-14:00",
            'quick_replies' => [
                '¿Qué horarios están libres hoy?',
                '¿Cómo agendar una cita?',
                'Ver próximos feriados'
            ]
        ];
    }

    /**
     * Respuesta sobre feriados
     */
    private function getHolidayResponse(string $message): array
    {
        $holidayInfo = $this->getHolidayInfo();
        $nextHoliday = $holidayInfo['content']['proximo_feriado'];
        
        $response = "🎉 **Información de Feriados en Perú**\n\n";
        
        if ($nextHoliday) {
            $response .= "📅 **Próximo feriado:** {$nextHoliday['nombre']}\n";
            $response .= "📆 **Fecha:** {$nextHoliday['fecha']}\n";
            $response .= "⏳ **Faltan:** {$nextHoliday['dias_restantes']} días\n\n";
        }
        
        $response .= "📋 **Próximos feriados:**\n";
        foreach ($holidayInfo['content']['proximos_feriados'] as $holiday) {
            $response .= "• {$holiday['nombre']} - {$holiday['fecha']}\n";
        }

        return [
            'type' => 'feriados',
            'title' => 'Feriados en Perú',
            'message' => $response,
            'quick_replies' => [
                'Ver todos los feriados del año',
                '¿Afectan las citas los feriados?',
                'Horarios de atención normal'
            ]
        ];
    }

    /**
     * Respuesta por defecto
     */
    private function getDefaultResponse(string $message, string $userProfile): array
    {
        return [
            'type' => 'general',
            'title' => 'Asistente Psicológico ISTTA',
            'message' => "Entiendo tu consulta sobre \"$message\". Como asistente del Sistema de Psicología ISTTA, puedo ayudarte con:\n\n📅 **Horarios y citas**\n🏥 **Servicios disponibles**\n👥 **Información de roles**\n🎉 **Feriados en Perú**\n🚨 **Emergencias**\n\n¿Sobre qué te gustaría saber más?",
            'quick_replies' => [
                '📅 Horarios de atención',
                '🎉 Próximos feriados',
                '🏥 Servicios disponibles',
                '🚨 Emergencias'
            ]
        ];
    }

    /**
     * Respuesta de servicios
     */
    private function getServicesResponse(string $userProfile): array
    {
        return [
            'type' => 'servicios',
            'title' => 'Servicios de Psicología',
            'message' => "🏥 **Servicios Especializados ISTTA**\n\n🧠 **Consulta Individual**\n• Evaluación diagnóstica\n• Terapia cognitivo-conductual\n• Orientación académica\n\n👥 **Servicios Grupales**\n• Talleres de bienestar\n• Grupos de apoyo\n• Charlas preventivas\n\n✅ **Beneficios:**\n• 100% Gratuito para estudiantes\n• Profesionales certificados\n• Confidencialidad garantizada",
            'quick_replies' => [
                '¿Cómo agendar una cita?',
                'Horarios disponibles',
                '¿Qué incluye una evaluación?'
            ]
        ];
    }

    /**
     * Respuesta de emergencias
     */
    private function getEmergencyResponse(): array
    {
        return [
            'type' => 'emergencia',
            'title' => 'Protocolo de Emergencias',
            'priority' => 'high',
            'message' => "🚨 **PROTOCOLO DE EMERGENCIAS**\n\n📞 **Líneas de Crisis (24/7):**\n• Emergencia Nacional: **113**\n• Bomberos: **116**\n• Policía: **105**\n\n🏥 **En el Instituto:**\n• Dirección Académica: Ext. **101**\n• Bienestar Estudiantil: Ext. **102**\n\n⚠️ **Si es una crisis:**\n1. NO dejes sola a la persona\n2. Llama inmediatamente\n3. Mantén la calma\n4. Busca ayuda profesional",
            'quick_replies' => [
                '¿Cuándo llamar a emergencias?',
                'Protocolo para amigos en crisis',
                'Volver al menú principal'
            ]
        ];
    }

    /**
     * Respuesta sobre agendar citas
     */
    private function getAppointmentResponse(string $userProfile): array
    {
        if ($userProfile === 'estudiante') {
            return [
                'type' => 'citas',
                'title' => 'Agendar Cita - Estudiantes',
                'message' => "📅 **Proceso para Agendar Cita**\n\n**1. Acceso**\n• Inicia sesión con tu email @istta.edu.pe\n\n**2. Navegación**\n• Ve a \"Citas\" → \"Agendar Nueva Cita\"\n\n**3. Selección**\n• Elige fecha y hora disponible\n• Completa motivo de consulta\n\n**4. Confirmación**\n• Tu cita quedará PENDIENTE\n• El psicólogo la revisará\n• Recibirás notificación\n\n⚠️ Solo 1 cita pendiente a la vez",
                'quick_replies' => [
                    'Ver horarios disponibles',
                    '¿Qué poner en motivo de consulta?',
                    '¿Cuánto demora la aprobación?'
                ]
            ];
        } else {
            return [
                'type' => 'citas',
                'title' => 'Agendamiento Profesional',
                'message' => "📅 **Funciones de Agendamiento**\n\n👨‍⚕️ **Para Psicólogos:**\n• Agendamiento directo\n• Buscar estudiante por DNI/email\n• Aprobar/rechazar citas pendientes\n• Gestionar calendario completo\n\n👨‍💼 **Para Administradores:**\n• Supervisión general\n• Reportes de citas\n• Gestión de usuarios",
                'quick_replies' => [
                    'Buscar estudiante',
                    'Ver citas pendientes',
                    'Gestionar horarios'
                ]
            ];
        }
    }

    /**
     * Respuesta sobre roles
     */
    private function getRolesResponse(string $userProfile): array
    {
        return [
            'type' => 'roles',
            'title' => 'Roles del Sistema',
            'message' => "👥 **Roles en el Sistema ISTTA**\n\n🎓 **Estudiante**\n• Agendar citas psicológicas\n• Ver historial de citas\n• Recibir notificaciones\n\n🧠 **Psicólogo**\n• Aprobar/rechazar citas\n• Agendar directamente\n• Gestionar calendario\n• Registrar sesiones\n\n👨‍💼 **Administrador**\n• Gestión de usuarios\n• Reportes y estadísticas\n• Configuración del sistema",
            'quick_replies' => [
                '¿Cómo accedo como estudiante?',
                'Funciones de psicólogo',
                'Panel de administrador'
            ]
        ];
    }

    /**
     * Respuesta de saludo
     */
    private function getGreetingResponse(string $userProfile): array
    {
        $greeting = "¡Hola! 👋 Soy el Asistente Psicológico del Instituto Túpac Amaru.\n\n";
        
        if ($userProfile !== 'unknown') {
            $greeting .= "He detectado que eres **$userProfile**, así que te daré información específica para ti.\n\n";
        }
        
        $greeting .= "🎯 **Puedo ayudarte con:**\n• 📅 Información sobre citas\n• 🏥 Servicios disponibles\n• ⏰ Horarios de atención\n• 🎉 Feriados en Perú\n• 🚨 Emergencias\n\n¿En qué puedo asistirte?";

        return [
            'type' => 'saludo',
            'title' => 'Bienvenido',
            'message' => $greeting,
            'quick_replies' => [
                '📅 ¿Cómo agendar una cita?',
                '⏰ Horarios de atención',
                '🎉 Próximos feriados',
                '🏥 Servicios disponibles'
            ]
        ];
    }
}

































