// frontend/src/pages/companies/CompanyList.tsx
import { Table, Button, Input, Select, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import { Company } from '../../types';

const CompanyList = () => {
  const { data, isLoading } = useQuery(['companies'], () =>
    api.get('/companies').then(res => res.data)
  );

  const columns = [
    { title: '公司名称', dataIndex: 'name' },
    { title: '公司代码', dataIndex: 'code' },
    { title: '联系人', dataIndex: 'contactName' },
    { title: '状态', dataIndex: 'status' },
    {
      title: '操作',
      render: (_: any, record: Company) => (
        <Space>
          <Button size="small">编辑</Button>
          <Button size="small" danger>禁用</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input.Search placeholder="搜索公司" style={{ width: 200 }} />
        <Select 
          placeholder="状态筛选" 
          style={{ width: 120, marginLeft: 8 }}
          options={[
            { label: '全部', value: '' },
            { label: '活跃', value: 'active' },
            { label: '禁用', value: 'inactive' }
          ]}
        />
        <Button type="primary" style={{ marginLeft: 8 }}>
          新建公司
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
};