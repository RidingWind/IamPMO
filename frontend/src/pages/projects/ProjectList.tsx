import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './projectList.css';

import { Table, Button, Space, Input, Select, Typography, Popconfirm, message, Spin, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'antd/es/table/interface';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const { Title } = Typography;
const { Option } = Select;

// 定义项目类型
interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  startDate: string | null;
  plannedEndDate: string | null;
  actualEndDate: string | null;
  implementer: {
    id: string;
    name: string;
    code: string;
  } | null;
  _count: {
    members: number;
    milestones: number;
    issues: number;
  };
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // 获取项目列表
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      // 使用完整的API路径
      const response = await api.get('/projects');
      
      // 统一处理API响应格式
      let projectsData: Project[] = [];
      
      // 检查标准API响应格式
      if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          projectsData = response.data;
        } else if (Array.isArray(response.data?.items)) {
          projectsData = response.data.items;
        } else if (Array.isArray(response.data?.projects)) {
          projectsData = response.data.projects;
        }
      }
      
      // 如果未获取到数据，记录警告
      if (projectsData.length === 0) {
        console.warn('API返回空项目列表');
      }
      
      setProjects(projectsData);
    } catch (error) {
      console.error('获取项目列表失败:', error);
      message.error('获取项目列表失败，请检查网络连接或API配置');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 使用useMemo优化过滤计算
  const filteredProjects = useMemo(() => {
    return (Array.isArray(projects) ? projects : []).filter(project => {
      const matchesSearch = searchText === '' || 
        project.name.toLowerCase().includes(searchText.toLowerCase()) || 
        project.code.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = statusFilter === null || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchText, statusFilter]); // 只在这些依赖项变化时重新计算
  // 删除项目
  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/projects/${id}`);
      message.success('项目删除成功');
      fetchProjects();
    } catch (error) {
      console.error('删除项目失败:', error);
      message.error('删除项目失败');
    }
  }, [fetchProjects]); // 确保将fetchProjects添加到依赖项中

  // 项目状态标签

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // 这里不需要重复定义filteredProjects，已经在上面定义过了

  // 使用useMemo缓存表格列配置
  const columns: ColumnsType<Project> = useMemo(() => [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <Link to={`/projects/${record.id}`}>{text}</Link>
      ),
      sorter: (a: Project, b: Project) => a.name.localeCompare(b.name),
      width: 200,
    },
    {
      title: '项目编号',
      dataIndex: 'code',
      key: 'code',
      sorter: (a: Project, b: Project) => a.code.localeCompare(b.code),
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '规划中', value: 'PLANNING' },
        { text: '进行中', value: 'ONGOING' },
        { text: '已完成', value: 'COMPLETED' },
        { text: '已暂停', value: 'SUSPENDED' },
        { text: '已取消', value: 'CANCELLED' },
      ],
      onFilter: (value: boolean | Key, record: Project) => record.status === value.toString(),
      width: 100,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => formatDate(date),
      sorter: (a: Project, b: Project) => {
        if (!a.startDate) return -1;
        if (!b.startDate) return 1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      },
      width: 120,
    },
    {
      title: '计划结束日期',
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      render: (date: string) => formatDate(date),
      sorter: (a: Project, b: Project) => {
        if (!a.plannedEndDate) return -1;
        if (!b.plannedEndDate) return 1;
        return new Date(a.plannedEndDate).getTime() - new Date(b.plannedEndDate).getTime();
      },
      width: 120,
    },
    {
      title: '实施方',
      dataIndex: ['implementer', 'name'],
      key: 'implementer',
      render: (_: string, record: Project) => record.implementer?.name || '-',
      width: 150,
    },
    {
      title: '团队成员',
      dataIndex: ['_count', 'members'],
      key: 'members',
      sorter: (a: Project, b: Project) => (a._count?.members || 0) - (b._count?.members || 0),
      width: 100,
    },
    {
      title: '问题/风险',
      dataIndex: ['_count', 'issues'],
      key: 'issues',
      sorter: (a: Project, b: Project) => (a._count?.issues || 0) - (b._count?.issues || 0),
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 100,
      render: (_: unknown, record: Project) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/projects/${record.id}/edit`)}
          />
          {user?.role === 'ADMIN' && (
            <Popconfirm
              title="确定要删除这个项目吗?"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], [navigate, user?.role, handleDelete]); // 添加依赖项

  // 加载状态显示
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // 空数据状态显示
  if (!loading && filteredProjects.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>项目管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate('/projects/create')}
          >
            新建项目
          </Button>
        </div>
        <Empty
          description={searchText || statusFilter ? "没有匹配的项目" : "暂无项目数据"}
        >
          <Button type="primary" onClick={() => navigate('/projects/create')}>
            创建新项目
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>项目管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/projects/create')}
        >
          新建项目
        </Button>
      </div>

      {/* 筛选工具栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input
          placeholder="搜索项目名称或编号"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Select
          placeholder="项目状态"
          style={{ width: 150 }}
          allowClear
          onChange={value => setStatusFilter(value)}
        >
          <Option value="PLANNING">规划中</Option>
          <Option value="ONGOING">进行中</Option>
          <Option value="COMPLETED">已完成</Option>
          <Option value="SUSPENDED">已暂停</Option>
          <Option value="CANCELLED">已取消</Option>
        </Select>
      </div>

      {/* 项目列表表格 */}
      <Table
        columns={columns}
        dataSource={filteredProjects}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        scroll={{ 
          x: 1300,
          y: 500,
          scrollToFirstRowOnChange: true
        }}
        size="middle"
        bordered
        rowClassName={(record) => {
          switch(record.status) {
            case 'COMPLETED': return 'table-row-completed';
            case 'SUSPENDED': return 'table-row-suspended';
            case 'CANCELLED': return 'table-row-cancelled';
            default: return '';
          }
        }}
        sticky
        // virtual属性在某些版本可能不支持，如果出现类型错误可以移除此行
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: [],
          onChange: (selectedRowKeys: React.Key[]) => {
            console.log('selectedRowKeys changed: ', selectedRowKeys);
          },
        }}
      />
    </div>
  );
};

export default ProjectList;