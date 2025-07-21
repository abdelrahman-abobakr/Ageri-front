import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Typography, Space, message, Spin, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { researchService } from '../../services';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
// import 'tailwindcss/tailwind.css';

const { Title } = Typography;

const PublicationsPage = () => {
  const { t } = useTranslation();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadPublications();
  }, [user]);

  const loadPublications = async () => {
    setLoading(true);
    try {
      console.log('Fetching publications for user:', user?.id, 'is_admin:', user?.is_admin);
      const response = await (user && user.is_admin ? researchService.getPublications() : researchService.getMyPublications());
      console.log('Publications response:', response);
      setPublications(response.results || []);
    } catch (error) {
      console.error('Failed to load publications:', error.response?.data || error.message);
      message.error(t('failed_to_load_publications'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    console.log('Attempting to delete publication with ID:', id);
    Modal.confirm({
      title: t('confirm_delete'),
      content: t('are_you_sure_delete_publication'),
      okText: t('delete'),
      okType: 'danger',
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          await researchService.deletePublication(id);
          message.success(t('publication_deleted_successfully'));
          loadPublications();
        } catch (error) {
          console.error('Failed to delete publication:', error.response?.data || error.message);
          message.error(t('failed_to_delete_publication'));
        }
      },
    });
  };

  const columns = [
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <Button type="link" onClick={() => navigate(`/app/research/publications/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: t('publication_type'),
      dataIndex: 'publication_type',
      key: 'publication_type',
      render: (type) => t(type),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color;
        switch (status) {
          case 'approved':
            color = 'green';
            break;
          case 'pending':
            color = 'gold';
            break;
          case 'rejected':
            color = 'red';
            break;
          case 'published':
            color = 'blue';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{t(status)}</Tag>;
      },
      filters: [
        { text: t('approved'), value: 'approved' },
        { text: t('pending'), value: 'pending' },
        { text: t('rejected'), value: 'rejected' },
        { text: t('published'), value: 'published' },
        { text: t('draft'), value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('publication_date'),
      dataIndex: 'publication_date',
      key: 'publication_date',
      sorter: (a, b) => new Date(a.publication_date) - new Date(b.publication_date),
    },
    {
      title: t('authors'),
      key: 'authors',
      render: (_, record) => (
        record.authors && record.authors.length > 0
          ? record.authors.map(author => author.author_name).join(', ')
          : t('no_authors_listed')
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => {
        const isOwner =
          user &&
          (user.is_admin ||
            record.submitted_by === user.id ||
            (Array.isArray(record.authors) && record.authors.some(a => a.author?.id === user.id)));
        return (
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/app/research/publications/${record.id}`)}
            />
            {isOwner && record.can_edit && (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  console.log('Navigating to edit for ID:', record.id);
                  navigate(`/app/research/publications/${record.id}/edit`);
                }}
              />
            )}
            {isOwner && record.can_edit && (
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(record.id)}
              >
                {t('delete')}
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Title level={2} className="mb-6">{t('publications')}</Title>
      <Card className="shadow-lg">
        {user && (user.is_admin || user.role === 'researcher') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/app/research/publications/new')}
            className="mb-4 bg-blue-600 hover:bg-blue-700"
          >
            {t('add_publication')}
          </Button>
        )}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={publications}
            rowKey="id"
            className="rounded-lg"
            locale={{ emptyText: t('no_data') }}
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default PublicationsPage;