# PMO工具箱前端

PMO工具箱前端是基于React、TypeScript和Ant Design构建的现代化Web应用。

## 技术栈

- React
- TypeScript
- Ant Design
- React Router
- Axios
- Context API

## 项目结构

```
frontend/
├── public/                # 静态资源
├── src/                   # 源代码
│   ├── components/        # 可复用组件
│   │   └── PrivateRoute.tsx  # 私有路由组件
│   ├── contexts/          # 上下文
│   │   └── AuthContext.tsx   # 认证上下文
│   ├── layouts/           # 布局组件
│   │   ├── MainLayout.tsx    # 主布局
│   │   └── AuthLayout.tsx    # 认证布局
│   ├── pages/             # 页面组件
│   │   ├── Dashboard.tsx     # 仪表盘
│   │   ├── Login.tsx         # 登录页
│   │   ├── Register.tsx      # 注册页
│   │   ├── NotFound.tsx      # 404页面
│   │   ├── projects/         # 项目管理页面
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   └── ProjectCreate.tsx
│   │   └── issues/           # 问题风险管理页面
│   │       ├── IssueList.tsx
│   │       ├── IssueDetail.tsx
│   │       └── IssueCreate.tsx
│   ├── App.tsx            # 应用入口
│   └── index.tsx          # 渲染入口
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

### 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 运行。

### 构建生产版本

```bash
npm run build
```

构建文件将生成在 `build` 目录中。

## 功能模块

### 认证模块

- 用户登录
- 用户注册
- 权限控制

### 项目管理模块

- 项目列表
- 项目详情
- 创建/编辑项目
- 项目成员管理

### 问题风险管理模块

- 问题列表
- 问题详情
- 创建/编辑问题
- 问题状态跟踪

### 计划管理模块

- 里程碑计划
- 详细计划
- 计划进度跟踪

## 开发指南

### 添加新页面

1. 在`src/pages`目录下创建新的页面组件
2. 在`App.tsx`中添加路由配置
3. 如果需要，更新导航菜单

### 添加新组件

1. 在`src/components`目录下创建新的组件
2. 导入并在相应页面中使用

### 添加新上下文

1. 在`src/contexts`目录下创建新的上下文
2. 在`App.tsx`或相应组件中提供上下文

## 状态管理

项目使用React Context API进行状态管理。主要的上下文包括：

- `AuthContext`: 管理用户认证状态、登录、注册和登出功能

## API集成

项目使用Axios进行API调用。API基础URL配置在`src/contexts/AuthContext.tsx`中：

```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

## 样式和主题

项目使用Ant Design组件库，并配置了中文语言包：

```typescript
// App.tsx
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

// ...

<ConfigProvider locale={zhCN}>
  {/* 应用内容 */}
</ConfigProvider>
```

## 路由保护

使用`PrivateRoute`组件保护需要认证的路由：

```typescript
// App.tsx
<Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
  {/* 受保护的路由 */}
</Route>
```

## 环境变量

可以通过`.env`文件配置环境变量：

```
REACT_APP_API_URL=http://localhost:3001/api
```

然后在代码中通过`process.env.REACT_APP_API_URL`访问。