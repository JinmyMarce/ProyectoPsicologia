<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Login tradicional con email y password
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Verificar que el usuario esté activo
            if (!$user->isActive()) {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.'
                ], 403);
            }
            
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'user' => $user->toApiArray(),
                    'token' => $token
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Credenciales inválidas'
        ], 401);
    }

    /**
     * Login con Google OAuth
     */
    public function loginWithGoogle(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Token de Google requerido',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Verificar token de Google
            $googleUser = $this->verifyGoogleToken($request->token);
            
            // Buscar usuario existente
            $user = User::where('email', $googleUser['email'])->first();

            if (!$user) {
                // Crear nuevo usuario
                $user = $this->createUserFromGoogle($googleUser);
            } else {
                // Si es el superadministrador, asegurar el rol
                if ($user->email === 'marcelojinmy2024@gmail.com' && $user->role !== 'super_admin') {
                    $user->role = 'super_admin';
                    $user->save();
                }
                // Verificar que el usuario esté activo
                if (!$user->isActive()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.'
                    ], 403);
                }
                // Actualizar información de Google si es necesario
                $user->update([
                    'google_id' => $googleUser['id'],
                    'avatar' => $googleUser['picture'],
                    'verified' => true,
                ]);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login con Google exitoso',
                'data' => [
                    'user' => $user->toApiArray(),
                    'token' => $token
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al autenticar con Google: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Registrar nuevo usuario
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:student,psychologist',
            'student_id' => 'required_if:role,student|nullable|string',
            'career' => 'required_if:role,student|nullable|string',
            'semester' => 'required_if:role,student|nullable|integer|min:1|max:12',
            'specialization' => 'required_if:role,psychologist|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar dominio según el rol
        if ($request->role === 'student') {
            if (!$request->email || !str_ends_with($request->email, '@istta.edu.pe')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Los estudiantes deben usar correo institucional (@istta.edu.pe)'
                ], 422);
            }
        } else {
            // Para psicólogos, verificar que sea correo personal
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
        }

        try {
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'verified' => false, // Requiere verificación del administrador
            ];

            // Agregar campos específicos según el rol
            if ($request->role === 'student') {
                $userData['student_id'] = $request->student_id;
                $userData['career'] = $request->career;
                $userData['semester'] = $request->semester;
            } else {
                $userData['specialization'] = $request->specialization;
                $userData['rating'] = 0.00;
                $userData['total_appointments'] = 0;
            }

            $user = User::create($userData);
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'data' => [
                    'user' => $user->toApiArray(),
                    'token' => $token
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar usuario'
            ], 500);
        }
    }

    /**
     * Verificar token actual
     */
    public function verifyToken(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Token inválido'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Token válido',
            'data' => [
                'user' => $user->toApiArray(),
                'token' => $request->bearerToken()
            ]
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout exitoso'
        ]);
    }

    /**
     * Obtener perfil del usuario
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user->toApiArray(),
                'token' => $request->bearerToken()
            ]
        ]);
    }

    /**
     * Verificar token de Google
     */
    private function verifyGoogleToken(string $token): array
    {
        $response = file_get_contents("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" . $token);
        
        if (!$response) {
            throw new \Exception('Error al verificar token de Google');
        }

        $userData = json_decode($response, true);

        if (!$userData || !isset($userData['email'])) {
            throw new \Exception('Token de Google inválido');
        }

        return $userData;
    }

    /**
     * Crear usuario desde datos de Google
     */
    private function createUserFromGoogle(array $googleUser): User
    {
        // Si el email es el del superadministrador, asignar rol super_admin
        if ($googleUser['email'] === 'marcelojinmy2024@gmail.com') {
            $role = 'super_admin';
        } else {
            $role = User::determineRoleFromEmail($googleUser['email']);
        }

        return User::create([
            'name' => $googleUser['name'],
            'email' => $googleUser['email'],
            'password' => Hash::make(Str::random(16)), // Contraseña aleatoria
            'role' => $role,
            'google_id' => $googleUser['id'],
            'avatar' => $googleUser['picture'],
            'verified' => $googleUser['verified_email'],
        ]);
    }

    /**
     * Manejar callback de Google OAuth
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $code = $request->get('code');
            
            if (!$code) {
                return redirect()->away('http://localhost:3000/login?error=no_code');
            }

            // Intercambiar código por token de acceso
            $tokenResponse = $this->exchangeCodeForToken($code);
            
            if (!$tokenResponse || !isset($tokenResponse['access_token'])) {
                return redirect()->away('http://localhost:3000/login?error=token_exchange_failed');
            }

            // Obtener información del usuario
            $googleUser = $this->verifyGoogleToken($tokenResponse['access_token']);
            
            // Log para debugging
            \Log::info('Google user data:', $googleUser);
            
            // Buscar o crear usuario
            $user = User::where('email', $googleUser['email'])->first();

            if (!$user) {
                // Crear nuevo usuario
                $user = $this->createUserFromGoogle($googleUser);
                \Log::info('Nuevo usuario creado con rol: ' . $user->role);
            } else {
                // Actualizar información de Google si es necesario
                $user->update([
                    'google_id' => $googleUser['id'],
                    'avatar' => $googleUser['picture'],
                    'verified' => true,
                ]);
                \Log::info('Usuario existente actualizado, rol actual: ' . $user->role);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            // Log del usuario final
            \Log::info('Usuario final para redirección:', $user->toApiArray());

            // Redirigir al frontend con el token
            return redirect()->away("http://localhost:3000/auth/callback?token={$token}&user=" . urlencode(json_encode($user->toApiArray())));

        } catch (\Exception $e) {
            \Log::error('Error en Google callback: ' . $e->getMessage());
            return redirect()->away('http://localhost:3000/login?error=' . urlencode($e->getMessage()));
        }
    }

    /**
     * Intercambiar código de autorización por token de acceso
     */
    private function exchangeCodeForToken(string $code): ?array
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = 'http://localhost:8000/auth/google/callback';

        $postData = [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200 && $response) {
            return json_decode($response, true);
        }

        return null;
    }
}
