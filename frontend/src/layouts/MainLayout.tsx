import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  AlertOutlined,
  TeamOutlined,
  BankOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['dashboard'];
    if (path.startsWith('/projects')) return ['projects'];
    if (path.startsWith('/issues')) return ['issues'];
    if (path.startsWith('/departments')) return ['departments'];
    if (path.startsWith('/companies')) return ['companies'];
    if (path.startsWith('/systems')) return ['systems'];
    if (path.startsWith('/settings')) return ['settings'];
    return [];
  };

  // 用户下拉菜单
  const userMenu = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/auth/login');
      },
    },
  ]


  return (
    <Layout style={{ minHeight: '100vh' }}>
        {/* 可收缩的侧边栏 */}
        <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          zIndex: 1,
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)'
        }}
      >
                {/* 侧边栏顶部logo/标题区域 */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#001529',
          color: 'white'
        }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            {collapsed ? 'PMO' : 'PMO工具箱'}
          </Title>
        </div>
        
        {/* 用户信息区域 */}
        <div style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || '用户'}</span>
              </Space>
            </Dropdown>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: '仪表盘',
              onClick: () => navigate('/'),
            },
            {
              key: 'projects',
              icon: <ProjectOutlined />,
              label: '项目管理',
              onClick: () => navigate('/projects'),
            },
            {
              key: 'issues',
              icon: <AlertOutlined />,
              label: '问题风险',
              onClick: () => navigate('/issues'),
            },
            {
              key: 'departments',
              icon: <BankOutlined />,
              label: '部门管理',
              onClick: () => navigate('/departments'),
            },
            {
              key: 'companies',
              icon: <TeamOutlined />,
              label: '合作公司',
              onClick: () => navigate('/companies'),
            },
            {
              key: 'systems',
              icon: <AppstoreOutlined />,
              label: '业务系统',
              onClick: () => navigate('/systems'),
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: '系统设置',
              onClick: () => navigate('/settings'),
            },
          ]}
        />
      </Sider>
      
 {/* 主内容区域 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
        {/* 顶部导航栏 */}
        <Header style={{ 
          padding: 0,
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          display: 'flex',
          alignItems: 'center'
        }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: { fontSize: '18px', marginLeft: 16 }
          })}
        </Header>

        {/* 页面内容 */}
        <Content style={{
          margin: '24px 16px',
          padding: '24px 16[c',
          background: '#fff',
          minHeight: 280,
          overflow: 'initial'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;