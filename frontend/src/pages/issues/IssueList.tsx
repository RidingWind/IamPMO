import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

// 定义问题类型
interface Issue {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  dueDate: string | null;
  resolvedAt: string | null;
  project: {
    id: string;
    name: string;
    code: string;
  };
}

const IssueList: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  // 获取问题列表
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/issues');
      setIssues(response.data);
    } catch (error) {
      console.error('获取问题列表失败:', error);
      message.error('获取问题列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // 删除问题
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/issues/${id}`);
      message.success('问题删除成功');
      fetchIssues();
    } catch (error) {
      console.error('删除问题失败:', error);
      message.error('删除问题失败');
    }
  };

  // 问题类型标签
  const getTypeTag = (type: string) => {
    switch (type) {
      case 'RISK':
        return <Tag color="orange">风险</Tag>;
      case 'ISSUE':
        return <Tag color="red">问题</Tag>;
      case 'CHANGE_REQUEST':
        return <Tag color="blue">变更请求</Tag>;
      case 'DEPENDENCY':
        return <Tag color="purple">依赖项</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 问题优先级标签
  const getPriorityTag = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return <Tag color="blue">低</Tag>;
      case 'MEDIUM':
        return <Tag color="orange">中</Tag>;
      case 'HIGH':
        return <Tag color="red">高</Tag>;
      case 'CRITICAL':
        return <Tag color="purple">紧急</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 问题状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Tag color="red">未解决</Tag>;
      case 'IN_PROGRESS':
        return <Tag color="blue">处理中</Tag>;
      case 'RESOLVED':
        return <Tag color="green">已解决</Tag>;
      case 'CLOSED':
        return <Tag color="gray">已关闭</Tag>;
      case 'REOPENED':
        return <Tag color="orange">重新打开</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // 过滤问题
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchText === '' || 
      issue.title.toLowerCase().includes(searchText.toLowerCase()) || 
      issue.description.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesType = typeFilter === null || issue.type === typeFilter;
    const matchesStatus = statusFilter === null || issue.status === statusFilter;
    const matchesPriority = priorityFilter === null || issue.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Issue) => (
        <Link to={`/issues/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '项目',
      dataIndex: ['project', 'name'],
      key: 'project',
      render: (text: string, record: Issue) => (
        <Link to={`/projects/${record.project.id}`}>{text}</Link>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getTypeTag(type),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Issue) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/issues/${record.id}/edit`)}
          />
          <Popconfirm
            title="确定要删除这个问题吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>问题风险管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/issues/create')}
        >
          创建问题
        </Button>
      </div>

      {/* 筛选工具栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input
          placeholder="搜索标题或描述"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
          prefix={<SearchOutlined />}
          allowClear
        />
        <Select
          placeholder="问题类型"
          style={{ width: 150 }}
          allowClear
          onChange={value => setTypeFilter(value)}
        >
          <Option value="RISK">风险</Option>
          <Option value="ISSUE">问题</Option>
          <Option value="CHANGE_REQUEST">变更请求</Option>
          <Option value="DEPENDENCY">依赖项</Option>
        </Select>
        <Select
          placeholder="优先级"
          style={{ width: 150 }}
          allowClear
          onChange={value => setPriorityFilter(value)}
        >
          <Option value="LOW">低</Option>
          <Option value="MEDIUM">中</Option>
          <Option value="HIGH">高</Option>
          <Option value="CRITICAL">紧急</Option>
        </Select>
        <Select
          placeholder="状态"
          style={{ width: 150 }}
          allowClear
          onChange={value => setStatusFilter(value)}
        >
          <Option value="OPEN">未解决</Option>
          <Option value="IN_PROGRESS">处理中</Option>
          <Option value="RESOLVED">已解决</Option>
          <Option value="CLOSED">已关闭</Option>
          <Option value="REOPENED">重新打开</Option>
        </Select>
      </div>

      {/* 问题列表表格 */}
      <Table
        columns={columns}
        dataSource={filteredIssues}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default IssueList;