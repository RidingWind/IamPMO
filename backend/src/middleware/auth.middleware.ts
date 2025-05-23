// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

// 认证中间件
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 获取请求头中的 Authorization 字段
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: '未提供认证令牌' 
      });
    }
    
    // 提取 token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: '无效的认证令牌格式' 
      });
    }
    
    // 验证 token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: '用户不存在' 
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    
    // 继续处理请求
    next();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'name' in error) {
      if ((error as { name: string }).name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          error: '无效的认证令牌' 
        });
      }
      if ((error as { name: string }).name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: '认证令牌已过期' 
        });
      }
    }
    
    console.error('认证中间件错误:', error);
    return res.status(500).json({ 
      success: false, 
      error: '服务器内部错误' 
    });
  }
};

// 管理员权限中间件
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '未认证用户'
    });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: '权限不足，需要管理员权限'
    });
  }
  next();
};

// 管理员或经理权限中间件
export const managerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '未认证用户'
    });
  }
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return res.status(403).json({
      success: false,
      error: '权限不足，需要管理员或经理权限'
    });
  }
  next();
};