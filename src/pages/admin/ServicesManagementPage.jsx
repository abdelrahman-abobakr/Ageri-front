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
  Tabs,
  Progress,
  Avatar
} from 'antd';
import {
  ToolOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { servicesService } from '../../services';
import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
import RealTimeIndicator from '../../components/admin/RealTimeIndicator';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;
const { TabPane } = Tabs;

const ServicesManagementPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  // Real-time services statistics
  const { stats: servicesStats, loading: statsLoading, refresh: refreshStats } = useRealTimeStats('services', 30000);

  // Animated counters
  const totalServicesCount = useAnimatedCounter(servicesStats?.totalServices || 0);
  const activeRequestsCount = useAnimatedCounter(servicesStats?.activeRequests || 0);
  const completedRequestsCount = useAnimatedCounter(servicesStats?.completedRequests || 0);
  const pendingRequestsCount = useAnimatedCounter(servicesStats?.pendingRequests || 0);

  useEffect(() => {
    if (activeTab === 'services') {
      loadServices();
    } else {
      loadRequests();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  const loadServices = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await servicesService.getTestServices(params);
      setServices(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load services:', error);
      message.error('فشل في تحميل الخدمات');
      // Fallback to mock data
      setServices([
        {
          id: 1,
          name: 'تحليل التربة المتقدم',
          description: 'تحليل شامل لخصائص التربة الفيزيائية والكيميائية',
          category: 'soil_analysis',
          price: 150.00,
          estimated_duration: 3,
          available: true,
          equipment_required: ['مطياف', 'مجهر إلكتروني'],
          created_at: '2024-01-10T10:00:00Z'
        },
        {
          id: 2,
          name: 'فحص جودة المياه',
          description: 'تحليل عينات المياه للتأكد من صلاحيتها للري',
          category: 'water_testing',
          price: 100.00,
          estimated_duration: 2,
          available: true,
          equipment_required: ['جهاز قياس pH', 'مطياف الامتصاص الذري'],
          created_at: '2024-01-08T14:30:00Z'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
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

      const response = await servicesService.getServiceRequests(params);
      setRequests(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load requests:', error);
      message.error('فشل في تحميل الطلبات');
      // Fallback to mock data
      setRequests([
        {
          id: 1,
          service_name: 'تحليل التربة المتقدم',
          client_name: 'أحمد محمد',
          client_email: 'ahmed@example.com',
          status: 'pending',
          priority: 'high',
          created_at: '2024-01-15T09:00:00Z',
          estimated_completion: '2024-01-18T17:00:00Z',
          assigned_technician: null,
          notes: 'عينة من مزرعة القمح - منطقة الدلتا'
        },
        {
          id: 2,
          service_name: 'فحص جودة المياه',
          client_name: 'فاطمة علي',
          client_email: 'fatima@example.com',
          status: 'in_progress',
          priority: 'medium',
          created_at: '2024-01-14T11:30:00Z',
          estimated_completion: '2024-01-16T15:00:00Z',
          assigned_technician: 'د. محمد حسن',
          notes: 'عينة مياه جوفية للري'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditService = (service) => {
    setEditingItem(service);
    form.setFieldsValue({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      estimated_duration: service.estimated_duration,
      available: service.available,
    });
    setModalVisible(true);
  };

  const handleDeleteService = async (service) => {
    confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذه الخدمة؟',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await servicesService.deleteTestService(service.id);
          message.success('تم حذف الخدمة بنجاح');
          loadServices();
          refreshStats();
        } catch (error) {
          message.error('فشل في حذف الخدمة');
        }
      },
    });
  };

  const handleSaveService = async (values) => {
    try {
      if (editingItem) {
        await servicesService.updateTestService(editingItem.id, values);
        message.success('تم تحديث الخدمة بنجاح');
      } else {
        await servicesService.createTestService(values);
        message.success('تم إنشاء الخدمة بنجاح');
      }
      setModalVisible(false);
      loadServices();
      refreshStats();
    } catch (error) {
      message.error('فشل في حفظ الخدمة');
    }
  };

  const handleAssignTechnician = async (requestId, technicianData) => {
    try {
      await servicesService.assignTechnician(requestId, technicianData);
      message.success('تم تعيين الفني بنجاح');
      loadRequests();
      refreshStats();
    } catch (error) {
      message.error('فشل في تعيين الفني');
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      await servicesService.updateRequestStatus(requestId, { status });
      message.success('تم تحديث حالة الطلب بنجاح');
      loadRequests();
      refreshStats();
    } catch (error) {
      message.error('فشل في تحديث حالة الطلب');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'في الانتظار' },
      in_progress: { color: 'blue', text: 'قيد التنفيذ' },
      completed: { color: 'green', text: 'مكتمل' },
      cancelled: { color: 'red', text: 'ملغي' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPriorityTag = (priority) => {
    const priorityConfig = {
      high: { color: 'red', text: 'عالية' },
      medium: { color: 'orange', text: 'متوسطة' },
      low: { color: 'green', text: 'منخفضة' },
    };
    
    const config = priorityConfig[priority] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return moment(dateString).format('YYYY-MM-DD HH:mm');
  };

  const formatDuration = (hours) => {
    if (!hours) return '-';
    if (hours < 24) {
      return `${hours} ساعة`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days} يوم ${remainingHours} ساعة` : `${days} يوم`;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ToolOutlined style={{ marginRight: '8px' }} />
          إدارة الخدمات
        </Title>
        <Text type="secondary">
          إدارة الخدمات المختبرية وطلبات العملاء والفنيين
        </Text>
        <RealTimeIndicator />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="إجمالي الخدمات"
              value={totalServicesCount.value}
              prefix={<ToolOutlined />}
              valueStyle={{
                color: '#1890ff',
                transition: 'all 0.3s ease'
              }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={totalServicesCount.isAnimating} />}
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
              title="الطلبات النشطة"
              value={activeRequestsCount.value}
              prefix={<ClockCircleOutlined />}
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
              title="الطلبات المكتملة"
              value={completedRequestsCount.value}
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
              title="في الانتظار"
              value={pendingRequestsCount.value}
              prefix={<CloseOutlined />}
              valueStyle={{
                color: '#f5222d',
                transition: 'all 0.3s ease'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="الخدمات المتاحة" key="services">
            {/* Services Filters and Actions */}
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="البحث في الخدمات..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={() => loadServices()}
                  />
                </Col>
                <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateService}
                  >
                    إضافة خدمة جديدة
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Services Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'اسم الخدمة',
                    dataIndex: 'name',
                    key: 'name',
                    ellipsis: true,
                  },
                  {
                    title: 'الوصف',
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true,
                  },
                  {
                    title: 'السعر',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `${price} جنيه`,
                  },
                  {
                    title: 'المدة المقدرة',
                    dataIndex: 'estimated_duration',
                    key: 'estimated_duration',
                    render: (duration) => formatDuration(duration),
                  },
                  {
                    title: 'الحالة',
                    dataIndex: 'available',
                    key: 'available',
                    render: (available) => (
                      <Tag color={available ? 'green' : 'red'}>
                        {available ? 'متاحة' : 'غير متاحة'}
                      </Tag>
                    ),
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
                            onClick={() => handleEditService(record)}
                          />
                        </Tooltip>
                        <Tooltip title="حذف">
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteService(record)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  },
                ]}
                dataSource={services}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} خدمة`,
                }}
                locale={{
                  emptyText: 'لا توجد خدمات',
                }}
                scroll={{ x: 800 }}
              />
            </Spin>
          </TabPane>

          <TabPane tab="طلبات الخدمات" key="requests">
            {/* Requests Filters */}
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="البحث في الطلبات..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={() => loadRequests()}
                  />
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
                    <Option value="pending">في الانتظار</Option>
                    <Option value="in_progress">قيد التنفيذ</Option>
                    <Option value="completed">مكتمل</Option>
                    <Option value="cancelled">ملغي</Option>
                  </Select>
                </Col>
              </Row>
            </div>

            {/* Requests Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'الخدمة',
                    dataIndex: 'service_name',
                    key: 'service_name',
                    ellipsis: true,
                  },
                  {
                    title: 'العميل',
                    dataIndex: 'client_name',
                    key: 'client_name',
                    render: (name, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {record.client_email}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'الحالة',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => getStatusTag(status),
                  },
                  {
                    title: 'الأولوية',
                    dataIndex: 'priority',
                    key: 'priority',
                    render: (priority) => getPriorityTag(priority),
                  },
                  {
                    title: 'الفني المعين',
                    dataIndex: 'assigned_technician',
                    key: 'assigned_technician',
                    render: (technician) => technician || 'غير معين',
                  },
                  {
                    title: 'تاريخ الطلب',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    render: (date) => formatDate(date),
                  },
                  {
                    title: 'الإجراءات',
                    key: 'actions',
                    render: (_, record) => (
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'view',
                              icon: <EyeOutlined />,
                              label: 'عرض التفاصيل',
                            },
                            {
                              key: 'assign',
                              icon: <TeamOutlined />,
                              label: 'تعيين فني',
                              disabled: record.status === 'completed',
                            },
                            {
                              key: 'complete',
                              icon: <CheckOutlined />,
                              label: 'تمييز كمكتمل',
                              disabled: record.status === 'completed',
                              onClick: () => handleUpdateRequestStatus(record.id, 'completed'),
                            },
                            {
                              type: 'divider'
                            },
                            {
                              key: 'cancel',
                              icon: <CloseOutlined />,
                              label: 'إلغاء الطلب',
                              danger: true,
                              disabled: record.status === 'completed',
                              onClick: () => handleUpdateRequestStatus(record.id, 'cancelled'),
                            }
                          ]
                        }}
                        trigger={['click']}
                      >
                        <Button size="small" icon={<MoreOutlined />} />
                      </Dropdown>
                    ),
                  },
                ]}
                dataSource={requests}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} طلب`,
                }}
                locale={{
                  emptyText: 'لا توجد طلبات',
                }}
                scroll={{ x: 1000 }}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Service Modal */}
      <Modal
        title={editingItem ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveService}
        >
          <Form.Item
            name="name"
            label="اسم الخدمة"
            rules={[{ required: true, message: 'اسم الخدمة مطلوب' }]}
          >
            <Input placeholder="أدخل اسم الخدمة" />
          </Form.Item>

          <Form.Item
            name="description"
            label="وصف الخدمة"
            rules={[{ required: true, message: 'وصف الخدمة مطلوب' }]}
          >
            <TextArea rows={3} placeholder="أدخل وصف تفصيلي للخدمة" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="فئة الخدمة"
                rules={[{ required: true, message: 'فئة الخدمة مطلوبة' }]}
              >
                <Select placeholder="اختر فئة الخدمة">
                  <Option value="soil_analysis">تحليل التربة</Option>
                  <Option value="water_testing">فحص المياه</Option>
                  <Option value="plant_analysis">تحليل النباتات</Option>
                  <Option value="pest_control">مكافحة الآفات</Option>
                  <Option value="consultation">استشارات</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="price"
                label="السعر (جنيه)"
                rules={[{ required: true, message: 'السعر مطلوب' }]}
              >
                <Input type="number" placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="estimated_duration"
                label="المدة المقدرة (ساعات)"
                rules={[{ required: true, message: 'المدة المقدرة مطلوبة' }]}
              >
                <Input type="number" placeholder="24" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="available"
                label="متاحة للطلب"
                valuePropName="checked"
                initialValue={true}
              >
                <Select>
                  <Option value={true}>متاحة</Option>
                  <Option value={false}>غير متاحة</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'تحديث' : 'إنشاء'}
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

export default ServicesManagementPage;
