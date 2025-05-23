import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('全局错误处理:', err);
  
  // 处理Prisma错误
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(400).json(errorResponse('数据已存在，请检查唯一字段'));
    }
    if (err.code === 'P2025') {
      return res.status(404).json(errorResponse('记录不存在'));
    }
  }
  
  // 处理其他错误
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  return res.status(statusCode).json(errorResponse(message));
};