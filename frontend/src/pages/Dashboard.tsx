import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, List, Typography, Tag, Spin } from 'antd';
import { ProjectOutlined, AlertOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

// 定义类型
interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
}

interface Issue {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  projectId: string;
  project?: {
    name: string;
  };
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    planning: 0
  });
  const [issueStats, setIssueStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 获取项目统计
        const projectsResponse = await axios.get('/api/projects');
        const projects = projectsResponse.data;
        
        setProjectStats({
          total: projects.length,
          ongoing: projects.filter((p: Project) => p.status === 'ONGOING').length,
          completed: projects.filter((p: Project) => p.status === 'COMPLETED').length,
          planning: projects.filter((p: Project) => p.status === 'PLANNING').length
        });
        
        // 获取最近的项目
        setRecentProjects(projects.slice(0, 5));
        
        // 获取问题统计
        const issuesResponse = await axios.get('/api/issues');
        const issues = issuesResponse.data;
        
        setIssueStats({
          total: issues.length,
          open: issues.filter((i: Issue) => i.status === 'OPEN').length,
          inProgress: issues.filter((i: Issue) => i.status === 'IN_PROGRESS').length,
          resolved: issues.filter((i: Issue) => i.status === 'RESOLVED').length
        });
        
        // 获取最近的问题
        setRecentIssues(issues.slice(0, 5));
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 项目状态标签
  const getProjectStatusTag = (status: string) => {
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

  // 问题优先级标签
  const getIssuePriorityTag = (priority: string) => {
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
  const getIssueStatusTag = (status: string) => {
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="项目总数"
              value={projectStats.total}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中项目"
              value={projectStats.ongoing}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="问题总数"
              value={issueStats.total}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已解决问题"
              value={issueStats.resolved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近项目和问题 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近项目" extra={<Link to="/projects">查看全部</Link>}>
            <List
              dataSource={recentProjects}
              renderItem={(item) => (
                <List.Item
                  actions={[getProjectStatusTag(item.status)]}
                >
                  <List.Item.Meta
                    title={<Link to={`/projects/${item.id}`}>{item.name}</Link>}
                    description={`项目编号: ${item.code}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无项目' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近问题" extra={<Link to="/issues">查看全部</Link>}>
            <List
              dataSource={recentIssues}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    getIssuePriorityTag(item.priority),
                    getIssueStatusTag(item.status)
                  ]}
                >
                  <List.Item.Meta
                    title={<Link to={`/issues/${item.id}`}>{item.title}</Link>}
                    description={item.project ? `项目: ${item.project.name}` : ''}
                  />
                </List.Item>
              )}
              locale={{ emptyText: '暂无问题' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;