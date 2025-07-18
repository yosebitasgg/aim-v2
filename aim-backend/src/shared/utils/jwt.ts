import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { JwtPayload, RefreshTokenPayload } from '@/shared/types';
import { logger } from './logger';

export class JwtUtil {
  /**
   * Genera un token JWT de acceso
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as any);
  }

  /**
   * Genera un token JWT de refresh
   */
  static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as any);
  }

  /**
   * Verifica y decodifica un token JWT
   */
  static verifyToken<T = JwtPayload>(token: string): T {
    try {
      return jwt.verify(token, config.jwt.secret) as T;
    } catch (error) {
      logger.error('Error verificando token JWT', { error });
      throw new Error('Token inválido');
    }
  }

  /**
   * Decodifica un token JWT sin verificar
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decodificando token JWT', { error });
      throw new Error('Token malformado');
    }
  }

  /**
   * Verifica si un token está expirado
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obtiene el tiempo de expiración de un token
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Genera un par de tokens (access y refresh)
   */
  static generateTokenPair(userId: string, email: string, role: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const tokenId = Math.random().toString(36).substring(2, 15);
    
    const accessToken = this.generateAccessToken({
      userId,
      email,
      role,
    });

    const refreshToken = this.generateRefreshToken({
      userId,
      tokenId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
} 