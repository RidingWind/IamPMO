import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 定义项目类型
interface Project {
  id: string;
  name: string;
  code: string;
}

// 定义用户类型
interface User {
  id: string;
  name: string;
  email: string;
}

const IssueCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  // 获取项目列表和用户列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, usersResponse] = await Promise.all([
          axios.get('/api/projects'),
          axios.get('/api/users')
        ]);
        
        setProjects(projectsResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('获取数据失败:', error);
        message.error('获取数据失败');
      }
    };

    fetchData();
  }, []);

  // 提交表单
  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // 格式化日期
      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      
      await axios.post('/api/issues', formattedValues);
      message.success('问题创建成功');
      navigate('/issues');
    } catch (error) {
      console.error('创建问题失败:', error);
      message.error('创建问题失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>创建问题/风险</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 800 }}
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
          name="projectId"
          label="所属项目"
          rules={[{ required: true, message: '请选择项目' }]}
        >
          <Select placeholder="请选择项目">
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.name} ({project.code})
              </Option>
            ))}
          </Select>
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
          initialValue="OPEN"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            <Option value="OPEN">未解决</Option>
            <Option value="IN_PROGRESS">处理中</Option>
            <Option value="RESOLVED">已解决</Option>
            <Option value="CLOSED">已关闭</Option>
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
          <Button type="primary" htmlType="submit" loading={loading}>
            创建问题
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/issues')}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default IssueCreate;