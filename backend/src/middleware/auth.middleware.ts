import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// 验证JWT令牌的中间件
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  // 获取请求头中的令牌
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: '未提供授权令牌，访问被拒绝' });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        companyId: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: '无效的令牌' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('令牌验证错误:', error);
    res.status(401).json({ message: '令牌无效或已过期' });
  }
};

// 检查用户是否具有特定角色的中间件
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: '未授权' });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: '权限不足，无法访问此资源' });
    }
  };
};