// Configuración de autenticación
export const AUTH_CONFIG = {
  // Google OAuth Client ID - Reemplazar con tu Client ID real
  GOOGLE_CLIENT_ID: '25922165495-7ip4geihfadda3m7mph74pe76fr5ujdm.apps.googleusercontent.com',
  
  // URL de la API
  API_BASE_URL: 'http://localhost:8000/api',
  
  // Dominios permitidos
  ALLOWED_DOMAINS: {
    INSTITUTIONAL: '@istta.edu.pe',
    PERSONAL: ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com']
  },
  
  // Emails especiales para roles específicos
  SPECIAL_EMAILS: {
    SUPER_ADMIN: ['marcelojinmy2024@gmail.com', 'superadmin@tupac-amaru.edu.pe'],
    ADMIN: ['admin@tupac-amaru.edu.pe']
  }
};

// Función para verificar si un email es institucional
export const isInstitutionalEmail = (email: string): boolean => {
  return email.endsWith(AUTH_CONFIG.ALLOWED_DOMAINS.INSTITUTIONAL);
};

// Función para verificar si un email es personal
export const isPersonalEmail = (email: string): boolean => {
  return AUTH_CONFIG.ALLOWED_DOMAINS.PERSONAL.some(domain => 
    email.endsWith(domain)
  );
};

// Función para determinar el rol basado en el email
export const determineRoleFromEmail = (email: string): 'student' | 'psychologist' | 'admin' | 'super_admin' => {
  // Verificar emails especiales primero
  if (AUTH_CONFIG.SPECIAL_EMAILS.SUPER_ADMIN.includes(email)) {
    return 'super_admin';
  }
  
  if (AUTH_CONFIG.SPECIAL_EMAILS.ADMIN.includes(email)) {
    return 'admin';
  }
  
  // Lógica normal para otros emails
  if (isInstitutionalEmail(email)) {
    return 'student';
  } else if (isPersonalEmail(email)) {
    return 'psychologist';
  }
  
  throw new Error('Email no válido para el sistema');
}; 