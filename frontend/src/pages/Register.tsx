import React, { useState } from 'react';
import { Form, Input, Button, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { name: string; email: string; password: string; confirmPassword: string }) => {
    try {
      setLoading(true);
      await register(values.name, values.email, values.password);
      navigate('/');
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form
        name="register"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: '请输入您的姓名!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="姓名" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入您的邮箱!' },
            { type: 'email', message: '请输入有效的邮箱地址!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="邮箱" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入您的密码!' },
            { min: 6, message: '密码至少需要6个字符!' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认您的密码!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            注册
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text type="secondary">或者</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Link to="/auth/login">
          <Button type="link">已有账号? 登录</Button>
        </Link>
      </div>
    </>
  );
};

export default Register;