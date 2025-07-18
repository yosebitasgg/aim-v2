import { prisma } from '@/database/client';
import { PasswordUtil } from '@/shared/utils/password';
import { JwtUtil } from '@/shared/utils/jwt';
import { logger } from '@/shared/utils/logger';
import { ACTIVITY_ACTIONS } from '@/shared/constants';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  RefreshTokenResponse
} from './auth.types';

export class AuthService {
  /**
   * Iniciar sesión
   */
  static async login(data: LoginRequest, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // Registrar intento de login
      await this.recordLoginAttempt(data.email, ipAddress, false);

      // Buscar usuario y verificar contraseña
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          keys: true,
        },
      });

      if (!user) {
        throw new Error('Credenciales incorrectas');
      }

      if (user.status !== 'active') {
        throw new Error('Usuario inactivo');
      }

      // Verificar contraseña
      const key = user.keys.find(k => k.id === `email:${data.email}`);
      if (!key || !key.hashedPassword) {
        throw new Error('Credenciales incorrectas');
      }

      const isValidPassword = await PasswordUtil.verifyPassword(data.password, key.hashedPassword);
      if (!isValidPassword) {
        throw new Error('Credenciales incorrectas');
      }

      // Actualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          isFirstLogin: false,
        },
      });

      // Registrar login exitoso
      await this.recordLoginAttempt(data.email, ipAddress, true);

      // Registrar actividad
      await this.recordActivity(user.id, ACTIVITY_ACTIONS.LOGIN, undefined, {
        ipAddress,
        userAgent,
      });

      // Generar tokens
      const { accessToken, refreshToken } = JwtUtil.generateTokenPair(
        user.id,
        user.email,
        user.role
      );

      logger.info('Usuario autenticado exitosamente', {
        userId: user.id,
        email: user.email,
        ipAddress,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department || undefined,
          isFirstLogin: user.isFirstLogin,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Error en login', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  static async register(data: RegisterRequest, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      // Validar contraseña
      const passwordValidation = PasswordUtil.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Crear usuario y clave en transacción
      const hashedPassword = await PasswordUtil.hashPassword(data.password);
      const userId = PasswordUtil.generateUserId();

      const user = await prisma.$transaction(async (tx) => {
        // Crear usuario
        const newUser = await tx.user.create({
          data: {
            id: userId,
            email: data.email,
            name: data.name,
            emailVerified: false,
            status: 'active',
            role: 'user',
            createdAt: new Date(),
          },
        });

        // Crear clave
        await tx.key.create({
          data: {
            id: `email:${data.email}`,
            userId: newUser.id,
            hashedPassword,
          },
        });

        // Crear perfil de usuario
        await tx.userProfile.create({
          data: {
            userId: newUser.id,
            locale: 'es',
            preferences: {},
            restrictions: {},
          },
        });

        return newUser;
      });

      // Registrar actividad
      await this.recordActivity(user.id, ACTIVITY_ACTIONS.LOGIN, undefined, {
        ipAddress,
        userAgent,
      });

      // Generar tokens
      const { accessToken, refreshToken } = JwtUtil.generateTokenPair(
        user.id,
        user.email,
        user.role
      );

      logger.info('Usuario registrado exitosamente', {
        userId: user.id,
        email: user.email,
        ipAddress,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department || undefined,
          isFirstLogin: user.isFirstLogin,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Error en registro', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Renovar token de acceso
   */
  static async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const payload = JwtUtil.verifyToken(data.refreshToken);
      
      // Verificar que el usuario existe y está activo
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.status !== 'active') {
        throw new Error('Usuario inactivo');
      }

      // Generar nuevos tokens
      const { accessToken, refreshToken } = JwtUtil.generateTokenPair(
        user.id,
        user.email,
        user.role
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Error renovando token', { error });
      throw new Error('Token inválido');
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Registrar actividad
      await this.recordActivity(userId, ACTIVITY_ACTIONS.LOGOUT, undefined, {
        ipAddress,
        userAgent,
      });

      logger.info('Usuario cerró sesión', { userId, ipAddress });
    } catch (error) {
      logger.error('Error en logout', { error, userId });
      throw error;
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        // Por seguridad, no revelamos si el email existe
        return;
      }

      // Generar token de recuperación
      const token = PasswordUtil.generateResetToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // TODO: Enviar email con el token
      logger.info('Token de recuperación generado', { userId: user.id, token });
    } catch (error) {
      logger.error('Error en recuperación de contraseña', { error });
      throw error;
    }
  }

  /**
   * Restablecer contraseña
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      // Verificar token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token: data.token },
        include: { user: true },
      });

      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        throw new Error('Token inválido o expirado');
      }

      // Validar nueva contraseña
      const passwordValidation = PasswordUtil.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Actualizar contraseña
      const hashedPassword = await PasswordUtil.hashPassword(data.password);

      await prisma.$transaction(async (tx) => {
        // Actualizar clave
        await tx.key.updateMany({
          where: { userId: resetToken.userId },
          data: { hashedPassword },
        });

        // Marcar token como usado
        await tx.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        });
      });

      // Registrar actividad
      await this.recordActivity(resetToken.userId, ACTIVITY_ACTIONS.RESET_PASSWORD);

      logger.info('Contraseña restablecida exitosamente', { userId: resetToken.userId });
    } catch (error) {
      logger.error('Error restableciendo contraseña', { error });
      throw error;
    }
  }

  /**
   * Registrar intento de login
   */
  private static async recordLoginAttempt(email: string, ipAddress?: string, success: boolean = false): Promise<void> {
    try {
      await prisma.loginAttempt.create({
        data: {
          email,
          ipAddress,
          success,
          failureReason: success ? null : 'Invalid credentials',
        },
      });
    } catch (error) {
      logger.error('Error registrando intento de login', { error });
    }
  }

  /**
   * Registrar actividad del usuario
   */
  private static async recordActivity(
    userId: string,
    action: string,
    module?: string,
    details?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    try {
      await prisma.userActivityLog.create({
        data: {
          userId,
          action,
          module,
          details: details || {},
          ipAddress: details?.ipAddress,
          userAgent: details?.userAgent,
        },
      });
    } catch (error) {
      logger.error('Error registrando actividad', { error });
    }
  }
} 