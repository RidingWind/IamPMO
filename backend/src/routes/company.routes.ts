import { Router } from 'express';
import { 
  listCompanies, 
  createCompany, 
  getCompanyById, 
  updateCompany, 
  deleteCompany 
} from '../controllers/company.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, listCompanies);
router.get('/:id', authMiddleware, getCompanyById);
router.post('/', authMiddleware, createCompany);
router.put('/:id', authMiddleware, updateCompany);
router.delete('/:id', authMiddleware, deleteCompany);

export default router;