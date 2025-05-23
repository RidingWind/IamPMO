import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../index';
import { adminMiddleware, authMiddleware, managerMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// 获取所有项目
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        implementer: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            members: true,
            milestones: true,
            issues: true,
          },
        },
      },
    });
    res.json(projects);
  } catch (error) {
    console.error('获取项目列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个项目详情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        implementer: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        milestones: {
          include: {
            detailPlans: true,
          },
        },
        issues: true,
        businessSystems: true,
      },
    });

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    res.json(project);
  } catch (error) {
    console.error('获取项目详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新项目
router.post(
  '/',
    authMiddleware,
    managerMiddleware,
    body('name').notEmpty().withMessage('项目名称不能为空'),
    body('code').notEmpty().withMessage('项目编号不能为空'),
    body('status').isIn(['PLANNING', 'ONGOING', 'COMPLETED', 'SUSPENDED', 'CANCELLED']).withMessage('无效的项目状态'),
    body('startDate').optional().isISO8601().withMessage('开始日期格式无效'),
    body('plannedEndDate').optional().isISO8601().withMessage('计划结束日期格式无效'),
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, code, status, startDate, plannedEndDate, description, implementerId } = req.body;

      // 检查项目编号是否已存在
      const existingProject = await prisma.project.findFirst({
        where: { code },
      });

      if (existingProject) {
        return res.status(400).json({ message: '项目编号已存在' });
      }

      // 创建新项目
      const project = await prisma.project.create({
        data: {
          name,
          code,
          status: status || 'PLANNING',
          startDate: startDate ? new Date(startDate) : undefined,
          plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
          description,
          implementerId,
        },
      });

      // 将创建者添加为项目成员
      await prisma.projectMember.create({
        data: {
          userId: req.user.id,
          projectId: project.id,
          role: '项目经理',
        },
      });

      res.status(201).json({
        message: '项目创建成功',
        project,
      });
    } catch (error) {
      console.error('创建项目错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 更新项目
router.put(
  '/:id',
    authMiddleware,
    managerMiddleware,
    param('id').isUUID().withMessage('无效的项目ID'),
    body('name').optional().notEmpty().withMessage('项目名称不能为空'),
    body('status').optional().isIn(['PLANNING', 'ONGOING', 'COMPLETED', 'SUSPENDED', 'CANCELLED']).withMessage('无效的项目状态'),
    body('startDate').optional().isISO8601().withMessage('开始日期格式无效'),
    body('plannedEndDate').optional().isISO8601().withMessage('计划结束日期格式无效'),
    body('actualEndDate').optional().isISO8601().withMessage('实际结束日期格式无效'),
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name, status, startDate, plannedEndDate, actualEndDate, description, implementerId } = req.body;

      // 检查项目是否存在
      const existingProject = await prisma.project.findUnique({
        where: { id },
      });

      if (!existingProject) {
        return res.status(404).json({ message: '项目不存在' });
      }

      // 更新项目
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          name,
          status,
          startDate: startDate ? new Date(startDate) : undefined,
          plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
          actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined,
          description,
          implementerId,
        },
      });

      res.json({
        message: '项目更新成功',
        project: updatedProject,
      });
    } catch (error) {
      console.error('更新项目错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 删除项目
router.delete('/:id', authMiddleware, managerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查项目是否存在
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 删除项目相关的所有数据
    await prisma.$transaction([
      // 删除项目成员
      prisma.projectMember.deleteMany({
        where: { projectId: id },
      }),
      // 删除详细计划
      prisma.detailPlan.deleteMany({
        where: { milestone: { projectId: id } },
      }),
      // 删除里程碑
      prisma.milestone.deleteMany({
        where: { projectId: id },
      }),
      // 删除问题
      prisma.issue.deleteMany({
        where: { projectId: id },
      }),
      // 删除项目与业务系统的关联
      prisma.project.update({
        where: { id },
        data: {
          businessSystems: {
            set: [],
          },
        },
      }),
      // 删除项目
      prisma.project.delete({
        where: { id },
      }),
    ]);

    res.json({ message: '项目已成功删除' });
  } catch (error) {
    console.error('删除项目错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加项目成员
router.post(
  '/:id/members',
    authMiddleware,
    managerMiddleware,
    param('id').isUUID().withMessage('无效的项目ID'),
    body('userId').isUUID().withMessage('无效的用户ID'),
    body('role').notEmpty().withMessage('角色不能为空'),
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { userId, role } = req.body;

      // 检查项目是否存在
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        return res.status(404).json({ message: '项目不存在' });
      }

      // 检查用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      // 检查用户是否已经是项目成员
      const existingMember = await prisma.projectMember.findFirst({
        where: {
          projectId: id,
          userId,
        },
      });

      if (existingMember) {
        return res.status(400).json({ message: '用户已经是项目成员' });
      }

      // 添加项目成员
      const member = await prisma.projectMember.create({
        data: {
          projectId: id,
          userId,
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      res.status(201).json({
        message: '项目成员添加成功',
        member,
      });
    } catch (error) {
      console.error('添加项目成员错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 移除项目成员
router.delete(
  '/:projectId/members/:memberId',
  authMiddleware,
  managerMiddleware,
  async (req, res) => {
    try {
      const { projectId, memberId } = req.params;

      // 检查项目成员是否存在
      const member = await prisma.projectMember.findFirst({
        where: {
          id: memberId,
          projectId,
        },
      });

      if (!member) {
        return res.status(404).json({ message: '项目成员不存在' });
      }

      // 删除项目成员
      await prisma.projectMember.delete({
        where: { id: memberId },
      });

      res.json({ message: '项目成员已成功移除' });
    } catch (error) {
      console.error('移除项目成员错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

export default router;