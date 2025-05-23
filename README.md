# PMO工具箱

PMO工具箱是一个项目管理办公室工具，用于管理项目、计划、问题风险等。

## 功能特点

- 项目管理：登记项目基本信息，包括项目名称、编号、实施方、周期、状态等
- 计划管理：管理整体计划和详细计划，包括里程碑计划和各类详细计划
- 问题风险管理：登记、管控和追踪项目中的问题和风险
- 业务系统管理：管理产品化和客户化定制的业务系统
- 部门管理：按树形层级架构管理内部机构、部门和团队
- 合作公司管理：管理第三方合作公司
- 人员及权限管理：按RBAC模式管理内部员工和第三方外包人员

## 技术栈

### 前端
- React
- TypeScript
- Ant Design
- React Router

### 后端
- Node.js
- Express
- TypeScript
- Prisma ORM

### 数据库
- SQLite (开发环境)
- 可切换至PostgreSQL/MySQL (生产环境)

## 快速开始

### 前提条件
- Node.js (v14+)
- npm 或 yarn

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
npm install --save-dev typescript @types/react @types/react-dom

# 如需清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm start
```

### 数据库设置

```bash
# 在后端目录中初始化Prisma
cd backend
npx prisma migrate dev --name init

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 在项目根目录执行
curl https://raw.githubusercontent.com/facebook/create-react-app/main/packages/cra-template/template/public/index.html > public/index.html
```

### 启动应用

```bash
# 启动后端服务 (在backend目录中)

npm run dev

# 启动前端服务 (在frontend目录中)
npm start
```

访问 http://localhost:3000 查看应用。

## 项目结构

```
.
├── backend/                  # 后端代码
│   ├── prisma/               # Prisma模型和迁移
│   │   └── schema.prisma     # 数据库模型定义
│   ├── src/                  # 源代码
│   │   ├── index.ts          # 应用入口
│   │   ├── middleware/       # 中间件
│   │   └── routes/           # API路由
│   ├── package.json          # 依赖管理
│   └── tsconfig.json         # TypeScript配置
│
└── frontend/                 # 前端代码
    ├── public/               # 静态资源
    ├── src/                  # 源代码
    │   ├── components/       # 可复用组件
    │   ├── contexts/         # 上下文
    │   ├── layouts/          # 布局组件
    │   ├── pages/            # 页面组件
    │   ├── App.tsx           # 应用入口
    │   └── index.tsx         # 渲染入口
    ├── package.json          # 依赖管理
    └── tsconfig.json         # TypeScript配置
```

## 开发计划

- [x] 项目基础架构搭建
- [x] 用户认证系统
- [x] 项目管理模块
- [x] 问题风险管理模块
- [ ] 计划管理模块
- [ ] 业务系统管理模块
- [ ] 部门管理模块
- [ ] 合作公司管理模块
- [ ] 权限管理模块
- [ ] 数据导入导出功能
- [ ] 报表和统计功能

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。