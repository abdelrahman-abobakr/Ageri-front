import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  Dropdown,
  Tooltip,
  Spin,
  Upload,
  DatePicker
} from 'antd';
import {
  FileTextOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  CalendarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { contentService } from '../../services';
// import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
// import RealTimeIndicator from '../../components/admin/RealTimeIndicator';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const ContentManagementPage = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  // Real-time content statistics - temporarily disabled for debugging
  // const { stats: contentStats, loading: statsLoading, refresh: refreshStats } = useRealTimeStats('content', 30000);
  const statsLoading = false;
  const refreshStats = () => {};

  // Animated counters - temporarily disabled for debugging
  // const totalContentCount = useAnimatedCounter(contentStats?.totalContent || 0);
  // const publishedContentCount = useAnimatedCounter(contentStats?.publishedContent || 0);
  // const draftContentCount = useAnimatedCounter(contentStats?.draftContent || 0);
  // const scheduledContentCount = useAnimatedCounter(contentStats?.scheduledContent || 0);
  const totalContentCount = { value: 0 };
  const publishedContentCount = { value: 0 };
  const draftContentCount = { value: 0 };
  const scheduledContentCount = { value: 0 };

  // Mock data for demonstration
  const mockContent = [
    {
      id: 1,
      title: 'إعلان عن ورشة الزراعة المستدامة',
      type: 'announcement',
      status: 'published',
      author: 'أحمد محمد',
      publishDate: '2024-01-15',
      lastModified: '2024-01-15',
      views: 1245,
      excerpt: 'ورشة تدريبية حول أحدث تقنيات الزراعة المستدامة...'
    },
    {
      id: 2,
      title: 'أحدث البحوث في مجال الذكاء الاصطناعي الزراعي',
      type: 'post',
      status: 'published',
      author: 'فاطمة علي',
      publishDate: '2024-01-14',
      lastModified: '2024-01-14',
      views: 987,
      excerpt: 'مقال شامل حول تطبيقات الذكاء الاصطناعي في الزراعة...'
    },
    {
      id: 3,
      title: 'مؤتمر التكنولوجيا الزراعية 2024',
      type: 'event',
      status: 'scheduled',
      author: 'محمد حسن',
      publishDate: '2024-02-01',
      lastModified: '2024-01-13',
      views: 0,
      excerpt: 'مؤتمر سنوي يجمع خبراء التكنولوجيا الزراعية...'
    },
    {
      id: 4,
      title: 'دليل تحليل التربة المتقدم',
      type: 'post',
      status: 'draft',
      author: 'سارة أحمد',
      publishDate: null,
      lastModified: '2024-01-12',
      views: 0,
      excerpt: 'دليل شامل لتحليل التربة باستخدام التقنيات الحديثة...'
    }
  ];

  useEffect(() => {
    loadContent();
  }, [currentPage, searchTerm, typeFilter, statusFilter]);

  const loadContent = async () => {
    try {
      setLoading(true);

      // Build API parameters
      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (typeFilter) {
        params.type = typeFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      // Fetch content from API
      const response = await contentService.getAllContent(params);

      let filteredContent = response.results || [];

      // Apply client-side filtering if needed (for demo purposes)
      if (searchTerm) {
        filteredContent = filteredContent.filter(item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (typeFilter) {
        filteredContent = filteredContent.filter(item => item.type === typeFilter);
      }

      if (statusFilter) {
        filteredContent = filteredContent.filter(item => item.status === statusFilter);
      }

      setContent(filteredContent);
      setTotal(response.count || filteredContent.length);
    } catch (error) {
      console.error('Failed to load content:', error);
      message.error('فشل في تحميل المحتوى');
      // Fallback to mock data
      setContent(mockContent);
      setTotal(mockContent.length);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateContent = () => {
    setEditingContent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditContent = (contentItem) => {
    setEditingContent(contentItem);
    form.setFieldsValue({
      title: contentItem.title,
      type: contentItem.type,
      status: contentItem.status,
      excerpt: contentItem.excerpt,
      content: contentItem.content || '',
    });
    setModalVisible(true);
  };

  const handleDeleteContent = async (contentItem) => {
    confirm({
      title: t('admin.contentManagement.confirmDelete'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await contentService.deleteContent(contentItem.id, contentItem.type);
          message.success(t('admin.contentManagement.contentDeleted'));
          loadContent();
          refreshStats();
        } catch (error) {
          message.error('فشل في حذف المحتوى');
        }
      },
    });
  };

  const handlePublishContent = async (contentItem) => {
    confirm({
      title: t('admin.contentManagement.confirmPublish'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await contentService.publishContent(contentItem.id, contentItem.type);
          message.success(t('admin.contentManagement.contentPublished'));
          loadContent();
          refreshStats();
        } catch (error) {
          message.error('فشل في نشر المحتوى');
        }
      },
    });
  };

  const handleUnpublishContent = async (contentItem) => {
    confirm({
      title: t('admin.contentManagement.confirmUnpublish'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await contentService.unpublishContent(contentItem.id, contentItem.type);
          message.success(t('admin.contentManagement.contentUnpublished'));
          loadContent();
          refreshStats();
        } catch (error) {
          message.error('فشل في إلغاء نشر المحتوى');
        }
      },
    });
  };

  const handleSaveContent = async (values) => {
    try {
      if (editingContent) {
        if (editingContent.type === 'announcement') {
          await contentService.updateAnnouncement(editingContent.id, values);
        } else {
          await contentService.updatePost(editingContent.id, values);
        }
      } else {
        if (values.type === 'announcement') {
          await contentService.createAnnouncement(values);
        } else {
          await contentService.createPost(values);
        }
      }
      message.success(t('admin.contentManagement.contentSaved'));
      setModalVisible(false);
      loadContent();
      refreshStats();
    } catch (error) {
      message.error('فشل في حفظ المحتوى');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      published: { color: 'green', text: t('admin.contentManagement.published') },
      draft: { color: 'orange', text: t('admin.contentManagement.draft') },
      archived: { color: 'red', text: t('admin.contentManagement.archived') },
      scheduled: { color: 'blue', text: t('admin.contentManagement.scheduled') },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type) => {
    const typeConfig = {
      announcement: { color: 'purple', text: t('admin.contentManagement.announcement') },
      post: { color: 'blue', text: t('admin.contentManagement.post') },
      news: { color: 'green', text: t('admin.contentManagement.news') },
      event: { color: 'orange', text: t('admin.contentManagement.event') },
    };
    
    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getActionMenuItems = (contentItem) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: t('admin.contentManagement.preview'),
      onClick: () => {
        // Navigate to content preview
        console.log('View content:', contentItem.id);
      }
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: t('admin.contentManagement.editContent'),
      onClick: () => handleEditContent(contentItem)
    },
    {
      key: 'publish',
      icon: <CheckOutlined />,
      label: contentItem.status === 'published'
        ? t('admin.contentManagement.unpublishContent')
        : t('admin.contentManagement.publishContent'),
      onClick: () => contentItem.status === 'published'
        ? handleUnpublishContent(contentItem)
        : handlePublishContent(contentItem)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('admin.contentManagement.deleteContent'),
      onClick: () => handleDeleteContent(contentItem),
      danger: true
    }
  ];

  const columns = [
    {
      title: "العنوان",
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.excerpt}
          </Text>
        </div>
      ),
    },
    {
      title: "النوع",
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type),
    },
    {
      title: "الحالة",
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: "المؤلف",
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: "تاريخ النشر",
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date) => formatDate(date),
    },
    {
      title: "المشاهدات",
      dataIndex: 'views',
      key: 'views',
      render: (views) => (views || 0).toLocaleString(),
    },
    {
      title: "الإجراءات",
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('admin.contentManagement.editContent')}>
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditContent(record)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title={t('admin.contentManagement.publishContent')}>
              <Button
                type="default"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handlePublishContent(record)}
              />
            </Tooltip>
          )}
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={['click']}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: '8px' }} />
          إدارة المحتوى
        </Title>
        <Text type="secondary">
          إنشاء وتحرير وإدارة الإعلانات والمنشورات والمحتوى
        </Text>
        {/* <RealTimeIndicator /> */}
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="إجمالي المحتوى"
              value={totalContentCount.value}
              prefix={<FileTextOutlined />}
              valueStyle={{
                color: '#1890ff',
                transition: 'all 0.3s ease'
              }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={totalContentCount.isAnimating} />}
                  onClick={refreshStats}
                  style={{ marginLeft: '8px' }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="المحتوى المنشور"
              value={publishedContentCount.value}
              prefix={<CheckOutlined />}
              valueStyle={{
                color: '#52c41a',
                transition: 'all 0.3s ease'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="المسودات"
              value={draftContentCount.value}
              prefix={<EditOutlined />}
              valueStyle={{
                color: '#faad14',
                transition: 'all 0.3s ease'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="المحتوى المجدول"
              value={scheduledContentCount.value}
              prefix={<CalendarOutlined />}
              valueStyle={{
                color: '#722ed1',
                transition: 'all 0.3s ease'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('admin.contentManagement.searchContent')}
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={loadContent}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder={t('admin.contentManagement.filterByType')}
              allowClear
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="">{t('admin.contentManagement.allTypes')}</Option>
              <Option value="announcement">{t('admin.contentManagement.announcement')}</Option>
              <Option value="post">{t('admin.contentManagement.post')}</Option>
              <Option value="news">{t('admin.contentManagement.news')}</Option>
              <Option value="event">{t('admin.contentManagement.event')}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder={t('admin.contentManagement.filterByStatus')}
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="">{t('admin.contentManagement.allStatuses')}</Option>
              <Option value="published">{t('admin.contentManagement.published')}</Option>
              <Option value="draft">{t('admin.contentManagement.draft')}</Option>
              <Option value="scheduled">{t('admin.contentManagement.scheduled')}</Option>
              <Option value="archived">{t('admin.contentManagement.archived')}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateContent}
            >
              {t('admin.contentManagement.createNew')}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Content Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={content}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: setCurrentPage,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} من ${total} عنصر`,
            }}
            locale={{
              emptyText: t('admin.contentManagement.noContent'),
            }}
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>

      {/* Create/Edit Content Modal */}
      <Modal
        title={editingContent ? t('admin.contentManagement.editContent') : t('admin.contentManagement.createNew')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveContent}
        >
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="title"
                label={t('admin.contentManagement.title')}
                rules={[{ required: true, message: 'العنوان مطلوب' }]}
              >
                <Input placeholder="أدخل عنوان المحتوى" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="type"
                label={t('common.type')}
                rules={[{ required: true, message: 'النوع مطلوب' }]}
              >
                <Select placeholder="اختر نوع المحتوى">
                  <Option value="announcement">{t('admin.contentManagement.announcement')}</Option>
                  <Option value="post">{t('admin.contentManagement.post')}</Option>
                  <Option value="news">{t('admin.contentManagement.news')}</Option>
                  <Option value="event">{t('admin.contentManagement.event')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="excerpt"
            label={t('admin.contentManagement.excerpt')}
          >
            <TextArea rows={2} placeholder="مقتطف قصير عن المحتوى" />
          </Form.Item>

          <Form.Item
            name="content"
            label={t('admin.contentManagement.content')}
            rules={[{ required: true, message: 'المحتوى مطلوب' }]}
          >
            <TextArea rows={8} placeholder="اكتب محتوى المقال هنا..." />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label={t('admin.contentManagement.status')}
                initialValue="draft"
              >
                <Select>
                  <Option value="draft">{t('admin.contentManagement.draft')}</Option>
                  <Option value="published">{t('admin.contentManagement.published')}</Option>
                  <Option value="scheduled">{t('admin.contentManagement.scheduled')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="publishDate"
                label={t('admin.contentManagement.publishDate')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('admin.contentManagement.saveDraft')}
              </Button>
              <Button onClick={() => {
                form.setFieldsValue({ status: 'published' });
                form.submit();
              }}>
                {t('admin.contentManagement.publishNow')}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                {t('common.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContentManagementPage;
