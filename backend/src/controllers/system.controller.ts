import { Request, Response } from 'express';
import { 
  findAll,
  findById,
  create,
  update,
  remove
} from '../services/system.service';
import { successResponse, errorResponse } from '../utils/response';

export const getBusinessSystems = async (req: Request, res: Response) => {
  try {
    const systems = await findAll(req.query);
    return res.json(successResponse(systems));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message));
  }
};

export const getBusinessSystemById = async (req: Request, res: Response) => {
  try {
    const system = await findById(req.params.id);
    if (!system) {
      return res.status(404).json(errorResponse('系统不存在'));
    }
    return res.json(successResponse(system));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message));
  }
};

export const createBusinessSystem = async (req: Request, res: Response) => {
  try {
    const system = await create(req.body);
    return res.status(201).json(successResponse(system, '系统创建成功'));
  } catch (error) {
    return res.status(400).json(errorResponse(error.message));
  }
};

export const updateBusinessSystem = async (req: Request, res: Response) => {
  try {
    const system = await update(req.params.id, req.body);
    return res.json(successResponse(system, '系统更新成功'));
  } catch (error) {
    return res.status(400).json(errorResponse(error.message));
  }
};

export const deleteBusinessSystem = async (req: Request, res: Response) => {
  try {
    await remove(req.params.id);
    return res.json(successResponse(null, '系统删除成功'));
  } catch (error) {
    return res.status(400).json(errorResponse(error.message));
  }
};