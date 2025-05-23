import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Select, Typography, message, Spin } from 'antd';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  startDate: string | null;
  plannedEndDate: string | null;
  description: string | null;
  implementerId: string | null;
}

const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectResponse, companiesResponse] = await Promise.all([
          axios.get(`/api/projects/${id}`),
          axios.get('/api/companies')
        ]);
        
        setProject(projectResponse.data);
        setCompanies(companiesResponse.data);
        form.setFieldsValue({
          ...projectResponse.data,
          startDate: projectResponse.data.startDate ? dayjs(projectResponse.data.startDate) : null,
          plannedEndDate: projectResponse.data.plannedEndDate ? dayjs(projectResponse.data.plannedEndDate) : null,
        });
      } catch (error) {
        console.error('获取数据失败:', error);
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        plannedEndDate: values.plannedEndDate ? values.plannedEndDate.toISOString() : null,
      };
      
      await axios.put(`/api/projects/${id}`, formattedValues);
      message.success('项目更新成功');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('更新项目失败:', error);
      message.error('更新项目失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !project) {
    return <div>加载中...</div>;
  }

  if (!project) {
    return <div>项目不存在或已被删除</div>;
  }

  return (
    <div>
      <Title level={2}>编辑项目</Title>
      
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
            保存修改
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(`/projects/${id}`)}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProjectEdit;