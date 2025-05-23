import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  element: React.ReactElement;
  requiredRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, requiredRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 如果正在加载，显示加载指示器
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.02)'
      }}>
        <Spin size="large" fullscreen tip="加载中..." />
      </div>
    );
  }

  // 如果未认证，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 如果需要特定角色但用户没有所需角色，显示未授权
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>权限不足</h2>
        <p>您没有访问此页面的权限。</p>
      </div>
    );
  }

  // 通过所有检查，渲染组件
  return element;
};

export default PrivateRoute;