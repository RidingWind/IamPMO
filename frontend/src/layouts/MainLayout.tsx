import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
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
  const userMenu = (
    <Menu
      items={[
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
          type: 'divider',
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
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Title level={5} style={{ color: 'white', margin: 0 }}>
            {collapsed ? 'PMO' : 'PMO工具箱'}
          </Title>
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
      
      {/* 主内容区 */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        {/* 头部 */}
        <Header style={{ padding: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ marginRight: 20 }}>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name || '用户'}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        
        {/* 内容区 */}
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;