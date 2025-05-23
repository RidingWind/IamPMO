import { Company } from '@prisma/client';
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

  return prisma.company.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const findById = async (id: string) => {
  return prisma.company.findUnique({
    where: { id }
  });
};

export const create = async (data: Partial<Company>) => {
  return prisma.company.create({
    data: {
      ...data,
      status: data.status || 'active'
    }
  });
};

export const update = async (id: string, data: Partial<Company>) => {
  return prisma.company.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  return prisma.company.delete({
    where: { id }
  });
};