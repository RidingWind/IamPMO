import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import prisma from '../utils/prisma';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        parent: true,
        children: true,
        users: true
      }
    });
    return res.json(successResponse(departments));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json(errorResponse(errorMessage));
  }
};

export const getDepartmentTree = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        children: true
      }
    });

    const buildTree = (parentId: string | null = null): typeof departments => {
      return departments
        .filter(dept => dept.parentId === parentId)
        .map(dept => ({
          ...dept,
          children: buildTree(dept.id)
        }));
    };

    return res.json(successResponse(buildTree()));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json(errorResponse(errorMessage));
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, parentId, order = 0 } = req.body;
    
    const department = await prisma.department.create({
      data: {
        name,
        parentId,
        order
      }
    });
    
    return res.status(201).json(successResponse(department, '部门创建成功'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(400).json(errorResponse(errorMessage));
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.update({
      where: { id },
      data: req.body
    });
    return res.json(successResponse(department, '部门更新成功'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(400).json(errorResponse(errorMessage));
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({
      where: { id }
    });
    return res.json(successResponse(null, '部门删除成功'));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(400).json(errorResponse(errorMessage));
  }
};