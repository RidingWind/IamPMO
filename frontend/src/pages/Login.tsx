import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string; remember: boolean }) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入您的邮箱!' },
            { type: 'email', message: '请输入有效的邮箱地址!' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="邮箱" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入您的密码!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <a style={{ float: 'right' }} href="#">
            忘记密码?
          </a>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text type="secondary">或者</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Link to="/auth/register">
          <Button type="link">注册新账号</Button>
        </Link>
      </div>
    </>
  );
};

export default Login;