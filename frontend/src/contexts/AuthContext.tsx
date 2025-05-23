import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { message } from 'antd';

// API基础URL
const API_BASE_URL = 'http://localhost:3001/api';

// 用户类型定义
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// 认证上下文类型定义
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从本地存储加载用户信息和令牌
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      
      // 配置axios默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setIsLoading(false);
  }, []);

  // 登录函数
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      // 保存到状态
      setUser(userData);
      setToken(newToken);
      
      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', newToken);
      
      // 配置axios默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      message.success('登录成功');
    } catch (error: any) {
      console.error('登录失败:', error);
      message.error(error.response?.data?.message || '登录失败，请检查您的凭据');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      // 保存到状态
      setUser(userData);
      setToken(newToken);
      
      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', newToken);
      
      // 配置axios默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      message.success('注册成功');
    } catch (error: any) {
      console.error('注册失败:', error);
      message.error(error.response?.data?.message || '注册失败，请稍后再试');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    // 清除状态
    setUser(null);
    setToken(null);
    
    // 清除本地存储
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // 清除axios默认请求头
    delete axios.defaults.headers.common['Authorization'];
    
    message.success('已退出登录');
  };

  // 提供上下文值
  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，用于访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};