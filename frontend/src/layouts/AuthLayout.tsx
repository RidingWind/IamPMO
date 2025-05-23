import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const { Content } = Layout;
const { Title } = Typography;

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // 如果已经认证，重定向到主页
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 24, background: '#fff', borderRadius: 4, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>PMO工具箱</Title>
            <Title level={4} style={{ fontWeight: 'normal', marginTop: 0 }}>项目管理办公室</Title>
          </div>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;