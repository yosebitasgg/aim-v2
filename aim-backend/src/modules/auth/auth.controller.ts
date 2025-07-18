import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponseUtil } from '@/shared/utils/response';
import { logger } from '@/shared/utils/logger';
import { 
  LoginSchema, 
  RegisterSchema, 
  RefreshTokenSchema, 
  ForgotPasswordSchema,
  ResetPasswordSchema
} from './auth.types';

export class AuthController {
  /**
   * POST /api/auth/login
   * Iniciar sesión
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const validationResult = LoginSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const { email, password } = validationResult.data;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Autenticar usuario
      const authResponse = await AuthService.login(
        { email, password },
        ipAddress,
        userAgent
      );

      // Configurar cookies para los tokens
      res.cookie('access_token', authResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      res.cookie('refresh_token', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      ApiResponseUtil.success(res, authResponse, 'Inicio de sesión exitoso');
    } catch (error: any) {
      logger.error('Error en login controller', { error, body: req.body });
      ApiResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/auth/register
   * Registrar nuevo usuario
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const validationResult = RegisterSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      const { name, email, password, confirmPassword } = validationResult.data;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Registrar usuario
      const authResponse = await AuthService.register(
        { name, email, password, confirmPassword },
        ipAddress,
        userAgent
      );

      // Configurar cookies para los tokens
      res.cookie('access_token', authResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      res.cookie('refresh_token', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      ApiResponseUtil.success(res, authResponse, 'Registro exitoso', 201);
    } catch (error: any) {
      logger.error('Error en register controller', { error, body: req.body });
      ApiResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * POST /api/auth/refresh
   * Renovar token de acceso
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshTokenFromCookie = req.cookies?.refresh_token;
      const refreshTokenFromBody = req.body?.refreshToken;
      
      const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;
      
      if (!refreshToken) {
        ApiResponseUtil.unauthorized(res, 'Token de refresh requerido');
        return;
      }

      // Validar datos de entrada
      const validationResult = RefreshTokenSchema.safeParse({ refreshToken });
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      // Renovar token
      const tokenResponse = await AuthService.refreshToken(validationResult.data);

      // Configurar cookies para los nuevos tokens
      res.cookie('access_token', tokenResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      res.cookie('refresh_token', tokenResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      ApiResponseUtil.success(res, tokenResponse, 'Token renovado exitosamente');
    } catch (error: any) {
      logger.error('Error en refresh token controller', { error });
      ApiResponseUtil.error(res, error.message, 401);
    }
  }

  /**
   * POST /api/auth/logout
   * Cerrar sesión
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');

      if (userId) {
        await AuthService.logout(userId, ipAddress, userAgent);
      }

      // Limpiar cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      ApiResponseUtil.success(res, null, 'Sesión cerrada exitosamente');
    } catch (error: any) {
      logger.error('Error en logout controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Solicitar recuperación de contraseña
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const validationResult = ForgotPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      await AuthService.forgotPassword(validationResult.data);

      ApiResponseUtil.success(
        res, 
        null, 
        'Si el email existe, se enviará un enlace de recuperación'
      );
    } catch (error: any) {
      logger.error('Error en forgot password controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }

  /**
   * POST /api/auth/reset-password
   * Restablecer contraseña
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Validar datos de entrada
      const validationResult = ResetPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        ApiResponseUtil.validationError(res, validationResult.error.issues);
        return;
      }

      await AuthService.resetPassword(validationResult.data);

      ApiResponseUtil.success(res, null, 'Contraseña restablecida exitosamente');
    } catch (error: any) {
      logger.error('Error en reset password controller', { error });
      ApiResponseUtil.error(res, error.message, 400);
    }
  }

  /**
   * GET /api/auth/me
   * Obtener información del usuario autenticado
   */
  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        ApiResponseUtil.unauthorized(res, 'Usuario no autenticado');
        return;
      }

      ApiResponseUtil.success(res, req.user, 'Información del usuario');
    } catch (error: any) {
      logger.error('Error en get me controller', { error });
      ApiResponseUtil.error(res, error.message, 500);
    }
  }
} 