import { Router } from 'express';
import {
  getDepartments,
  getDepartmentTree,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/department.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getDepartments);
router.get('/tree', authMiddleware, getDepartmentTree);
router.post('/', authMiddleware, createDepartment);
router.put('/:id', authMiddleware, updateDepartment);
router.delete('/:id', authMiddleware, deleteDepartment);

export default router;