import React, { useState, useEffect } from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Form, Input, Button, DatePicker, Select, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 定义公司类型
interface Company {
  id: string;
  name: string;
  code: string;
}

// 定义表单字段类型
interface ProjectFormValues {
  name: string;
  code: string;
  status: string;
  implementerId?: string;
  startDate?: moment.Moment;
  plannedEndDate?: moment.Moment;
  description?: string;
}

const ProjectCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const navigate = useNavigate();

  // 获取公司列表
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const result = await api.get('/companies');
        // 处理多种可能的响应格式
        let companiesData = [];
        if (Array.isArray(result)) {
          companiesData = result;
        } else if (result && Array.isArray(result.data)) {
          companiesData = result.data;
        } else if (result && result.data && Array.isArray(result.data.companies)) {
          companiesData = result.data.companies;
        }
        setCompanies(companiesData);
      } catch (error) {
        console.error('获取公司列表失败:', error);
      }
    };
    fetchCompanies();
  }, []);

  const onFinish = async (values: ProjectFormValues) => {
    try {
      setLoading(true);

      // 检查用户权限
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
        message.error('权限不足，无法创建项目');
        return;
      }
      
      // 格式化日期
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        plannedEndDate: values.plannedEndDate ? values.plannedEndDate.toISOString() : undefined,
      };
      
      await api.post('/projects', formattedValues);
      message.success('项目创建成功');
      navigate('/projects');
    } catch (error) {
      console.error('创建项目失败:', error);
      message.error('创建项目失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>创建新项目</Title>
      
      <ErrorBoundary fallback={
        <div style={{ padding: 24 }}>
          <h2>表单加载失败</h2>
          <p>无法加载项目创建表单，请刷新页面重试</p>
        </div>
      }>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 800 }}
        >
        <Form.Item
          name="name"
          label="项目名称"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>
        
        <Form.Item
          name="code"
          label="项目编号"
          rules={[{ required: true, message: '请输入项目编号' }]}
        >
          <Input placeholder="请输入项目编号" />
        </Form.Item>
        
        <Form.Item
          name="status"
          label="项目状态"
          initialValue="PLANNING"
          rules={[{ required: true, message: '请选择项目状态' }]}
        >
          <Select placeholder="请选择项目状态">
            <Option value="PLANNING">规划中</Option>
            <Option value="ONGOING">进行中</Option>
            <Option value="COMPLETED">已完成</Option>
            <Option value="SUSPENDED">已暂停</Option>
            <Option value="CANCELLED">已取消</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="implementerId"
          label="项目实施方"
        >
          <Select placeholder="请选择项目实施方" allowClear>
            {companies.map(company => (
              <Option key={company.id} value={company.id}>
                {company.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="startDate"
          label="项目启动时间"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="plannedEndDate"
          label="计划上线时间"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="项目描述"
        >
          <TextArea rows={4} placeholder="请输入项目描述" />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建项目
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate('/projects')}>
            取消
          </Button>
        </Form.Item>
              </Form>
            </ErrorBoundary>
            </div>
  );
};

export default ProjectCreate;