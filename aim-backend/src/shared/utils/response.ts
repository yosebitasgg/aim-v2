import { Response } from 'express';
import { ApiResponse } from '@/shared/types';

export class ApiResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message: message || 'Operación exitosa',
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    error: string,
    statusCode: number = 500,
    message?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error,
      message: message || 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    };

    return res.status(statusCode).json(response);
  }

  static validationError(
    res: Response,
    errors: any,
    message: string = 'Errores de validación'
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message,
      data: errors,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    };

    return res.status(400).json(response);
  }

  static unauthorized(
    res: Response,
    message: string = 'No autorizado'
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: 'Unauthorized',
      message,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    };

    return res.status(401).json(response);
  }

  static forbidden(
    res: Response,
    message: string = 'Acceso denegado'
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: 'Forbidden',
      message,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    };

    return res.status(403).json(response);
  }

  static notFound(
    res: Response,
    message: string = 'Recurso no encontrado'
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: 'Not Found',
      message,
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    };

    return res.status(404).json(response);
  }
} 