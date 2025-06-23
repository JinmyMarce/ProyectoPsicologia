import { AUTH_CONFIG, determineRoleFromEmail } from '../config/auth';

// Configuración de Google OAuth
const GOOGLE_CLIENT_ID = 'TU_GOOGLE_CLIENT_ID'; // Reemplazar con tu Client ID real
const GOOGLE_SCOPE = 'email profile';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

class GoogleAuthService {
  private googleAuth: any = null;

  constructor() {
    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth() {
    // Cargar Google API
    if (typeof window !== 'undefined' && window.google) {
      this.googleAuth = window.google.accounts.oauth2;
    }
  }

  // Inicializar Google Sign-In
  async initializeGoogleSignIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Auth no disponible en el servidor'));
        return;
      }

      // Cargar Google API si no está cargada
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.googleAuth = window.google.accounts.oauth2;
          resolve();
        };
        script.onerror = () => reject(new Error('Error al cargar Google API'));
        document.head.appendChild(script);
      } else {
        this.googleAuth = window.google.accounts.oauth2;
        resolve();
      }
    });
  }

  // Iniciar sesión con Google
  async signInWithGoogle(): Promise<{ token: string; user: GoogleUser }> {
    if (!this.googleAuth) {
      await this.initializeGoogleSignIn();
    }

    return new Promise((resolve, reject) => {
      try {
        this.googleAuth.initTokenClient({
          client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }

            try {
              // Obtener información del usuario
              const userInfo = await this.getUserInfo(response.access_token);
              resolve({
                token: response.access_token,
                user: userInfo
              });
            } catch (error) {
              reject(error);
            }
          },
        }).requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Obtener información del usuario de Google
  private async getUserInfo(accessToken: string): Promise<GoogleUser> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener información del usuario');
    }

    return response.json();
  }

  // Verificar si el email es institucional
  isInstitutionalEmail(email: string): boolean {
    return email.endsWith(AUTH_CONFIG.ALLOWED_DOMAINS.INSTITUTIONAL);
  }

  // Verificar si el email es personal (para psicólogos)
  isPersonalEmail(email: string): boolean {
    return AUTH_CONFIG.ALLOWED_DOMAINS.PERSONAL.some(domain => 
      email.endsWith(domain)
    );
  }

  // Determinar el rol basado en el email
  determineRole(email: string): 'student' | 'psychologist' | 'admin' {
    return determineRoleFromEmail(email);
  }
}

export const googleAuthService = new GoogleAuthService();

// Extender Window interface para TypeScript
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
} 