# PMO工具箱前端

PMO工具箱前端是基于React、TypeScript和Ant Design构建的现代化Web应用。

## 技术栈

- React
- TypeScript
- Ant Design
- React Router
- Axios
- Context API

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

应用将在 http://localhost:3000 运行（默认端口）。

### 构建生产版本

```bash
npm run build
```

构建文件将生成在 `build` 目录中。

## 修改端口号

要修改前端开发服务器的端口号，可以通过以下步骤：

1. 编辑`vite.config.ts`文件
2. 修改`server.port`配置，例如：
   ```typescript
   server: {
     port: 3006,
     // 其他配置...
   }
   ```
3. 重新启动开发服务器

应用将在新指定的端口上运行，例如 http://localhost:3006

## 环境变量配置

可以通过`.env`文件配置环境变量：

```
# API服务器地址
VITE_API_URL=http://localhost:3001/api

# 环境标识
VITE_ENV=development
```

然后在代码中通过`import.meta.env.VITE_API_URL`等方式访问这些变量。

> 注意：在Vite项目中，环境变量必须以`VITE_`开头才能在客户端代码中访问。

> 注意：`.env`文件应添加到`.gitignore`中，不要提交到版本控制系统

## 功能模块

- 用户认证（登录/注册）
- 项目管理
- 问题风险管理
- 计划管理
- 仪表盘

## 项目结构

```
frontend/
├── public/                # 静态资源
├── src/                   # 源代码
│   ├── components/        # 可复用组件
│   ├── contexts/          # 上下文
│   ├── layouts/           # 布局组件
│   ├── pages/             # 页面组件
│   ├── App.tsx            # 应用入口
│   └── index.tsx          # 渲染入口
├── .env                   # 环境变量
├── package.json           # 依赖管理
└── tsconfig.json          # TypeScript配置
```