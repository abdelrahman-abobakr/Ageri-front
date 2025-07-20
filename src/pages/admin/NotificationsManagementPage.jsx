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
  Switch,
  Badge,
  Avatar,
  List
} from 'antd';
import {
  BellOutlined,
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
  MailOutlined,
  MessageOutlined,
  SettingOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../../services';
import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
import RealTimeIndicator from '../../components/admin/RealTimeIndicator';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;
const { TabPane } = Tabs;

const NotificationsManagementPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  // Real-time notifications statistics
  const { stats: notifStats, loading: statsLoading, refresh: refreshStats } = useRealTimeStats('notifications', 30000);

  // Animated counters
  const totalNotificationsCount = useAnimatedCounter(notifStats?.totalNotifications || 0);
  const unreadNotificationsCount = useAnimatedCounter(notifStats?.unreadNotifications || 0);
  const sentTodayCount = useAnimatedCounter(notifStats?.sentToday || 0);
  const activeTemplatesCount = useAnimatedCounter(notifStats?.activeTemplates || 0);

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotifications();
    } else if (activeTab === 'templates') {
      loadTemplates();
    } else {
      loadSettings();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter, typeFilter]);

  const loadNotifications = async () => {
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

      const response = await notificationService.getNotifications(params);
      setNotifications(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      message.error('فشل في تحميل الإشعارات');
      // Fallback to mock data
      setNotifications([
        {
          id: 1,
          title: 'مرحباً بك في منصة أجيري',
          message: 'نرحب بك في منصة أجيري للبحوث الزراعية. نتمنى لك تجربة مفيدة.',
          type: 'welcome',
          status: 'sent',
          recipient_type: 'all_users',
          recipient_count: 150,
          created_at: '2024-01-15T10:00:00Z',
          sent_at: '2024-01-15T10:05:00Z',
          created_by: 'المدير العام'
        },
        {
          id: 2,
          title: 'تحديث في نظام إدارة المحتوى',
          message: 'تم تحديث نظام إدارة المحتوى بميزات جديدة. يرجى مراجعة التحديثات.',
          type: 'system_update',
          status: 'draft',
          recipient_type: 'admins',
          recipient_count: 5,
          created_at: '2024-01-14T14:30:00Z',
          sent_at: null,
          created_by: 'مدير النظام'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await notificationService.getTemplates(params);
      setTemplates(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load templates:', error);
      message.error('فشل في تحميل القوالب');
      // Fallback to mock data
      setTemplates([
        {
          id: 1,
          name: 'قالب الترحيب',
          subject: 'مرحباً بك في منصة أجيري',
          content: 'مرحباً {{user_name}}، نرحب بك في منصة أجيري للبحوث الزراعية.',
          type: 'welcome',
          status: 'active',
          usage_count: 25,
          created_at: '2024-01-10T09:00:00Z',
          last_used: '2024-01-15T10:05:00Z'
        },
        {
          id: 2,
          name: 'قالب تأكيد التسجيل',
          subject: 'تأكيد تسجيل الدورة التدريبية',
          content: 'تم تأكيد تسجيلك في الدورة {{course_name}}. تاريخ البداية: {{start_date}}',
          type: 'course_confirmation',
          status: 'active',
          usage_count: 12,
          created_at: '2024-01-08T11:00:00Z',
          last_used: '2024-01-14T16:20:00Z'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getSettings();
      setSettings(response || {
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        daily_digest: true,
        weekly_summary: false,
        auto_send_welcome: true,
        auto_send_reminders: true,
        max_notifications_per_day: 10,
        notification_retention_days: 30
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      message.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditNotification = (notification) => {
    setEditingItem(notification);
    form.setFieldsValue({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      recipient_type: notification.recipient_type,
    });
    setModalVisible(true);
  };

  const handleDeleteNotification = async (notification) => {
    confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا الإشعار؟',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await notificationService.deleteNotification(notification.id);
          message.success('تم حذف الإشعار بنجاح');
          loadNotifications();
          refreshStats();
        } catch (error) {
          message.error('فشل في حذف الإشعار');
        }
      },
    });
  };

  const handleSendNotification = async (notificationId) => {
    try {
      await notificationService.sendNotification(notificationId);
      message.success('تم إرسال الإشعار بنجاح');
      loadNotifications();
      refreshStats();
    } catch (error) {
      message.error('فشل في إرسال الإشعار');
    }
  };

  const handleSaveNotification = async (values) => {
    try {
      if (editingItem) {
        await notificationService.updateNotification(editingItem.id, values);
        message.success('تم تحديث الإشعار بنجاح');
      } else {
        await notificationService.createNotification(values);
        message.success('تم إنشاء الإشعار بنجاح');
      }
      setModalVisible(false);
      loadNotifications();
      refreshStats();
    } catch (error) {
      message.error('فشل في حفظ الإشعار');
    }
  };

  const handleUpdateSettings = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      await notificationService.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      message.success('تم تحديث الإعدادات بنجاح');
    } catch (error) {
      message.error('فشل في تحديث الإعدادات');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      sent: { color: 'green', text: 'مرسل' },
      draft: { color: 'orange', text: 'مسودة' },
      scheduled: { color: 'blue', text: 'مجدول' },
      failed: { color: 'red', text: 'فشل' },
      active: { color: 'green', text: 'نشط' },
      inactive: { color: 'red', text: 'غير نشط' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type) => {
    const typeConfig = {
      welcome: { color: 'blue', text: 'ترحيب' },
      system_update: { color: 'purple', text: 'تحديث النظام' },
      course_confirmation: { color: 'green', text: 'تأكيد دورة' },
      reminder: { color: 'orange', text: 'تذكير' },
      announcement: { color: 'cyan', text: 'إعلان' },
    };
    
    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return moment(dateString).format('YYYY-MM-DD HH:mm');
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <BellOutlined style={{ marginRight: '8px' }} />
          إدارة الإشعارات
        </Title>
        <Text type="secondary">
          إدارة الإشعارات والقوالب وإعدادات النظام
        </Text>
        <RealTimeIndicator />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="إجمالي الإشعارات"
              value={totalNotificationsCount.value}
              prefix={<BellOutlined />}
              valueStyle={{
                color: '#1890ff',
                transition: 'all 0.3s ease'
              }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={totalNotificationsCount.isAnimating} />}
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
              title="غير مقروءة"
              value={unreadNotificationsCount.value}
              prefix={<MailOutlined />}
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
              title="مرسلة اليوم"
              value={sentTodayCount.value}
              prefix={<SendOutlined />}
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
              title="القوالب النشطة"
              value={activeTemplatesCount.value}
              prefix={<MessageOutlined />}
              valueStyle={{
                color: '#722ed1',
                transition: 'all 0.3s ease'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="الإشعارات" key="notifications">
            {/* Notifications Filters and Actions */}
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8} md={6}>
                  <Search
                    placeholder="البحث في الإشعارات..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={() => loadNotifications()}
                  />
                </Col>
                <Col xs={24} sm={4} md={3}>
                  <Select
                    placeholder="النوع"
                    allowClear
                    style={{ width: '100%' }}
                    value={typeFilter}
                    onChange={setTypeFilter}
                  >
                    <Option value="">جميع الأنواع</Option>
                    <Option value="welcome">ترحيب</Option>
                    <Option value="system_update">تحديث النظام</Option>
                    <Option value="reminder">تذكير</Option>
                    <Option value="announcement">إعلان</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={4} md={3}>
                  <Select
                    placeholder="الحالة"
                    allowClear
                    style={{ width: '100%' }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  >
                    <Option value="">جميع الحالات</Option>
                    <Option value="sent">مرسل</Option>
                    <Option value="draft">مسودة</Option>
                    <Option value="scheduled">مجدول</Option>
                    <Option value="failed">فشل</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateNotification}
                  >
                    إنشاء إشعار جديد
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Notifications Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'العنوان',
                    dataIndex: 'title',
                    key: 'title',
                    ellipsis: true,
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {record.message?.substring(0, 50)}...
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
                    title: 'المستلمين',
                    key: 'recipients',
                    render: (_, record) => (
                      <div>
                        <Badge count={record.recipient_count} showZero>
                          <UserOutlined style={{ fontSize: '16px' }} />
                        </Badge>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          {record.recipient_type === 'all_users' ? 'جميع المستخدمين' :
                           record.recipient_type === 'admins' ? 'المديرين' :
                           record.recipient_type}
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: 'تاريخ الإنشاء',
                    dataIndex: 'created_at',
                    key: 'created_at',
                    render: (date) => formatDate(date),
                  },
                  {
                    title: 'تاريخ الإرسال',
                    dataIndex: 'sent_at',
                    key: 'sent_at',
                    render: (date) => formatDate(date),
                  },
                  {
                    title: 'الإجراءات',
                    key: 'actions',
                    render: (_, record) => (
                      <Space>
                        {record.status === 'draft' && (
                          <Tooltip title="إرسال">
                            <Button
                              type="primary"
                              size="small"
                              icon={<SendOutlined />}
                              onClick={() => handleSendNotification(record.id)}
                            />
                          </Tooltip>
                        )}
                        <Tooltip title="تعديل">
                          <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditNotification(record)}
                          />
                        </Tooltip>
                        <Tooltip title="حذف">
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteNotification(record)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  },
                ]}
                dataSource={notifications}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} إشعار`,
                }}
                locale={{
                  emptyText: 'لا توجد إشعارات',
                }}
                scroll={{ x: 1000 }}
              />
            </Spin>
          </TabPane>

          <TabPane tab="القوالب" key="templates">
            {/* Templates Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'اسم القالب',
                    dataIndex: 'name',
                    key: 'name',
                    ellipsis: true,
                  },
                  {
                    title: 'الموضوع',
                    dataIndex: 'subject',
                    key: 'subject',
                    ellipsis: true,
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
                    title: 'مرات الاستخدام',
                    dataIndex: 'usage_count',
                    key: 'usage_count',
                    render: (count) => (
                      <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
                    ),
                  },
                  {
                    title: 'آخر استخدام',
                    dataIndex: 'last_used',
                    key: 'last_used',
                    render: (date) => formatDate(date),
                  },
                ]}
                dataSource={templates}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} قالب`,
                }}
                locale={{
                  emptyText: 'لا توجد قوالب',
                }}
                scroll={{ x: 800 }}
              />
            </Spin>
          </TabPane>

          <TabPane tab="الإعدادات" key="settings">
            {/* Settings Form */}
            <Spin spinning={loading}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card title="إعدادات الإشعارات العامة" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>إشعارات البريد الإلكتروني</Text>
                        <Switch
                          checked={settings.email_notifications}
                          onChange={(checked) => handleUpdateSettings('email_notifications', checked)}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>إشعارات الرسائل النصية</Text>
                        <Switch
                          checked={settings.sms_notifications}
                          onChange={(checked) => handleUpdateSettings('sms_notifications', checked)}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>الإشعارات الفورية</Text>
                        <Switch
                          checked={settings.push_notifications}
                          onChange={(checked) => handleUpdateSettings('push_notifications', checked)}
                        />
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="إعدادات الإرسال التلقائي" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>إرسال رسالة ترحيب تلقائياً</Text>
                        <Switch
                          checked={settings.auto_send_welcome}
                          onChange={(checked) => handleUpdateSettings('auto_send_welcome', checked)}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>إرسال تذكيرات تلقائية</Text>
                        <Switch
                          checked={settings.auto_send_reminders}
                          onChange={(checked) => handleUpdateSettings('auto_send_reminders', checked)}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>ملخص يومي</Text>
                        <Switch
                          checked={settings.daily_digest}
                          onChange={(checked) => handleUpdateSettings('daily_digest', checked)}
                        />
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Spin>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Notification Modal */}
      <Modal
        title={editingItem ? 'تعديل الإشعار' : 'إنشاء إشعار جديد'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveNotification}
        >
          <Form.Item
            name="title"
            label="عنوان الإشعار"
            rules={[{ required: true, message: 'عنوان الإشعار مطلوب' }]}
          >
            <Input placeholder="أدخل عنوان الإشعار" />
          </Form.Item>

          <Form.Item
            name="message"
            label="محتوى الإشعار"
            rules={[{ required: true, message: 'محتوى الإشعار مطلوب' }]}
          >
            <TextArea rows={4} placeholder="أدخل محتوى الإشعار" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="نوع الإشعار"
                rules={[{ required: true, message: 'نوع الإشعار مطلوب' }]}
              >
                <Select placeholder="اختر نوع الإشعار">
                  <Option value="welcome">ترحيب</Option>
                  <Option value="system_update">تحديث النظام</Option>
                  <Option value="course_confirmation">تأكيد دورة</Option>
                  <Option value="reminder">تذكير</Option>
                  <Option value="announcement">إعلان</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="recipient_type"
                label="المستلمين"
                rules={[{ required: true, message: 'نوع المستلمين مطلوب' }]}
              >
                <Select placeholder="اختر المستلمين">
                  <Option value="all_users">جميع المستخدمين</Option>
                  <Option value="admins">المديرين فقط</Option>
                  <Option value="researchers">الباحثين فقط</Option>
                  <Option value="moderators">المشرفين فقط</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'تحديث' : 'حفظ كمسودة'}
              </Button>
              <Button
                type="default"
                onClick={() => {
                  form.validateFields().then(values => {
                    handleSaveNotification({ ...values, send_immediately: true });
                  });
                }}
              >
                حفظ وإرسال فوراً
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

export default NotificationsManagementPage;
