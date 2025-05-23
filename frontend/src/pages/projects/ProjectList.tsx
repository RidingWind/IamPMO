import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

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
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('获取项目列表失败:', error);
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 删除项目
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/projects/${id}`);
      message.success('项目删除成功');
      fetchProjects();
    } catch (error) {
      console.error('删除项目失败:', error);
      message.error('删除项目失败');
    }
  };

  // 项目状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return <Tag color="blue">规划中</Tag>;
      case 'ONGOING':
        return <Tag color="green">进行中</Tag>;
      case 'COMPLETED':
        return <Tag color="gray">已完成</Tag>;
      case 'SUSPENDED':
        return <Tag color="orange">已暂停</Tag>;
      case 'CANCELLED':
        return <Tag color="red">已取消</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // 过滤项目
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchText === '' || 
      project.name.toLowerCase().includes(searchText.toLowerCase()) || 
      project.code.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === null || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 表格列定义
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <Link to={`/projects/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '项目编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '计划结束日期',
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '实施方',
      dataIndex: ['implementer', 'name'],
      key: 'implementer',
      render: (text: string, record: Project) => record.implementer?.name || '-',
    },
    {
      title: '团队成员',
      dataIndex: ['_count', 'members'],
      key: 'members',
    },
    {
      title: '问题/风险',
      dataIndex: ['_count', 'issues'],
      key: 'issues',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Project) => (
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
  ];

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
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ProjectList;