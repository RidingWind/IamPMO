import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';

const router = express.Router();

// 注册新用户
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('请提供有效的电子邮件'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
    body('name').notEmpty().withMessage('姓名不能为空'),
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, departmentId, companyId } = req.body;

    try {
      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: '该邮箱已被注册' });
      }

      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 创建新用户
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || undefined,
          departmentId: departmentId || undefined,
          companyId: companyId || undefined,
        },
      });

      // 创建JWT令牌
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      res.status(201).json({
        message: '用户注册成功',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 用户登录
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('请提供有效的电子邮件'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({ message: '无效的凭据' });
      }

      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: '无效的凭据' });
      }

      // 创建JWT令牌
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      res.json({
        message: '登录成功',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

export default router;