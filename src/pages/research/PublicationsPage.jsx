// components/Publications/PublicationsListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Card, Table, Button, Tag, Typography, Space, message, Spin, Modal, 
  Input, Select, DatePicker, Row, Col, Tooltip, Badge, Drawer, Form,
  Checkbox, Divider, Statistic, Empty, Alert
} from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, FilterOutlined, DownloadOutlined,
  StarOutlined, StarFilled, FileTextOutlined, UserOutlined,
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import researchService from '../../services/researchService';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PublicationsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // State management
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  });
  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState({ field: 'created_at', order: 'descend' });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter form
  const [filterForm] = Form.useForm();

  // Load publications
  const loadPublications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ordering: sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`,
        ...filters,
        ...params,
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

  // Handle search
  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
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

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    filterForm.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPublications();
    await loadStatistics();
    setRefreshing(false);
    message.success(t('data_refreshed'));
  };

  // Handle delete
  const handleDelete = async (id, title) => {
    Modal.confirm({
      title: t('confirm_delete'),
      content: t('are_you_sure_delete_publication', { title: title.substring(0, 50) }),
      okText: t('delete'),
      okType: 'danger',
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          await researchService.deletePublication(id);
          message.success(t('publication_deleted_successfully'));
          loadPublications();
          loadStatistics();
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
    if (!user) return false;
    if (user.is_admin) return true;
    return publication.submitted_by === user.id || 
           (publication.authors && publication.authors.some(a => a.author === user.id));
  };

  // Table columns
  const columns = [
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: { showTitle: false },
      render: (title, record) => (
        <Tooltip title={title}>
          <Button 
            type="link" 
            onClick={() => navigate(`/app/research/publications/${record.id}`)}
            className="text-left p-0 h-auto"
          >
            <div className="font-medium text-blue-600 hover:text-blue-800">
              {title.length > 60 ? `${title.substring(0, 60)}...` : title}
            </div>
          </Button>
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: t('type'),
      dataIndex: 'publication_type',
      key: 'publication_type',
      width: 120,
      filters: [
        { text: t('journal_article'), value: 'journal_article' },
        { text: t('conference_paper'), value: 'conference_paper' },
        { text: t('book_chapter'), value: 'book_chapter' },
        { text: t('book'), value: 'book' },
        { text: t('thesis'), value: 'thesis' },
        { text: t('report'), value: 'report' },
        { text: t('preprint'), value: 'preprint' },
        { text: t('other'), value: 'other' },
      ],
      render: (type) => (
        <Tag color="blue" className="text-xs">
          {t(type)}
        </Tag>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: t('draft'), value: 'draft' },
        { text: t('pending'), value: 'pending' },
        { text: t('approved'), value: 'approved' },
        { text: t('rejected'), value: 'rejected' },
        { text: t('published'), value: 'published' },
      ],
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon} className="text-xs">
            {t(status)}
          </Tag>
        );
      },
    },
    {
      title: t('authors'),
      dataIndex: 'author_names',
      key: 'authors',
      width: 200,
      ellipsis: { showTitle: false },
      render: (authorNames, record) => (
        <Tooltip title={authorNames || t('no_authors')}>
          <div className="flex items-center text-gray-600 text-sm">
            <UserOutlined className="mr-1" />
            {authorNames ? (
              authorNames.length > 30 ? `${authorNames.substring(0, 30)}...` : authorNames
            ) : t('no_authors')}
            {record.author_count && (
              <Badge count={record.author_count} className="ml-2" />
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: t('date'),
      dataIndex: 'publication_date',
      key: 'publication_date',
      width: 110,
      sorter: true,
      render: (date) => (
        <div className="flex items-center text-gray-600 text-sm">
          <CalendarOutlined className="mr-1" />
          {date ? moment(date).format('MMM DD, YYYY') : t('no_date')}
        </div>
      ),
    },
    {
      title: t('metrics'),
      key: 'metrics',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small" className="text-xs">
          <div>
            <Text type="secondary">Views: </Text>
            <Text strong>{record.total_views || 0}</Text>
          </div>
          <div>
            <Text type="secondary">Citations: </Text>
            <Text strong>{record.citation_count || 0}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        const canEdit = canEditPublication(record);
        return (
          <Space size="small">
            <Tooltip title={t('view_details')}>
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/app/research/publications/${record.id}`)}
              />
            </Tooltip>
            
            {canEdit && (
              <Tooltip title={t('edit')}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/app/research/publications/${record.id}/edit`)}
                />
              </Tooltip>
            )}
            
            {user?.is_admin && (
              <Tooltip title={record.is_featured ? t('unfeature') : t('feature')}>
                <Button
                  type="text"
                  icon={record.is_featured ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
                  onClick={() => handleFeatureToggle(record.id, record.is_featured)}
                />
              </Tooltip>
            )}
            
            {canEdit && (
              <Tooltip title={t('delete')}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id, record.title)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0">
          {t('publications')}
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {t('refresh')}
          </Button>
          {user && (user.is_admin || user.role === 'researcher') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/app/research/publications/new')}
            >
              {t('add_publication')}
            </Button>
          )}
        </Space>
      </div>

      {/* Statistics Cards (Admin only) */}
      {user?.is_admin && statistics && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card size="small">
              <Statistic
                title={t('total_publications')}
                value={statistics.total_publications}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title={t('published')}
                value={statistics.published_publications}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title={t('pending_review')}
                value={statistics.pending_publications}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title={t('featured')}
                value={statistics.featured_publications}
                prefix={<StarFilled />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Search and Filter Bar */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder={t('search_publications')}
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterDrawerVisible(true)}
              className="h-10"
            >
              {t('advanced_filter')}
            </Button>
          </Col>
          {Object.keys(filters).length > 0 && (
            <Col>
              <Button onClick={clearFilters} className="h-10">
                {t('clear_filters')}
              </Button>
            </Col>
          )}
        </Row>

        {/* Active Filters Display */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Text type="secondary" className="mr-2">{t('active_filters')}:</Text>
            {Object.entries(filters).map(([key, value]) => (
              <Tag
                key={key}
                closable
                onClose={() => {
                  const newFilters = { ...filters };
                  delete newFilters[key];
                  setFilters(newFilters);
                }}
                className="mb-1"
              >
                {key}: {Array.isArray(value) ? value.join(', ') : value}
              </Tag>
            ))}
          </div>
        )}
      </Card>

      {/* Bulk Actions (Admin only) */}
      {user?.is_admin && selectedRowKeys.length > 0 && (
        <Card className="mb-4">
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
      <Card>
        <Table
          columns={columns}
          dataSource={publications}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('no_publications_found')}
              >
                {user && (user.is_admin || user.role === 'researcher') && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/app/research/publications/new')}
                  >
                    {t('create_first_publication')}
                  </Button>
                )}
              </Empty>
            )
          }}
        />
      </Card>

      {/* Advanced Filter Drawer */}
      <Drawer
        title={t('advanced_filter')}
        placement="right"
        width={400}
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
        extra={
          <Space>
            <Button onClick={() => filterForm.resetFields()}>
              {t('reset')}
            </Button>
            <Button
              type="primary"
              onClick={() => filterForm.submit()}
            >
              {t('apply_filter')}
            </Button>
          </Space>
        }
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