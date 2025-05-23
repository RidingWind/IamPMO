// frontend/src/pages/departments/DepartmentTree.tsx
import { Tree, Button, Dropdown } from 'antd';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

const DepartmentTree = () => {
  const { data } = useQuery(['departments'], () =>
    api.get('/departments/tree').then(res => res.data)
  );

  const renderTitle = (node: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{node.name}</span>
      <Dropdown menu={{
        items: [
          { key: 'add', label: '添加子部门' },
          { key: 'edit', label: '编辑' },
          { key: 'delete', label: '删除' }
        ]
      }}>
        <Button type="text" size="small">操作</Button>
      </Dropdown>
    </div>
  );

  return (
    <div>
      <Button type="primary" style={{ marginBottom: 16 }}>
        新建顶级部门
      </Button>
      <Tree
        treeData={data?.map(item => ({
          title: renderTitle(item),
          key: item.id,
          children: item.children
        }))}
        defaultExpandAll
      />
    </div>
  );
};