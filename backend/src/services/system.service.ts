import { System } from '@prisma/client';
import prisma from '../utils/prisma';

export const findAll = async (filters: any = {}) => {
  const { status, search } = filters;
  
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } }
    ];
  }

  return prisma.system.findMany({
    where,
    include: {
      projects: true
    }
  });
};

export const findById = async (id: string) => {
  return prisma.system.findUnique({
    where: { id },
    include: {
      projects: true
    }
  });
};

export const create = async (data: Partial<System>) => {
  return prisma.system.create({
    data: {
      ...data,
      status: 'ACTIVE'
    }
  });
};

export const update = async (id: string, data: Partial<System>) => {
  return prisma.system.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return prisma.system.delete({
    where: { id }
  });
};