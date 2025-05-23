import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Descriptions, Card, Tabs, Table, Button, Tag, Space, 
  List, Avatar, Spin, Popconfirm, message, Modal, Form, Input, Select, DatePicker
} from 'antd';
import { 
  EditOutlined, DeleteOutlined, PlusOutlined, TeamOutlined, 
  AlertOutlined, ScheduleOutlined, UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// 定义项目类型
interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  startDate: string | null;
  plannedEndDate: string | null;
  actualEndDate: string | null;
  description: string | null;
  implementer: {
    id: string;
    name: string;
  } | null;
  members: ProjectMember[];
  milestones: Milestone[];
  issues: Issue[];
  businessSystems: BusinessSystem[];
}

// 定义项目成员类型
interface ProjectMember {
  id: string;
  role: string;
  joinDate: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// 定义里程碑类型
interface Milestone {
  id: string;
  name: string;
  plannedDate: string;
  actualDate: string | null;
  status: string;
  description: string | null;
  detailPlans: DetailPlan[];
}

// 定义详细计划类型
interface DetailPlan {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string | null;
}

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
}

// 定义业务系统类型
interface BusinessSystem {
  id: string;
  name: string;
  code: string;
  purpose: string | null;
  isProduct: boolean;
  department: string | null;
}

// 定义用户类型
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  
  // 模态框状态
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [milestoneModalVisible, setMilestoneModalVisible] = useState(false);
  
  // 表单实例
  const [memberForm] = Form.useForm();
  const [issueForm] = Form.useForm();
  const [milestoneForm] = Form.useForm();
  
  // 用户列表
  const [users, setUsers] = useState<User[]>([]);

  // 获取项目详情
  const fetchProjectDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('获取项目详情失败:', error);
      message.error('获取项目详情失败');
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
      fetchProjectDetail();
      fetchUsers();
    }
  }, [id]);

  // 添加项目成员
  const handleAddMember = async (values: any) => {
    try {
      await axios.post(`/api/projects/${id}/members`, values);
      message.success('添加项目成员成功');
      setMemberModalVisible(false);
      memberForm.resetFields();
      fetchProjectDetail();
    } catch (error) {
      console.error('添加项目成员失败:', error);
      message.error('添加项目成员失败');
    }
  };

  // 移除项目成员
  const handleRemoveMember = async (memberId: string) => {
    try {
      await axios.delete(`/api/projects/${id}/members/${memberId}`);
      message.success('移除项目成员成功');
      fetchProjectDetail();
    } catch (error) {
      console.error('移除项目成员失败:', error);
      message.error('移除项目成员失败');
    }
  };

  // 创建问题
  const handleCreateIssue = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        projectId: id,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      
      await axios.post('/api/issues', formattedValues);
      message.success('创建问题成功');
      setIssueModalVisible(false);
      issueForm.resetFields();
      fetchProjectDetail();
    } catch (error) {
      console.error('创建问题失败:', error);
      message.error('创建问题失败');
    }
  };

  // 创建里程碑
  const handleCreateMilestone = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        projectId: id,
        plannedDate: values.plannedDate.toISOString(),
      };
      
      await axios.post('/api/plans/milestones', formattedValues);
      message.success('创建里程碑成功');
      setMilestoneModalVisible(false);
      milestoneForm.resetFields();
      fetchProjectDetail();
    } catch (error) {
      console.error('创建里程碑失败:', error);
      message.error('创建里程碑失败');
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

  // 里程碑状态标签
  const getMilestoneStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Tag color="blue">待完成</Tag>;
      case 'COMPLETED':
        return <Tag color="green">已完成</Tag>;
      case 'DELAYED':
        return <Tag color="orange">已延期</Tag>;
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>项目不存在或已被删除</Title>
        <Button type="primary" onClick={() => navigate('/projects')}>
          返回项目列表
        </Button>
      </div>
    );
  }

  // 项目成员表格列
  const memberColumns = [
    {
      title: '姓名',
      dataIndex: ['user', 'name'],
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '加入时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ProjectMember) => (
        <Popconfirm
          title="确定要移除此成员吗?"
          onConfirm={() => handleRemoveMember(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // 问题表格列
  const issueColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Issue) => (
        <a onClick={() => navigate(`/issues/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          'RISK': '风险',
          'ISSUE': '问题',
          'CHANGE_REQUEST': '变更请求',
          'DEPENDENCY': '依赖项',
        };
        return typeMap[type] || type;
      },
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
      render: (status: string) => getIssueStatusTag(status),
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
  ];

  // 里程碑表格列
  const milestoneColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '计划日期',
      dataIndex: 'plannedDate',
      key: 'plannedDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '实际日期',
      dataIndex: 'actualDate',
      key: 'actualDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getMilestoneStatusTag(status),
    },
    {
      title: '详细计划数',
      dataIndex: 'detailPlans',
      key: 'detailPlans',
      render: (plans: DetailPlan[]) => plans.length,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Milestone) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/plans/milestones/${record.id}`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>{project.name}</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            编辑项目
          </Button>
          <Button 
            onClick={() => navigate('/projects')}
          >
            返回列表
          </Button>
        </Space>
      </div>

      {/* 项目基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
          <Descriptions.Item label="项目编号">{project.code}</Descriptions.Item>
          <Descriptions.Item label="项目状态">{getStatusTag(project.status)}</Descriptions.Item>
          <Descriptions.Item label="项目实施方">{project.implementer?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="项目启动时间">{formatDate(project.startDate)}</Descriptions.Item>
          <Descriptions.Item label="计划上线时间">{formatDate(project.plannedEndDate)}</Descriptions.Item>
          <Descriptions.Item label="实际上线时间">{formatDate(project.actualEndDate)}</Descriptions.Item>
          <Descriptions.Item label="项目描述" span={2}>
            {project.description || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 项目详细信息标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={<span><TeamOutlined />项目成员</span>} 
          key="1"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4}>项目成员</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setMemberModalVisible(true)}
            >
              添加成员
            </Button>
          </div>
          <Table 
            columns={memberColumns} 
            dataSource={project.members} 
            rowKey="id" 
            pagination={false}
          />
        </TabPane>
        
        <TabPane 
          tab={<span><AlertOutlined />问题风险</span>} 
          key="2"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4}>问题风险</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setIssueModalVisible(true)}
            >
              创建问题
            </Button>
          </div>
          <Table 
            columns={issueColumns} 
            dataSource={project.issues} 
            rowKey="id" 
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
        
        <TabPane 
          tab={<span><ScheduleOutlined />项目计划</span>} 
          key="3"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4}>里程碑计划</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setMilestoneModalVisible(true)}
            >
              创建里程碑
            </Button>
          </div>
          <Table 
            columns={milestoneColumns} 
            dataSource={project.milestones} 
            rowKey="id" 
            pagination={false}
            expandable={{
              expandedRowRender: record => (
                <List
                  header={<div>详细计划</div>}
                  bordered
                  dataSource={record.detailPlans}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button type="link" icon={<EditOutlined />} key="edit" />
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={`${formatDate(item.startDate)} 至 ${formatDate(item.endDate)}`}
                      />
                      <div>{item.status}</div>
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无详细计划' }}
                />
              ),
            }}
          />
        </TabPane>
      </Tabs>

      {/* 添加成员模态框 */}
      <Modal
        title="添加项目成员"
        visible={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
      >
        <Form
          form={memberForm}
          layout="vertical"
          onFinish={handleAddMember}
        >
          <Form.Item
            name="userId"
            label="选择用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select placeholder="请选择用户">
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="role"
            label="项目角色"
            rules={[{ required: true, message: '请输入项目角色' }]}
          >
            <Input placeholder="如：项目经理、开发人员、测试人员等" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              添加
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setMemberModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建问题模态框 */}
      <Modal
        title="创建问题/风险"
        visible={issueModalVisible}
        onCancel={() => setIssueModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={issueForm}
          layout="vertical"
          onFinish={handleCreateIssue}
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
                  {user.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setIssueModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建里程碑模态框 */}
      <Modal
        title="创建里程碑"
        visible={milestoneModalVisible}
        onCancel={() => setMilestoneModalVisible(false)}
        footer={null}
      >
        <Form
          form={milestoneForm}
          layout="vertical"
          onFinish={handleCreateMilestone}
        >
          <Form.Item
            name="name"
            label="里程碑名称"
            rules={[{ required: true, message: '请输入里程碑名称' }]}
          >
            <Input placeholder="请输入里程碑名称" />
          </Form.Item>
          
          <Form.Item
            name="plannedDate"
            label="计划日期"
            rules={[{ required: true, message: '请选择计划日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            initialValue="PENDING"
          >
            <Select>
              <Option value="PENDING">待完成</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="DELAYED">已延期</Option>
              <Option value="CANCELLED">已取消</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setMilestoneModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;