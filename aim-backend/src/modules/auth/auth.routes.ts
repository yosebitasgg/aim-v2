import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from '@/shared/middleware/auth';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Iniciar sesión
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/refresh
 * @desc Renovar token de acceso
 * @access Public
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Cerrar sesión
 * @access Private
 */
router.post('/logout', AuthMiddleware.optionalAuth, AuthController.logout);

/**
 * @route POST /api/auth/forgot-password
 * @desc Solicitar recuperación de contraseña
 * @access Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Restablecer contraseña
 * @access Public
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route GET /api/auth/me
 * @desc Obtener información del usuario autenticado
 * @access Private
 */
router.get('/me', AuthMiddleware.authenticate, AuthController.getMe);

export default router; 