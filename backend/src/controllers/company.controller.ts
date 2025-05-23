import { Request, Response } from 'express';
import * as companyService from '../services/company.service';
import { successResponse, errorResponse } from '../utils/response';

export const listCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await companyService.findAll(req.query);
    return res.json(successResponse(companies));
  } catch (error) {
    console.error('获取公司列表失败:', error);
    return res.status(500).json(errorResponse(error.message));
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const company = await companyService.findById(req.params.id);
    if (!company) {
      return res.status(404).json(errorResponse('公司不存在'));
    }
    return res.json(successResponse(company));
  } catch (error) {
    console.error('获取公司详情失败:', error);
    return res.status(500).json(errorResponse(error.message));
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const company = await companyService.create(req.body);
    return res.status(201).json(successResponse(company, '公司创建成功'));
  } catch (error) {
    console.error('创建公司失败:', error);
    return res.status(400).json(errorResponse(error.message));
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const company = await companyService.update(req.params.id, req.body);
    return res.json(successResponse(company, '公司更新成功'));
  } catch (error) {
    console.error('更新公司失败:', error);
    return res.status(400).json(errorResponse(error.message));
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    await companyService.remove(req.params.id);
    return res.json(successResponse(null, '公司删除成功'));
  } catch (error) {
    console.error('删除公司失败:', error);
    return res.status(400).json(errorResponse(error.message));
  }
};