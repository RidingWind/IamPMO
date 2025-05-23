import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../index';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

// 获取所有问题/风险
router.get('/', auth, async (req, res) => {
  try {
    const { projectId, type, status, priority } = req.query;

    // 构建查询条件
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId as string;
    }
    
    if (type) {
      where.type = type as string;
    }
    
    if (status) {
      where.status = status as string;
    }
    
    if (priority) {
      where.priority = priority as string;
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(issues);
  } catch (error) {
    console.error('获取问题/风险列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个问题/风险详情
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!issue) {
      return res.status(404).json({ message: '问题/风险不存在' });
    }

    res.json(issue);
  } catch (error) {
    console.error('获取问题/风险详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新问题/风险
router.post(
  '/',
  [
    auth,
    body('title').notEmpty().withMessage('标题不能为空'),
    body('description').notEmpty().withMessage('描述不能为空'),
    body('type').isIn(['RISK', 'ISSUE', 'CHANGE_REQUEST', 'DEPENDENCY']).withMessage('无效的类型'),
    body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('无效的优先级'),
    body('projectId').isUUID().withMessage('无效的项目ID'),
    body('dueDate').optional().isISO8601().withMessage('截止日期格式无效'),
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, type, priority, projectId, dueDate, assigneeId } = req.body;

      // 检查项目是否存在
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return res.status(404).json({ message: '项目不存在' });
      }

      // 创建新问题/风险
      const issue = await prisma.issue.create({
        data: {
          title,
          description,
          type,
          priority,
          projectId,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assigneeId,
          reporterId: req.user.id,
        },
      });

      res.status(201).json({
        message: '问题/风险创建成功',
        issue,
      });
    } catch (error) {
      console.error('创建问题/风险错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 更新问题/风险
router.put(
  '/:id',
  [
    auth,
    param('id').isUUID().withMessage('无效的问题/风险ID'),
    body('title').optional().notEmpty().withMessage('标题不能为空'),
    body('description').optional().notEmpty().withMessage('描述不能为空'),
    body('type').optional().isIn(['RISK', 'ISSUE', 'CHANGE_REQUEST', 'DEPENDENCY']).withMessage('无效的类型'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('无效的优先级'),
    body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED']).withMessage('无效的状态'),
    body('dueDate').optional().isISO8601().withMessage('截止日期格式无效'),
  ],
  async (req, res) => {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { title, description, type, priority, status, dueDate, assigneeId } = req.body;

      // 检查问题/风险是否存在
      const existingIssue = await prisma.issue.findUnique({
        where: { id },
      });

      if (!existingIssue) {
        return res.status(404).json({ message: '问题/风险不存在' });
      }

      // 准备更新数据
      const updateData: any = {};
      
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) {
        updateData.status = status;
        
        // 如果状态变为已解决，记录解决时间
        if (status === 'RESOLVED' && existingIssue.status !== 'RESOLVED') {
          updateData.resolvedAt = new Date();
        }
        
        // 如果状态从已解决变为其他状态，清除解决时间
        if (status !== 'RESOLVED' && existingIssue.status === 'RESOLVED') {
          updateData.resolvedAt = null;
        }
      }
      
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

      // 更新问题/风险
      const updatedIssue = await prisma.issue.update({
        where: { id },
        data: updateData,
      });

      res.json({
        message: '问题/风险更新成功',
        issue: updatedIssue,
      });
    } catch (error) {
      console.error('更新问题/风险错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 删除问题/风险
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查问题/风险是否存在
    const existingIssue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!existingIssue) {
      return res.status(404).json({ message: '问题/风险不存在' });
    }

    // 删除问题/风险
    await prisma.issue.delete({
      where: { id },
    });

    res.json({ message: '问题/风险已成功删除' });
  } catch (error) {
    console.error('删除问题/风险错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取项目的所有问题/风险
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type, status, priority } = req.query;

    // 构建查询条件
    const where: any = {
      projectId,
    };
    
    if (type) {
      where.type = type as string;
    }
    
    if (status) {
      where.status = status as string;
    }
    
    if (priority) {
      where.priority = priority as string;
    }

    const issues = await prisma.issue.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(issues);
  } catch (error) {
    console.error('获取项目问题/风险列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;