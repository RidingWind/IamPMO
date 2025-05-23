import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Descriptions, Card, Button, Tag, Space, 
  Spin, Popconfirm, message, Form, Input, Select, DatePicker, Modal
} from 'antd';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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
  assigneeId: string | null;
  reporterId: string | null;
}

// 定义用户类型
interface User {
  id: string;
  name: string;
  email: string;
}

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [form] = Form.useForm();

  // 获取问题详情
  const fetchIssueDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/issues/${id}`);
      setIssue(response.data);
    } catch (error) {
      console.error('获取问题详情失败:', error);
      message.error('获取问题详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchIssueDetail();
      fetchUsers();
    }
  }, [id]);

  // 删除问题
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/issues/${id}`);
      message.success('问题删除成功');
      navigate('/issues');
    } catch (error) {
      console.error('删除问题失败:', error);
      message.error('删除问题失败');
    }
  };

  // 打开编辑模态框
  const showEditModal = () => {
    if (issue) {
      form.setFieldsValue({
        title: issue.title,
        description: issue.description,
        type: issue.type,
        priority: issue.priority,
        status: issue.status,
        dueDate: issue.dueDate ? moment(issue.dueDate) : undefined,
        assigneeId: issue.assigneeId,
      });
      setEditModalVisible(true);
    }
  };

  // 更新问题
  const handleUpdate = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      
      await axios.put(`/api/issues/${id}`, formattedValues);
      message.success('问题更新成功');
      setEditModalVisible(false);
      fetchIssueDetail();
    } catch (error) {
      console.error('更新问题失败:', error);
      message.error('更新问题失败');
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

  // 获取用户名称
  const getUserName = (userId: string | null) => {
    if (!userId) return '-';
    const user = users.find(u => u.id === userId);
    return user ? user.name : '-';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>问题不存在或已被删除</Title>
        <Button type="primary" onClick={() => navigate('/issues')}>
          返回问题列表
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/issues')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>{issue.title}</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={showEditModal}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个问题吗?"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {/* 问题详情 */}
      <Card title="问题详情" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="标题">{issue.title}</Descriptions.Item>
          <Descriptions.Item label="所属项目">{issue.project.name} ({issue.project.code})</Descriptions.Item>
          <Descriptions.Item label="类型">{getTypeTag(issue.type)}</Descriptions.Item>
          <Descriptions.Item label="优先级">{getPriorityTag(issue.priority)}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(issue.status)}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatDate(issue.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="截止日期">{formatDate(issue.dueDate)}</Descriptions.Item>
          <Descriptions.Item label="解决时间">{formatDate(issue.resolvedAt)}</Descriptions.Item>
          <Descriptions.Item label="负责人">{getUserName(issue.assigneeId)}</Descriptions.Item>
          <Descriptions.Item label="报告人">{getUserName(issue.reporterId)}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {issue.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 编辑模态框 */}
      <Modal
        title="编辑问题"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择类型">
              <Option value="RISK">风险</Option>
              <Option value="ISSUE">问题</Option>
              <Option value="CHANGE_REQUEST">变更请求</Option>
              <Option value="DEPENDENCY">依赖项</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Option value="LOW">低</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="HIGH">高</Option>
              <Option value="CRITICAL">紧急</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="OPEN">未解决</Option>
              <Option value="IN_PROGRESS">处理中</Option>
              <Option value="RESOLVED">已解决</Option>
              <Option value="CLOSED">已关闭</Option>
              <Option value="REOPENED">重新打开</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dueDate"
            label="截止日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="assigneeId"
            label="负责人"
          >
            <Select placeholder="请选择负责人" allowClear>
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              更新
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setEditModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IssueDetail;