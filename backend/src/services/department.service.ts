import { Department } from '@prisma/client';
import prisma from '../utils/prisma';

export const findAll = async () => {
  return prisma.department.findMany({
    include: {
      parent: true,
      children: true,
      users: true
    }
  });
};

export const findById = async (id: string) => {
  return prisma.department.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      users: true
    }
  });
};

export const create = async (data: Partial<Department>) => {
  return prisma.department.create({
    data: {
      ...data,
      order: data.order || 0
    }
  });
};

export const update = async (id: string, data: Partial<Department>) => {
  return prisma.department.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return prisma.department.delete({
    where: { id }
  });
};

export const getTree = async () => {
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

  return buildTree();
};