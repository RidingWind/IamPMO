import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

// 布局组件
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// 页面组件
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetail from './pages/projects/ProjectDetail';
import ProjectCreate from './pages/projects/ProjectCreate';
import IssueList from './pages/issues/IssueList';
import IssueDetail from './pages/issues/IssueDetail';
import IssueCreate from './pages/issues/IssueCreate';
import NotFound from './pages/NotFound';

// 上下文
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* 认证路由 */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="" element={<Navigate to="/auth/login" replace />} />
            </Route>

            {/* 主应用路由 */}
            <Route path="/" element={<PrivateRoute element={<MainLayout />} />}>
              <Route path="" element={<Dashboard />} />
              
              {/* 项目管理路由 */}
              <Route path="projects">
                <Route path="" element={<ProjectList />} />
                <Route path="create" element={<ProjectCreate />} />
                <Route path=":id" element={<ProjectDetail />} />
              </Route>
              
              {/* 问题/风险管理路由 */}
              <Route path="issues">
                <Route path="" element={<IssueList />} />
                <Route path="create" element={<IssueCreate />} />
                <Route path=":id" element={<IssueDetail />} />
              </Route>
            </Route>

            {/* 404页面 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;