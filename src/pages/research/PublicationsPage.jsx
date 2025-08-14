import React, { useState, useCallback, useEffect } from 'react';
import './PublicationsPage.css';
import {
  Card, Table, Button, Tag, Typography, Space, message, Spin, Modal,
  Input, Select, DatePicker, Row, Col, Tooltip, Badge, Drawer, Form,
  Checkbox, Divider, Statistic, Empty, Alert, Descriptions, App, Dropdown
} from 'antd';
import {
  DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined,
  FilterOutlined, CalendarOutlined, UserOutlined, LinkOutlined,
  FileTextOutlined, DownloadOutlined, CloseOutlined, StarFilled,
  StarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, ReloadOutlined, MoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import researchService from '../../services/researchService';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PublicationsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { modal } = App.useApp();

  // State management
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: false,
    showTotal: (total, range) => `${range[0]}-${range[1]} من ${total}`,
    pageSizeOptions: ['10', '20', '50'],
    size: 'small',
  });
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState({ field: 'created_at', order: 'descend' });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // New state for view modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [viewModalLoading, setViewModalLoading] = useState(false);

  // Filter form
  const [filterForm] = Form.useForm();

  // Load publications
  const loadPublications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: params.page || pagination.current,
        page_size: pagination.pageSize,
        ordering: sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`,
        ...filters,
        ...params, // ✅ Override with passed params (including search)
      };

      console.log('📤 Loading publications with params:', queryParams);

      const response = user?.is_admin
        ? await researchService.getAllPublications(queryParams)
        : await researchService.getMyPublications(queryParams);

      console.log('📥 Publications loaded:', response);

      setPublications(response.results || []);
      setPagination(prev => ({
        ...prev,
        total: response.count || 0,
        current: params.page || prev.current,
      }));

    } catch (error) {
      console.error('❌ Error loading publications:', error);
      message.error(t('failed_to_load_publications'));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, sorter, user, t]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    if (!user?.is_admin) return;

    try {
      const stats = await researchService.getPublicationStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
      // Don't show error message for statistics
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadPublications();
    loadStatistics();
  }, [loadPublications, loadStatistics]);

  // Handle view publication details
  const handleViewPublication = async (publication) => {
    setViewModalLoading(true);
    setViewModalVisible(true);

    try {
      // Load full publication details
      const fullDetails = await researchService.getPublicationById(publication.id);
      setSelectedPublication(fullDetails);
    } catch (error) {
      console.error('❌ Error loading publication details:', error);
      message.error(t('failed_to_load_publication_details'));
      setSelectedPublication(publication); // Fallback to basic data
    } finally {
      setViewModalLoading(false);
    }
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (newPagination, tableFilters, newSorter) => {
    console.log('📋 Table change:', { newPagination, tableFilters, newSorter });

    setPagination(newPagination);

    if (newSorter.field) {
      setSorter(newSorter);
    }

    // Handle table column filters
    const newFilters = {};
    Object.keys(tableFilters).forEach(key => {
      if (tableFilters[key]) {
        newFilters[key] = tableFilters[key];
      }
    });
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle advanced filter
  const handleAdvancedFilter = (values) => {
    const filterParams = {};

    // Handle search query
    if (values.q) filterParams.search = values.q;

    // Handle publication type
    if (values.publication_type?.length > 0) {
      filterParams.publication_type__in = values.publication_type.join(',');
    }

    // Handle status
    if (values.status?.length > 0) {
      filterParams.status__in = values.status.join(',');
    }

    // Handle research area
    if (values.research_area) filterParams.research_area__icontains = values.research_area;

    // Handle date range
    if (values.date_range?.length === 2) {
      filterParams.publication_date__gte = values.date_range[0].format('YYYY-MM-DD');
      filterParams.publication_date__lte = values.date_range[1].format('YYYY-MM-DD');
    }

    // Handle boolean filters
    if (values.is_featured !== undefined) filterParams.is_featured = values.is_featured;
    if (values.is_public !== undefined) filterParams.is_public = values.is_public;
    if (values.has_doi) filterParams.doi__isnull = false;
    if (values.has_file) filterParams.document_file__isnull = false;

    console.log('🔍 Advanced filter params:', filterParams);

    setFilters(filterParams);
    setPagination(prev => ({ ...prev, current: 1 }));
    setFilterDrawerVisible(false);
  };

  // Handle refresh
  const handleRefresh = async () => {
    await loadPublications();
    await loadStatistics();
    message.success(t('data_refreshed'));
  };

  // Handle delete
  const handleDelete = async (id, title) => {
    console.log('🗑️ Delete button clicked for publication:', id, title);

    modal.confirm({
      title: t('confirm_delete'),
      content: t('are_you_sure_delete_publication', { title: title?.substring(0, 50) }),
      okText: t('delete'),
      okType: 'danger',
      cancelText: t('cancel'),
      onOk: async () => {
        console.log('✅ User confirmed deletion for ID:', id);
        try {
          console.log('📤 Calling deletePublication API...');
          await researchService.deletePublication(id);
          message.success(t('publication_deleted_successfully'));
          loadPublications();
          loadStatistics();
          // Close modal if it's open
          if (selectedPublication?.id === id) {
            setViewModalVisible(false);
            setSelectedPublication(null);
          }
        } catch (error) {
          console.error('❌ Error deleting publication:', error);
          message.error(t('failed_to_delete_publication'));
        }
      },
    });
  };

  // Handle feature toggle
  const handleFeatureToggle = async (id, currentStatus) => {
    try {
      await researchService.featurePublication(id);
      message.success(currentStatus ? t('publication_unfeatured') : t('publication_featured'));
      loadPublications();
      loadStatistics();

      // Update modal data if it's the same publication
      if (selectedPublication?.id === id) {
        setSelectedPublication(prev => ({
          ...prev,
          is_featured: !currentStatus
        }));
      }
    } catch (error) {
      console.error('❌ Error toggling feature:', error);
      message.error(t('failed_to_toggle_feature'));
    }
  };

  // Handle bulk operations
  const handleBulkOperation = (operation) => {
    if (selectedRowKeys.length === 0) {
      message.warning(t('please_select_publications'));
      return;
    }

    Modal.confirm({
      title: t('confirm_bulk_operation'),
      content: t('bulk_operation_confirmation', {
        operation: t(operation),
        count: selectedRowKeys.length
      }),
      onOk: async () => {
        try {
          await researchService.bulkApprove({
            publication_ids: selectedRowKeys,
            action: operation,
          });
          message.success(t('bulk_operation_completed'));
          setSelectedRowKeys([]);
          loadPublications();
          loadStatistics();
        } catch (error) {
          console.error('❌ Error in bulk operation:', error);
          message.error(t('bulk_operation_failed'));
        }
      },
    });
  };

  // Get status color and icon
  const getStatusConfig = (status) => {
    const configs = {
      'draft': { color: 'default', icon: <EditOutlined /> },
      'pending': { color: 'processing', icon: <ClockCircleOutlined /> },
      'approved': { color: 'success', icon: <CheckCircleOutlined /> },
      'rejected': { color: 'error', icon: <ExclamationCircleOutlined /> },
      'published': { color: 'purple', icon: <FileTextOutlined /> },
    };
    return configs[status] || configs.draft;
  };

  // Check if user can edit publication
  const canEditPublication = (publication) => {
    if (!user || !publication) return false;
    if (user.is_admin) return true;
    return publication.submitted_by === user.id ||
      (publication.authors && publication.authors.some(a => a.author === user.id));
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return t('not_specified') || 'غير محدد';
    return moment(dateString).format('MMMM DD, YYYY');
  };

  const handleApprovePublication = async (id) => {
    try {
      await researchService.approvePublication(id);
      message.success(t('publication_approved_successfully'));
      loadPublications();
      loadStatistics();
    } catch (error) {
      console.error('❌ Error approving publication:', error);
      message.error(t('failed_to_approve_publication'));
    }
  };

  const handleDeletePublication = async (id) => {
    handleDelete(id, publications.find(p => p.id === id)?.title);
  };

  const columns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title, record) => (
        <div className="space-y-1">
          <div
            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => handleViewPublication(record)}
          >
            {title}
          </div>
          {record.publication_date && (
            <div className="text-xs text-gray-500">
              {moment(record.publication_date).format('YYYY')}
            </div>
          )}
        </div>
      ),
      sorter: true,
    },
    {
      title: 'النوع',
      dataIndex: 'publication_type',
      key: 'type',
      width: 120,
      responsive: ['md'],
      filters: [
        { text: 'مقال مجلة', value: 'journal_article' },
        { text: 'ورقة مؤتمر', value: 'conference_paper' },
        { text: 'كتاب', value: 'book' },
        { text: 'فصل كتاب', value: 'book_chapter' },
        { text: 'أطروحة', value: 'thesis' },
        { text: 'تقرير', value: 'report' },
        { text: 'مسودة', value: 'preprint' },
        { text: 'أخرى', value: 'other' },
      ],
      render: (type) => {
        const typeConfig = {
          journal_article: { color: 'blue', text: 'مقال مجلة' },
          conference_paper: { color: 'green', text: 'ورقة مؤتمر' },
          book: { color: 'purple', text: 'كتاب' },
          book_chapter: { color: 'orange', text: 'فصل كتاب' },
          thesis: { color: 'red', text: 'أطروحة' },
          report: { color: 'cyan', text: 'تقرير' },
          preprint: { color: 'magenta', text: 'مسودة' },
          other: { color: 'default', text: 'أخرى' }
        };
        const config = typeConfig[type] || typeConfig.other;
        return (
          <Tag color={config.color} className="text-xs">
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      responsive: ['md'],
      filters: [
        { text: 'مسودة', value: 'draft' },
        { text: 'قيد المراجعة', value: 'pending' },
        { text: 'موافق عليه', value: 'approved' },
        { text: 'منشور', value: 'published' },
      ],
      render: (status, record) => {
        const statusConfig = {
          draft: { color: 'default', text: 'مسودة' },
          pending: { color: 'processing', text: 'قيد المراجعة' },
          approved: { color: 'success', text: 'موافق عليه' },
          published: { color: 'purple', text: 'منشور' },
        };
        const config = statusConfig[status] || statusConfig.draft;
        return (
          <div className="space-y-1">
            <Tag color={config.color} className="text-xs">
              {config.text}
            </Tag>
            {record.is_public && (
              <div className="text-xs text-green-600">🌐 عام</div>
            )}
          </div>
        );
      },
    },

    {
      title: 'المؤلف',
      dataIndex: 'submitted_by_name',
      key: 'author',
      width: 120,
      responsive: ['lg'],
      render: (authorName, record) => (
        <div className="text-sm font-medium text-gray-900">
          {authorName || record.submitted_by?.name || 'غير محدد'}
        </div>
      ),
    },
    {
      title: 'التاريخ',
      dataIndex: 'created_at',
      key: 'date',
      width: 100,
      responsive: ['md'],
      sorter: true,
      render: (date) => (
        <div className="text-sm text-gray-600">
          {date ? moment(date).format('MMM DD, YYYY') : 'غير محدد'}
        </div>
      ),
    },

    {
      title: 'الإجراءات',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewPublication(record)}
          />
          {canEditPublication(record) && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/app/research/publications/${record.id}/edit`)}
            />
          )}
          {user?.is_admin && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'approve',
                    label: 'موافقة',
                    icon: <CheckCircleOutlined />,
                    onClick: () => handleApprovePublication(record.id),
                    disabled: record.status === 'approved'
                  },
                  {
                    key: 'delete',
                    label: 'حذف',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => handleDeletePublication(record.id)
                  }
                ]
              }}
              trigger={['click']}
            >
              <Button type="link" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </Space>
      ),
    },
  ];

  // Row selection config
  const rowSelection = user?.is_admin ? {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  } : null;

  return (
    <div className="max-w-7xl mx-auto p-0 min-h-screen" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>

      {/* Statistics Cards */}
      {user?.is_admin && statistics && (
        <Row gutter={32} style={{ marginBottom: 32 }}>
          <Col span={6}>
            <Card size="small" style={{ borderRadius: 20, boxShadow: '0 2px 12px rgba(79,140,255,0.08)', border: 'none', background: 'linear-gradient(135deg, #e0e7ff 60%, #f8fafc 100%)' }}>
              <Statistic
                title={<span style={{ color: '#4f8cff', fontWeight: 700 }}>{t('total_publications')}</span>}
                value={statistics.total_publications}
                prefix={<FileTextOutlined style={{ color: '#4f8cff' }} />}
                valueStyle={{ color: '#4f8cff', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderRadius: 20, boxShadow: '0 2px 12px rgba(82,196,26,0.08)', border: 'none', background: 'linear-gradient(135deg, #e6ffed 60%, #f8fafc 100%)' }}>
              <Statistic
                title={<span style={{ color: '#52c41a', fontWeight: 700 }}>{t('published')}</span>}
                value={statistics.published_publications}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderRadius: 20, boxShadow: '0 2px 12px rgba(250,173,20,0.08)', border: 'none', background: 'linear-gradient(135deg, #fffbe6 60%, #f8fafc 100%)' }}>
              <Statistic
                title={<span style={{ color: '#faad14', fontWeight: 700 }}>{t('pending_review')}</span>}
                value={statistics.pending_publications}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderRadius: 20, boxShadow: '0 2px 12px rgba(114,46,209,0.08)', border: 'none', background: 'linear-gradient(135deg, #f3f0ff 60%, #f8fafc 100%)' }}>
              <Statistic
                title={<span style={{ color: '#722ed1', fontWeight: 700 }}>{t('featured')}</span>}
                value={statistics.featured_publications}
                prefix={<StarFilled style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Top Bar: Only Add Publication button shown as requested */}
      <Card className="mb-6 rounded-xl shadow border-gray-100 bg-white" style={{ borderRadius: 20, boxShadow: '0 2px 12px rgba(79,140,255,0.08)' }}>
        <Row gutter={24} align="middle">
          <Col>
            {user && (user.is_admin || user.role === 'researcher') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/app/research/publications/new')}
                size="middle"
                style={{ fontWeight: 600 }}
              >
                {t('add_publication') || 'إضافة منشور'}
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Bulk Actions (Admin only) */}
      {user?.is_admin && selectedRowKeys.length > 0 && (
        <Card className="mb-6 rounded-xl shadow border-gray-100 bg-white" style={{ borderRadius: 20, boxShadow: '0 2px 12px rgba(79,140,255,0.08)' }}>
          <Space>
            <Text>{t('selected_count', { count: selectedRowKeys.length })}</Text>
            <Divider type="vertical" />
            <Button
              type="primary"
              onClick={() => handleBulkOperation('approve')}
            >
              {t('bulk_approve')}
            </Button>
            <Button
              onClick={() => handleBulkOperation('reject')}
            >
              {t('bulk_reject')}
            </Button>
            <Button
              onClick={() => handleBulkOperation('feature')}
            >
              {t('bulk_feature')}
            </Button>
            <Button
              onClick={() => handleBulkOperation('publish')}
            >
              {t('bulk_publish')}
            </Button>
          </Space>
        </Card>
      )}

      {/* Publications Table */}
      <Card className="rounded-xl shadow border-gray-100 bg-white" style={{ borderRadius: 20, boxShadow: '0 2px 12px rgba(79,140,255,0.08)' }}>
        <Table
          columns={columns}
          dataSource={publications}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          size="middle"
          className="enhanced-table"
          locale={{
            emptyText: (
              <Empty
                image={<FileTextOutlined style={{ fontSize: 64, color: '#4f8cff' }} />}
                description={<span style={{ fontSize: 18, color: '#4f8cff', fontWeight: 600 }}>{t('no_publications_found')}</span>}
                className="py-8"
              >
                {user && (user.is_admin || user.role === 'researcher') && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/app/research/publications/new')}
                    style={{ marginTop: 16, borderRadius: 8, fontWeight: 600 }}
                  >
                    {t('create_first_publication')}
                  </Button>
                )}
              </Empty>
            )
          }}
          style={{
            borderRadius: 8,
            overflow: 'hidden',
          }}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: () => handleViewPublication(record),
          })}
        />
      </Card>

      {/* View Publication Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#1890ff', letterSpacing: 1 }}>
              <FileTextOutlined style={{ marginRight: 8, color: '#4f8cff' }} />
              {t('publication_details') || 'تفاصيل المنشور'}
            </span>
            {selectedPublication?.is_featured && (
              <StarFilled style={{ color: '#faad14', marginLeft: 12, fontSize: 28 }} />
            )}
          </div>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedPublication(null);
        }}
        footer={null}
        width={900}
        style={{ borderRadius: 24, overflow: 'hidden' }}
        bodyStyle={{ background: '#fff', borderRadius: 24, padding: 40 }}
      >
        <Spin spinning={viewModalLoading}>
          {selectedPublication && (
            <div className="space-y-8">
              {/* Publication Status and Type */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Tag
                  color={getStatusConfig(selectedPublication.status).color}
                  icon={getStatusConfig(selectedPublication.status).icon}
                  className="px-4 py-2 text-base font-semibold rounded-full shadow"
                >
                  {t(selectedPublication.status)}
                </Tag>
                <Tag color="blue" className="px-4 py-2 text-base font-semibold rounded-full shadow">
                  {t(selectedPublication.publication_type)}
                </Tag>
                {selectedPublication.is_public && (
                  <Tag color="green" className="px-4 py-2 text-base font-semibold rounded-full shadow">
                    {t('public') || 'عام'}
                  </Tag>
                )}
                {selectedPublication.is_featured && (
                  <Tag color="gold" icon={<StarFilled />} className="px-4 py-2 text-base font-semibold rounded-full shadow">
                    {t('featured') || 'مميز'}
                  </Tag>
                )}
              </div>

              {/* Basic Information */}
              <Descriptions bordered column={1} size="small" className="rounded-xl shadow bg-white p-4">
                <Descriptions.Item label={<span className="font-bold text-blue-700">{t('title') || 'العنوان'}</span>}>
                  <Text strong className="text-lg text-blue-900">
                    {selectedPublication.title}
                  </Text>
                </Descriptions.Item>
                {selectedPublication.abstract && (
                  <Descriptions.Item label={<span className="font-bold text-blue-700">{t('abstract') || 'الملخص'}</span>}>
                    <Paragraph
                      ellipsis={{ rows: 3, expandable: true, symbol: t('show_more') || 'عرض المزيد' }}
                      className="text-gray-700"
                    >
                      {selectedPublication.abstract}
                    </Paragraph>
                  </Descriptions.Item>
                )}
                {selectedPublication.research_area && (
                  <Descriptions.Item label={<span className="font-bold text-blue-700">{t('research_area') || 'المجال البحثي'}</span>}>
                    {selectedPublication.research_area}
                  </Descriptions.Item>
                )}
                {selectedPublication.keywords && (
                  <Descriptions.Item label={<span className="font-bold text-blue-700">{t('keywords') || 'الكلمات المفتاحية'}</span>}>
                    <div className="flex flex-wrap gap-2">
                      {selectedPublication.keywords.split(',').map((keyword, index) => (
                        <Tag key={index} color="blue" size="large" className="rounded-full px-3 py-1 text-base">
                          {keyword.trim()}
                        </Tag>
                      ))}
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* Publication Details */}
              <Descriptions bordered column={2} size="small" title={<span className="font-bold text-blue-700">{t('publication_details') || 'تفاصيل النشر'}</span>} className="rounded-xl shadow bg-white p-4">
                {selectedPublication.journal_name && (
                  <Descriptions.Item label={t('journal_name') || 'اسم المجلة'} span={2}>
                    <Text strong>{selectedPublication.journal_name}</Text>
                  </Descriptions.Item>
                )}
                {selectedPublication.conference_name && (
                  <Descriptions.Item label={t('conference_name') || 'اسم المؤتمر'} span={2}>
                    <Text strong>{selectedPublication.conference_name}</Text>
                  </Descriptions.Item>
                )}
                {selectedPublication.publisher && (
                  <Descriptions.Item label={t('publisher') || 'الناشر'} span={2}>
                    {selectedPublication.publisher}
                  </Descriptions.Item>
                )}
                {selectedPublication.volume && (
                  <Descriptions.Item label={t('volume') || 'المجلد'}>
                    {selectedPublication.volume}
                  </Descriptions.Item>
                )}
                {selectedPublication.issue && (
                  <Descriptions.Item label={t('issue') || 'العدد'}>
                    {selectedPublication.issue}
                  </Descriptions.Item>
                )}
                {selectedPublication.pages && (
                  <Descriptions.Item label={t('pages') || 'الصفحات'} span={2}>
                    {selectedPublication.pages}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={t('publication_date') || 'تاريخ النشر'} span={2}>
                  <div className="flex items-center">
                    <CalendarOutlined className="mr-2 text-blue-400" />
                    {formatDate(selectedPublication.publication_date)}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              {/* Identifiers */}
              {(selectedPublication.doi || selectedPublication.isbn || selectedPublication.issn || selectedPublication.pmid) && (
                <Descriptions bordered column={2} size="small" title={<span className="font-bold text-blue-700">{t('identifiers') || 'المعرفات'}</span>} className="rounded-xl shadow bg-white p-4">
                  {selectedPublication.doi && (
                    <Descriptions.Item label="DOI" span={2}>
                      <a
                        href={`https://doi.org/${selectedPublication.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-700 hover:underline"
                      >
                        <LinkOutlined className="mr-1" />
                        {selectedPublication.doi}
                      </a>
                    </Descriptions.Item>
                  )}
                  {selectedPublication.isbn && (
                    <Descriptions.Item label="ISBN">
                      {selectedPublication.isbn}
                    </Descriptions.Item>
                  )}
                  {selectedPublication.issn && (
                    <Descriptions.Item label="ISSN">
                      {selectedPublication.issn}
                    </Descriptions.Item>
                  )}
                  {selectedPublication.pmid && (
                    <Descriptions.Item label="PMID" span={2}>
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${selectedPublication.pmid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-700 hover:underline"
                      >
                        <LinkOutlined className="mr-1" />
                        {selectedPublication.pmid}
                      </a>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              )}

              {/* URLs */}
              {(selectedPublication.url || selectedPublication.pdf_url) && (
                <Descriptions bordered column={1} size="small" title={<span className="font-bold text-blue-700">{t('links') || 'الروابط'}</span>} className="rounded-xl shadow bg-white p-4">
                  {selectedPublication.url && (
                    <Descriptions.Item label={t('publication_url') || 'رابط المنشور'}>
                      <a
                        href={selectedPublication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-700 hover:underline"
                      >
                        <LinkOutlined className="mr-1" />
                        {selectedPublication.url}
                      </a>
                    </Descriptions.Item>
                  )}
                  {selectedPublication.pdf_url && (
                    <Descriptions.Item label={t('pdf_url') || 'رابط PDF'}>
                      <a
                        href={selectedPublication.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-700 hover:underline"
                      >
                        <LinkOutlined className="mr-1" />
                        {selectedPublication.pdf_url}
                      </a>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              )}

              {/* File Download */}
              {selectedPublication.document_file && (
                <div className="border border-blue-100 rounded-xl p-6 bg-blue-50 shadow flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <FileTextOutlined className="text-blue-500 text-2xl" />
                    <div>
                      <Text strong className="text-lg text-blue-900">{t('document_file') || 'ملف المستند'}</Text>
                      <br />
                      <Text type="secondary" className="text-base">
                        {t('click_to_download') || 'اضغط للتحميل'}
                      </Text>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => window.open(selectedPublication.document_file, '_blank')}
                    className="rounded-full px-6 py-2 text-base shadow"
                  >
                    {t('download') || 'تحميل'}
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 border-t mt-8" style={{ marginTop: '16px' }}>
                <Space size="middle">
                  <Button
                    onClick={() => setViewModalVisible(false)}
                    icon={<CloseOutlined />}
                    className="rounded-full px-6 py-2 text-base shadow"
                  >
                    {t('close') || 'إغلاق'}
                  </Button>
                  {/* Removed View Full Details button as requested */}
                  {canEditPublication(selectedPublication) && (
                    <Button
                      type="default"
                      icon={<EditOutlined />}
                      onClick={() => {
                        navigate(`/app/research/publications/${selectedPublication.id}/edit`);
                        setViewModalVisible(false);
                      }}
                      className="rounded-full px-6 py-2 text-base shadow"
                    >
                      {t('edit') || 'تعديل'}
                    </Button>
                  )}
                  {user?.is_admin && (
                    <Button
                      type={selectedPublication.is_featured ? "default" : "primary"}
                      icon={selectedPublication.is_featured ? <StarFilled /> : <StarOutlined />}
                      onClick={() => handleFeatureToggle(selectedPublication.id, selectedPublication.is_featured)}
                      className="rounded-full px-6 py-2 text-base shadow"
                    >
                      {selectedPublication.is_featured ? (t('unfeature') || 'إلغاء التمييز') : (t('feature') || 'تمييز')}
                    </Button>
                  )}
                  {(canEditPublication(selectedPublication) || user?.is_admin) && (
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete button clicked!', selectedPublication.id);
                        handleDelete(selectedPublication.id, selectedPublication.title);
                      }}
                      className="rounded-full px-6 py-2 text-base shadow"
                    >
                      {t('delete') || 'حذف'}
                    </Button>
                  )}
                </Space>
              </div>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Advanced Filter Drawer */}
      <Drawer
        title={<span style={{ fontWeight: 700, color: '#1890ff', fontSize: 22 }}>{t('advanced_filter')}</span>}
        placement="right"
        width={420}
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        extra={
          <Space>
            <Button onClick={() => filterForm.resetFields()} style={{ borderRadius: 8, fontWeight: 600 }}>
              {t('reset')}
            </Button>
            <Button
              type="primary"
              onClick={() => filterForm.submit()}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              {t('apply_filter')}
            </Button>
          </Space>
        }
        bodyStyle={{ background: 'linear-gradient(135deg, #e0e7ff 60%, #f8fafc 100%)', borderRadius: 24, padding: 32 }}
      >
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={handleAdvancedFilter}
        >
          <Form.Item name="q" label={t('search_query')}>
            <Input placeholder={t('search_in_title_abstract_keywords')} />
          </Form.Item>

          <Form.Item name="publication_type" label={t('publication_type')}>
            <Select
              mode="multiple"
              placeholder={t('select_types')}
              allowClear
            >
              <Option value="journal_article">{t('journal_article')}</Option>
              <Option value="conference_paper">{t('conference_paper')}</Option>
              <Option value="book_chapter">{t('book_chapter')}</Option>
              <Option value="book">{t('book')}</Option>
              <Option value="thesis">{t('thesis')}</Option>
              <Option value="report">{t('report')}</Option>
              <Option value="preprint">{t('preprint')}</Option>
              <Option value="other">{t('other')}</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label={t('status')}>
            <Select
              mode="multiple"
              placeholder={t('select_status')}
              allowClear
            >
              <Option value="draft">{t('draft')}</Option>
              <Option value="pending">{t('pending')}</Option>
              <Option value="approved">{t('approved')}</Option>
              <Option value="rejected">{t('rejected')}</Option>
              <Option value="published">{t('published')}</Option>
            </Select>
          </Form.Item>

          <Form.Item name="research_area" label={t('research_area')}>
            <Input placeholder={t('enter_research_area')} />
          </Form.Item>

          <Form.Item name="date_range" label={t('publication_date_range')}>
            <RangePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Divider>{t('additional_filters')}</Divider>

          <Form.Item name="is_featured" valuePropName="checked">
            <Checkbox>{t('featured_only')}</Checkbox>
          </Form.Item>

          <Form.Item name="is_public" valuePropName="checked">
            <Checkbox>{t('public_only')}</Checkbox>
          </Form.Item>

          <Form.Item name="has_doi" valuePropName="checked">
            <Checkbox>{t('has_doi')}</Checkbox>
          </Form.Item>

          <Form.Item name="has_file" valuePropName="checked">
            <Checkbox>{t('has_document_file')}</Checkbox>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default PublicationsListPage;
