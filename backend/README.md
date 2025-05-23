# PMO工具箱后端

PMO工具箱后端是基于Node.js、Express和TypeScript构建的RESTful API服务。

## 技术栈

- Node.js
- Express
- TypeScript
- Prisma ORM
- JWT认证
- SQLite (开发环境) / PostgreSQL/MySQL (生产环境)

## 项目结构

```
backend/
├── prisma/                # Prisma模型和迁移
│   └── schema.prisma      # 数据库模型定义
├── src/                   # 源代码
│   ├── index.ts           # 应用入口
│   ├── middleware/        # 中间件
│   │   └── auth.middleware.ts  # 认证中间件
│   └── routes/            # API路由
│       ├── auth.routes.ts      # 认证路由
│       ├── project.routes.ts   # 项目管理路由
│       ├── issue.routes.ts     # 问题风险管理路由
│       └── ...
├── .env                   # 环境变量
├── package.json           # 依赖管理
└── tsconfig.json          # TypeScript配置
```

## 安装和运行

### 前提条件

- Node.js (v14+)
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 数据库设置

```bash
# 初始化Prisma并创建数据库
npx prisma migrate dev --name init

# 生成Prisma客户端
npx prisma generate
```

### 启动服务

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## API文档

### 认证API

#### 注册用户
- **POST** `/api/auth/register`
- 请求体:
  ```json
  {
    "name": "用户名",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

#### 用户登录
- **POST** `/api/auth/login`
- 请求体:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### 项目管理API

#### 获取所有项目
- **GET** `/api/projects`
- 需要认证: 是

#### 获取单个项目
- **GET** `/api/projects/:id`
- 需要认证: 是

#### 创建项目
- **POST** `/api/projects`
- 需要认证: 是
- 需要角色: ADMIN, MANAGER
- 请求体:
  ```json
  {
    "name": "项目名称",
    "code": "项目编号",
    "status": "PLANNING",
    "startDate": "2023-01-01T00:00:00Z",
    "plannedEndDate": "2023-12-31T00:00:00Z",
    "description": "项目描述",
    "implementerId": "实施方ID"
  }
  ```

#### 更新项目
- **PUT** `/api/projects/:id`
- 需要认证: 是
- 需要角色: ADMIN, MANAGER

#### 删除项目
- **DELETE** `/api/projects/:id`
- 需要认证: 是
- 需要角色: ADMIN

### 问题风险管理API

#### 获取所有问题
- **GET** `/api/issues`
- 需要认证: 是

#### 获取单个问题
- **GET** `/api/issues/:id`
- 需要认证: 是

#### 创建问题
- **POST** `/api/issues`
- 需要认证: 是
- 请求体:
  ```json
  {
    "title": "问题标题",
    "description": "问题描述",
    "type": "ISSUE",
    "priority": "HIGH",
    "projectId": "项目ID",
    "dueDate": "2023-06-30T00:00:00Z",
    "assigneeId": "负责人ID"
  }
  ```

#### 更新问题
- **PUT** `/api/issues/:id`
- 需要认证: 是

#### 删除问题
- **DELETE** `/api/issues/:id`
- 需要认证: 是

## 环境变量

创建一个`.env`文件，包含以下变量:

```
# 数据库连接
DATABASE_URL="file:./dev.db"

# JWT密钥
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="1d"

# 服务器配置
PORT=3001
NODE_ENV=development
```

## 开发指南

### 添加新的API路由

1. 在`src/routes`目录下创建新的路由文件
2. 在`src/index.ts`中导入并使用新路由
3. 实现路由处理逻辑

### 添加新的数据模型

1. 在`prisma/schema.prisma`中定义新模型
2. 运行`npx prisma migrate dev --name add_new_model`创建迁移
3. 实现相应的API路由