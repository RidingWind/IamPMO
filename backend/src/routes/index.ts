import { Router } from 'express';
import authRoutes from './auth.routes';
import systemRoutes from './system.routes';
import departmentRoutes from './department.routes';
import companyRoutes from './company.routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/systems', authMiddleware, systemRoutes);
router.use('/departments', authMiddleware, departmentRoutes);
router.use('/companies', authMiddleware, companyRoutes);

export default router;