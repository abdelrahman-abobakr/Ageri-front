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
  DatePicker,
  Avatar
} from 'antd';
import {
  BookOutlined,
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
  UserOutlined,
  ReloadOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { researchService } from '../../services';
import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
import RealTimeIndicator from '../../components/admin/RealTimeIndicator';
import { useSelector } from 'react-redux';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const ResearchManagementPage = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPublication, setEditingPublication] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  // Real-time research statistics
  const { stats: researchStats, loading: statsLoading, refresh: refreshStats } = useRealTimeStats('research', 30000);

  // Animated counters
  const totalPublicationsCount = useAnimatedCounter(researchStats?.totalPublications || 0);
  const publishedCount = useAnimatedCounter(researchStats?.publishedPublications || 0);
  const draftCount = useAnimatedCounter(researchStats?.draftPublications || 0);
  const underReviewCount = useAnimatedCounter(researchStats?.underReviewPublications || 0);

  useEffect(() => {
    loadPublications();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (typeFilter) {
        params.type = typeFilter;
      }

      const response = await researchService.getPublications(params);
      setPublications(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load publications:', error);
      message.error(t('failed_to_load_publications'));
      // Fallback to mock data
      setPublications([
        {
          id: 1,
          title: 'تطبيقات الذكاء الاصطناعي في الزراعة المستدامة',
          authors: ['د. أحمد محمد', 'د. فاطمة علي'],
          type: 'journal_article',
          status: 'published',
          publication_date: '2024-01-15',
          journal: 'مجلة البحوث الزراعية',
          citations: 25,
          downloads: 1250
        },
        {
          id: 2,
          title: 'تحليل التربة باستخدام تقنيات الاستشعار عن بعد',
          authors: ['د. محمد حسن'],
          type: 'conference_paper',
          status: 'under_review',
          publication_date: null,
          journal: 'مؤتمر التكنولوجيا الزراعية 2024',
          citations: 0,
          downloads: 0
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePublication = () => {
    setEditingPublication(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditPublication = (publication) => {
    setEditingPublication(publication);
    form.setFieldsValue({
      title: publication.title,
      abstract: publication.abstract,
      type: publication.type,
      status: publication.status,
      journal: publication.journal,
      publication_date: publication.publication_date ? moment(publication.publication_date) : null,
    });
    setModalVisible(true);
  };

  const handleAcceptPublication = async (publication) => {
    confirm({
      title: t('confirm_accept'),
      content: t('are_you_sure_you_want_to_accept_this_publication'),
      icon: <CheckOutlined />,
      onOk: async () => {
        try {
          await researchService.approvePublication(publication.id, {
            status: 'approved',
            is_public: true, // Make publication visible to researchers
            review_notes: 'Approved by admin'
          });
          message.success(t('publication_accepted_successfully'));
          loadPublications();
          refreshStats();
        } catch (error) {
          console.error('Failed to accept publication:', error);
          message.error(t('failed_to_accept_publication'));
        }
      },
    });
  };

  const handleRejectPublication = async (publication) => {
    confirm({
      title: t('confirm_reject'),
      content: t('are_you_sure_you_want_to_reject_this_publication'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await researchService.rejectPublication(publication.id, {
            status: 'rejected',
            review_notes: 'Rejected by admin'
          });
          message.success(t('publication_rejected_successfully'));
          loadPublications();
          refreshStats();
        } catch (error) {
          console.error('Failed to reject publication:', error);
          message.error(t('failed_to_reject_publication'));
        }
      },
    });
  };

  const handleDeletePublication = async (publication) => {
    confirm({
      title: t('confirm_delete'),
      content: t('are_you_sure_you_want_to_delete_this_publication'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await researchService.deletePublication(publication.id);
          message.success(t('publication_deleted_successfully'));
          loadPublications();
          refreshStats();
        } catch (error) {
          console.error('Failed to delete publication:', error);
          message.error(t('failed_to_delete_publication'));
        }
      },
    });
  };

  const handleSavePublication = async (values) => {
    try {
      if (editingPublication) {
        await researchService.updatePublication(editingPublication.id, values);
        message.success(t('publication_updated_successfully'));
      } else {
        await researchService.createPublication(values);
        message.success(t('publication_created_successfully'));
      }
      setModalVisible(false);
      loadPublications();
      refreshStats();
    } catch (error) {
      console.error('Failed to save publication:', error);
      message.error(t('failed_to_save_publication'));
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      published: { color: 'green', text: t('published') },
      under_review: { color: 'orange', text: t('under_review') },
      draft: { color: 'blue', text: t('draft') },
      rejected: { color: 'red', text: t('rejected') },
      approved: { color: 'purple', text: t('approved') },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type) => {
    const typeConfig = {
      journal_article: { color: 'blue', text: t('journal_article') },
      conference_paper: { color: 'green', text: t('conference_paper') },
      book_chapter: { color: 'purple', text: t('book_chapter') },
      thesis: { color: 'orange', text: t('thesis') },
      report: { color: 'cyan', text: t('report') },
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

  const getActionMenuItems = (publication) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: t('view_details'),
      onClick: () => {
        console.log('View publication:', publication.id);
      }
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: t('edit'),
      onClick: () => handleEditPublication(publication)
    },
    {
      key: 'authors',
      icon: <TeamOutlined />,
      label: t('manage_authors'),
      onClick: () => {
        console.log('Manage authors for:', publication.id);
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: t('delete'),
      onClick: () => handleDeletePublication(publication),
      danger: true
    }
  ];

  const columns = [
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.authors?.join(', ') || t('no_authors_listed')}
          </Text>
        </div>
      ),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: t('journal_conference'),
      dataIndex: 'journal',
      key: 'journal',
      ellipsis: true,
    },
    {
      title: t('publication_date'),
      dataIndex: 'publication_date',
      key: 'publication_date',
      render: (date) => formatDate(date),
    },
    {
      title: t('citations'),
      dataIndex: 'citations',
      key: 'citations',
      render: (citations) => citations || 0,
    },
    {
      title: t('downloads'),
      dataIndex: 'downloads',
      key: 'downloads',
      render: (downloads) => downloads || 0,
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={t('edit')}>
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditPublication(record)}
            />
          </Tooltip>
          {user && user.is_admin && record.status === 'under_review' && (
            <>
              <Tooltip title={t('approve')}>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleAcceptPublication(record)}
                >
                  {t('approve')}
                </Button>
              </Tooltip>
              <Tooltip title={t('reject')}>
                <Button
                  type="primary"
                  size="small"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => handleRejectPublication(record)}
                >
                  {t('reject')}
                </Button>
              </Tooltip>
            </>
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
          <BookOutlined style={{ marginRight: '8px' }} />
          {t('research_management')}
        </Title>
        <Text type="secondary">
          {t('manage_research_publications_and_authors')}
        </Text>
        <RealTimeIndicator />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('total_publications')}
              value={totalPublicationsCount.value}
              prefix={<BookOutlined />}
              valueStyle={{
                color: '#1890ff',
                transition: 'all 0.3s ease'
              }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={totalPublicationsCount.isAnimating} />}
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
              title={t('published_publications')}
              value={publishedCount.value}
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
              title={t('under_review')}
              value={underReviewCount.value}
              prefix={<CloseOutlined />}
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
              title={t('drafts')}
              value={draftCount.value}
              prefix={<FileTextOutlined />}
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
              placeholder={t('search_publications')}
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={loadPublications}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder={t('filter_by_type')}
              allowClear
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="">{t('all_types')}</Option>
              <Option value="journal_article">{t('journal_article')}</Option>
              <Option value="conference_paper">{t('conference_paper')}</Option>
              <Option value="book_chapter">{t('book_chapter')}</Option>
              <Option value="thesis">{t('thesis')}</Option>
              <Option value="report">{t('report')}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder={t('filter_by_status')}
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="">{t('all_statuses')}</Option>
              <Option value="published">{t('published')}</Option>
              <Option value="under_review">{t('under_review')}</Option>
              <Option value="draft">{t('draft')}</Option>
              <Option value="rejected">{t('rejected')}</Option>
              <Option value="approved">{t('approved')}</Option>
            </Select>
          </Col>
          {/* زر إضافة بحث جديد تم إزالته للأدمن */}
        </Row>
      </Card>

      {/* Publications Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={publications}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: setCurrentPage,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} ${t('of')} ${total} ${t('publications')}`,
            }}
            locale={{
              emptyText: t('no_publications'),
            }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

      {/* Create/Edit Publication Modal */}
      <Modal
        title={editingPublication ? t('edit_publication') : t('add_new_publication')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSavePublication}
        >
          <Form.Item
            name="title"
            label={t('title')}
            rules={[{ required: true, message: t('title_required') }]}
          >
            <Input placeholder={t('enter_publication_title')} />
          </Form.Item>

          <Form.Item
            name="abstract"
            label={t('abstract')}
            rules={[{ required: true, message: t('abstract_required') }]}
          >
            <TextArea rows={4} placeholder={t('enter_abstract')} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label={t('publication_type')}
                rules={[{ required: true, message: t('type_required') }]}
              >
                <Select placeholder={t('select_type')}>
                  <Option value="journal_article">{t('journal_article')}</Option>
                  <Option value="conference_paper">{t('conference_paper')}</Option>
                  <Option value="book_chapter">{t('book_chapter')}</Option>
                  <Option value="thesis">{t('thesis')}</Option>
                  <Option value="report">{t('report')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label={t('status')}
                initialValue="draft"
              >
                <Select>
                  <Option value="draft">{t('draft')}</Option>
                  <Option value="under_review">{t('under_review')}</Option>
                  <Option value="published">{t('published')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="journal"
                label={t('journal_conference')}
              >
                <Input placeholder={t('enter_journal_or_conference_name')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="publication_date"
                label={t('publication_date')}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPublication ? t('update') : t('create')}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                {t('cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResearchManagementPage;