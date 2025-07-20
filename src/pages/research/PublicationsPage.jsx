import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Typography, Space, message, Spin } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { researchService } from '../../services';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const { Title } = Typography;

const PublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setLoading(true);
    try {
      let params = {};
      // If researcher, filter by submitted_by/current user
      if (user && user.role === 'researcher') {
        params = { submitted_by: user.id };
      }
      const response = await researchService.getPublications(params);
      setPublications(response.results || []);
    } catch (error) {
      message.error('Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/app/research/publications/${record.id}`)}>{text}</Button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'published' ? 'green' : status === 'pending' ? 'orange' : 'red'}>{status}</Tag>,
    },
    {
      title: 'Authors',
      dataIndex: 'authors',
      key: 'authors',
      render: (authors) => authors?.map(a => a.name || a.user?.full_name).join(', '),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        // Only allow edit/delete for own publications if researcher
        const isOwner = user && user.role === 'researcher' ? record.submitted_by === user.id : true;
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => navigate(`/app/research/publications/${record.id}`)} />
            {isOwner && <Button icon={<EditOutlined />} onClick={() => navigate(`/app/research/publications/${record.id}/edit`)} />}
            {isOwner && <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />}
          </Space>
        );
      },
    },
  ];

  const handleDelete = async (id) => {
    try {
      await researchService.deletePublication(id);
      message.success('Publication deleted');
      loadPublications();
    } catch (error) {
      message.error('Failed to delete publication');
    }
  };

  return (
    <div>
      <Title level={2}>Publications</Title>
      <Card>
        {/* Only allow researchers to add publication if permitted */}
        {user && (user.role === 'admin' || user.role === 'researcher') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/research/publications/new')} style={{ marginBottom: 16 }}>
            Add Publication
          </Button>
        )}
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={publications} rowKey="id" />
        </Spin>
      </Card>
    </div>
  );
};

export default PublicationsPage;
