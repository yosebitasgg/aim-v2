import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '@/config';
import { PASSWORD_REQUIREMENTS } from '@/shared/constants';

export class PasswordUtil {
  /**
   * Genera un hash de contraseña usando bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcrypt.rounds);
  }

  /**
   * Verifica si una contraseña coincide con su hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Genera una contraseña temporal segura
   */
  static generateTempPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    let charset = uppercase + lowercase + numbers;
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL) {
      charset += symbols;
    }
    
    // Asegurar que tenga al menos un carácter de cada tipo requerido
    if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE) {
      password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE) {
      password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS) {
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL) {
      password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    
    // Completar el resto de la contraseña
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Mezclar la contraseña
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  /**
   * Valida que una contraseña cumpla con los requisitos
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
      errors.push(`La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.MIN_LENGTH} caracteres`);
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Genera un token seguro para recuperación de contraseña
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Genera un ID único para usuario
   */
  static generateUserId(): string {
    return crypto.randomBytes(6).toString('hex'); // 12 caracteres
  }

  /**
   * Genera un ID único para sesión
   */
  static generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }
} 