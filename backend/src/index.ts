import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 路由导入
import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import departmentRoutes from './routes/department.routes';
import companyRoutes from './routes/company.routes';
import issueRoutes from './routes/issue.routes';
import systemRoutes from './routes/system.routes';
// import planRoutes from './routes/plan.routes';

// 加载环境变量
dotenv.config();

// 初始化Prisma客户端
export const prisma = new PrismaClient();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'PMO工具箱API服务运行中' });
});

// API路由
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/systems', systemRoutes);
// app.use('/api/plans', planRoutes);

// 自定义错误类型
class AppError extends Error {
    statusCode: number;
    
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

// 错误处理中间件
app.use((err: AppError | Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    res.status(statusCode).json({
        error: {
            message: err.message || '服务器内部错误',
            status: statusCode,
            stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('已断开数据库连接');
  process.exit(0);
});