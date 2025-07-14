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
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const ResearchManagementPage = () => {
  const { t } = useTranslation();
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
      message.error('فشل في تحميل المنشورات');
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

  const handleDeletePublication = async (publication) => {
    confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا المنشور؟',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await researchService.deletePublication(publication.id);
          message.success('تم حذف المنشور بنجاح');
          loadPublications();
          refreshStats();
        } catch (error) {
          message.error('فشل في حذف المنشور');
        }
      },
    });
  };

  const handleSavePublication = async (values) => {
    try {
      if (editingPublication) {
        await researchService.updatePublication(editingPublication.id, values);
        message.success('تم تحديث المنشور بنجاح');
      } else {
        await researchService.createPublication(values);
        message.success('تم إنشاء المنشور بنجاح');
      }
      setModalVisible(false);
      loadPublications();
      refreshStats();
    } catch (error) {
      message.error('فشل في حفظ المنشور');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      published: { color: 'green', text: 'منشور' },
      under_review: { color: 'orange', text: 'قيد المراجعة' },
      draft: { color: 'blue', text: 'مسودة' },
      rejected: { color: 'red', text: 'مرفوض' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type) => {
    const typeConfig = {
      journal_article: { color: 'blue', text: 'مقال علمي' },
      conference_paper: { color: 'green', text: 'ورقة مؤتمر' },
      book_chapter: { color: 'purple', text: 'فصل كتاب' },
      thesis: { color: 'orange', text: 'رسالة' },
      report: { color: 'cyan', text: 'تقرير' },
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
      label: 'عرض التفاصيل',
      onClick: () => {
        console.log('View publication:', publication.id);
      }
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'تعديل',
      onClick: () => handleEditPublication(publication)
    },
    {
      key: 'authors',
      icon: <TeamOutlined />,
      label: 'إدارة المؤلفين',
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
      label: 'حذف',
      onClick: () => handleDeletePublication(publication),
      danger: true
    }
  ];

  const columns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.authors?.join(', ') || 'لا يوجد مؤلفين'}
          </Text>
        </div>
      ),
    },
    {
      title: 'النوع',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'المجلة/المؤتمر',
      dataIndex: 'journal',
      key: 'journal',
      ellipsis: true,
    },
    {
      title: 'تاريخ النشر',
      dataIndex: 'publication_date',
      key: 'publication_date',
      render: (date) => formatDate(date),
    },
    {
      title: 'الاقتباسات',
      dataIndex: 'citations',
      key: 'citations',
      render: (citations) => citations || 0,
    },
    {
      title: 'التحميلات',
      dataIndex: 'downloads',
      key: 'downloads',
      render: (downloads) => downloads || 0,
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="تعديل">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditPublication(record)}
            />
          </Tooltip>
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
          إدارة البحوث
        </Title>
        <Text type="secondary">
          إدارة المنشورات البحثية والمؤلفين والإحصائيات
        </Text>
        <RealTimeIndicator />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="إجمالي المنشورات"
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
              title="المنشورات المنشورة"
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
              title="قيد المراجعة"
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
              title="المسودات"
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
              placeholder="البحث في المنشورات..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={loadPublications}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="تصفية حسب النوع"
              allowClear
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="">جميع الأنواع</Option>
              <Option value="journal_article">مقال علمي</Option>
              <Option value="conference_paper">ورقة مؤتمر</Option>
              <Option value="book_chapter">فصل كتاب</Option>
              <Option value="thesis">رسالة</Option>
              <Option value="report">تقرير</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="تصفية حسب الحالة"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="">جميع الحالات</Option>
              <Option value="published">منشور</Option>
              <Option value="under_review">قيد المراجعة</Option>
              <Option value="draft">مسودة</Option>
              <Option value="rejected">مرفوض</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreatePublication}
            >
              إضافة منشور جديد
            </Button>
          </Col>
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
                `${range[0]}-${range[1]} من ${total} منشور`,
            }}
            locale={{
              emptyText: 'لا توجد منشورات',
            }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>

      {/* Create/Edit Publication Modal */}
      <Modal
        title={editingPublication ? 'تعديل المنشور' : 'إضافة منشور جديد'}
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
            label="العنوان"
            rules={[{ required: true, message: 'العنوان مطلوب' }]}
          >
            <Input placeholder="أدخل عنوان المنشور" />
          </Form.Item>

          <Form.Item
            name="abstract"
            label="الملخص"
            rules={[{ required: true, message: 'الملخص مطلوب' }]}
          >
            <TextArea rows={4} placeholder="أدخل ملخص المنشور" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="نوع المنشور"
                rules={[{ required: true, message: 'نوع المنشور مطلوب' }]}
              >
                <Select placeholder="اختر نوع المنشور">
                  <Option value="journal_article">مقال علمي</Option>
                  <Option value="conference_paper">ورقة مؤتمر</Option>
                  <Option value="book_chapter">فصل كتاب</Option>
                  <Option value="thesis">رسالة</Option>
                  <Option value="report">تقرير</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="الحالة"
                initialValue="draft"
              >
                <Select>
                  <Option value="draft">مسودة</Option>
                  <Option value="under_review">قيد المراجعة</Option>
                  <Option value="published">منشور</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="journal"
                label="المجلة/المؤتمر"
              >
                <Input placeholder="اسم المجلة أو المؤتمر" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="publication_date"
                label="تاريخ النشر"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPublication ? 'تحديث' : 'إنشاء'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResearchManagementPage;
