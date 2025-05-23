// backend/src/routes/system.routes.ts
import { Router } from 'express';
import * as systemController from '../controllers/system.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 系统管理路由
router.get('/', authMiddleware, systemController.getBusinessSystems);
router.get('/:id', authMiddleware, systemController.getBusinessSystemById);
router.post('/', authMiddleware, systemController.createBusinessSystem);
router.put('/:id', authMiddleware, systemController.updateBusinessSystem);
router.delete('/:id', authMiddleware, systemController.deleteBusinessSystem);

export default router;