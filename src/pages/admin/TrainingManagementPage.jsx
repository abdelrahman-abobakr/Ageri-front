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
  Avatar,
  DatePicker
} from 'antd';
import {
  ReadOutlined,
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
  CalendarOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { trainingService } from '../../services';
import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
import RealTimeIndicator from '../../components/admin/RealTimeIndicator';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const TrainingManagementPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 10;

  // Real-time training statistics
  const { stats: trainingStats, loading: statsLoading, refresh: refreshStats } = useRealTimeStats('training', 30000);

  // Animated counters
  const totalCoursesCount = useAnimatedCounter(trainingStats?.totalCourses || 0);
  const activeSessionsCount = useAnimatedCounter(trainingStats?.activeSessions || 0);
  const totalEnrollmentsCount = useAnimatedCounter(trainingStats?.totalEnrollments || 0);
  const completedCoursesCount = useAnimatedCounter(trainingStats?.completedCourses || 0);

  useEffect(() => {
    if (activeTab === 'courses') {
      loadCourses();
    } else if (activeTab === 'sessions') {
      loadSessions();
    } else {
      loadEnrollments();
    }
  }, [activeTab, currentPage, searchTerm, statusFilter]);

  const loadCourses = async () => {
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

      const response = await trainingService.getCourses(params);
      setCourses(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load courses:', error);
      message.error('فشل في تحميل الدورات');
      // Fallback to mock data
      setCourses([
        {
          id: 1,
          title: 'أساسيات الزراعة المستدامة',
          description: 'دورة شاملة حول مبادئ وتقنيات الزراعة المستدامة',
          category: 'agriculture',
          level: 'beginner',
          duration: 40,
          price: 500.00,
          instructor: 'د. أحمد محمد',
          status: 'active',
          enrollment_count: 25,
          max_enrollment: 30,
          start_date: '2024-02-01',
          end_date: '2024-02-28',
          created_at: '2024-01-10T10:00:00Z'
        },
        {
          id: 2,
          title: 'تقنيات الري الحديثة',
          description: 'تعلم أحدث تقنيات الري وإدارة المياه في الزراعة',
          category: 'irrigation',
          level: 'intermediate',
          duration: 30,
          price: 400.00,
          instructor: 'د. فاطمة علي',
          status: 'upcoming',
          enrollment_count: 15,
          max_enrollment: 25,
          start_date: '2024-03-01',
          end_date: '2024-03-20',
          created_at: '2024-01-08T14:30:00Z'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await trainingService.getTrainingSessions(params);
      setSessions(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      message.error('فشل في تحميل الجلسات');
      // Fallback to mock data
      setSessions([
        {
          id: 1,
          course_title: 'أساسيات الزراعة المستدامة',
          title: 'مقدمة في الزراعة المستدامة',
          session_date: '2024-02-05T10:00:00Z',
          duration: 2,
          instructor: 'د. أحمد محمد',
          location: 'قاعة المحاضرات الرئيسية',
          attendees_count: 22,
          max_attendees: 30,
          status: 'scheduled'
        },
        {
          id: 2,
          course_title: 'تقنيات الري الحديثة',
          title: 'أنظمة الري بالتنقيط',
          session_date: '2024-03-05T14:00:00Z',
          duration: 3,
          instructor: 'د. فاطمة علي',
          location: 'المختبر التطبيقي',
          attendees_count: 0,
          max_attendees: 25,
          status: 'upcoming'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
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

      const response = await trainingService.getEnrollments(params);
      setEnrollments(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      message.error('فشل في تحميل التسجيلات');
      // Fallback to mock data
      setEnrollments([
        {
          id: 1,
          course_title: 'أساسيات الزراعة المستدامة',
          student_name: 'محمد أحمد',
          student_email: 'mohamed@example.com',
          enrollment_date: '2024-01-20T09:00:00Z',
          status: 'active',
          progress: 65,
          completion_date: null
        },
        {
          id: 2,
          course_title: 'تقنيات الري الحديثة',
          student_name: 'سارة محمود',
          student_email: 'sara@example.com',
          enrollment_date: '2024-01-25T11:30:00Z',
          status: 'pending',
          progress: 0,
          completion_date: null
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditCourse = (course) => {
    setEditingItem(course);
    form.setFieldsValue({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      instructor: course.instructor,
      max_enrollment: course.max_enrollment,
      start_date: course.start_date ? moment(course.start_date) : null,
      end_date: course.end_date ? moment(course.end_date) : null,
    });
    setModalVisible(true);
  };

  const handleDeleteCourse = async (course) => {
    confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذه الدورة؟',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await trainingService.deleteCourse(course.id);
          message.success('تم حذف الدورة بنجاح');
          loadCourses();
          refreshStats();
        } catch (error) {
          message.error('فشل في حذف الدورة');
        }
      },
    });
  };

  const handleSaveCourse = async (values) => {
    try {
      const courseData = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };

      if (editingItem) {
        await trainingService.updateCourse(editingItem.id, courseData);
        message.success('تم تحديث الدورة بنجاح');
      } else {
        await trainingService.createCourse(courseData);
        message.success('تم إنشاء الدورة بنجاح');
      }
      setModalVisible(false);
      loadCourses();
      refreshStats();
    } catch (error) {
      message.error('فشل في حفظ الدورة');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'نشطة' },
      upcoming: { color: 'blue', text: 'قادمة' },
      completed: { color: 'purple', text: 'مكتملة' },
      cancelled: { color: 'red', text: 'ملغية' },
      pending: { color: 'orange', text: 'في الانتظار' },
      scheduled: { color: 'cyan', text: 'مجدولة' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getLevelTag = (level) => {
    const levelConfig = {
      beginner: { color: 'green', text: 'مبتدئ' },
      intermediate: { color: 'orange', text: 'متوسط' },
      advanced: { color: 'red', text: 'متقدم' },
    };
    
    const config = levelConfig[level] || { color: 'default', text: level };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return moment(dateString).format('YYYY-MM-DD HH:mm');
  };

  const formatDuration = (hours) => {
    if (!hours) return '-';
    return `${hours} ساعة`;
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ReadOutlined style={{ marginRight: '8px' }} />
          إدارة التدريب
        </Title>
        <Text type="secondary">
          إدارة الدورات التدريبية والجلسات والتسجيلات
        </Text>
        <RealTimeIndicator />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="إجمالي الدورات"
              value={totalCoursesCount.value}
              prefix={<BookOutlined />}
              valueStyle={{
                color: '#1890ff',
                transition: 'all 0.3s ease'
              }}
              suffix={
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined spin={totalCoursesCount.isAnimating} />}
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
              title="الجلسات النشطة"
              value={activeSessionsCount.value}
              prefix={<CalendarOutlined />}
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
              title="إجمالي التسجيلات"
              value={totalEnrollmentsCount.value}
              prefix={<TeamOutlined />}
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
              title="الدورات المكتملة"
              value={completedCoursesCount.value}
              prefix={<CheckOutlined />}
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
          <TabPane tab="الدورات التدريبية" key="courses">
            {/* Courses Filters and Actions */}
            <div style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Search
                    placeholder="البحث في الدورات..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={() => loadCourses()}
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
                    <Option value="active">نشطة</Option>
                    <Option value="upcoming">قادمة</Option>
                    <Option value="completed">مكتملة</Option>
                    <Option value="cancelled">ملغية</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateCourse}
                  >
                    إضافة دورة جديدة
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Courses Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'عنوان الدورة',
                    dataIndex: 'title',
                    key: 'title',
                    ellipsis: true,
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          المدرب: {record.instructor}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'المستوى',
                    dataIndex: 'level',
                    key: 'level',
                    render: (level) => getLevelTag(level),
                  },
                  {
                    title: 'المدة',
                    dataIndex: 'duration',
                    key: 'duration',
                    render: (duration) => formatDuration(duration),
                  },
                  {
                    title: 'السعر',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `${price} جنيه`,
                  },
                  {
                    title: 'التسجيلات',
                    key: 'enrollments',
                    render: (_, record) => (
                      <div>
                        <Progress
                          percent={Math.round((record.enrollment_count / record.max_enrollment) * 100)}
                          size="small"
                          showInfo={false}
                        />
                        <Text style={{ fontSize: '12px' }}>
                          {record.enrollment_count}/{record.max_enrollment}
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
                    title: 'تاريخ البداية',
                    dataIndex: 'start_date',
                    key: 'start_date',
                    render: (date) => formatDate(date),
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
                            onClick={() => handleEditCourse(record)}
                          />
                        </Tooltip>
                        <Tooltip title="حذف">
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteCourse(record)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  },
                ]}
                dataSource={courses}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} دورة`,
                }}
                locale={{
                  emptyText: 'لا توجد دورات',
                }}
                scroll={{ x: 1000 }}
              />
            </Spin>
          </TabPane>

          <TabPane tab="الجلسات التدريبية" key="sessions">
            {/* Sessions Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'الدورة',
                    dataIndex: 'course_title',
                    key: 'course_title',
                    ellipsis: true,
                  },
                  {
                    title: 'عنوان الجلسة',
                    dataIndex: 'title',
                    key: 'title',
                    ellipsis: true,
                  },
                  {
                    title: 'التاريخ والوقت',
                    dataIndex: 'session_date',
                    key: 'session_date',
                    render: (date) => formatDate(date),
                  },
                  {
                    title: 'المدة',
                    dataIndex: 'duration',
                    key: 'duration',
                    render: (duration) => formatDuration(duration),
                  },
                  {
                    title: 'المدرب',
                    dataIndex: 'instructor',
                    key: 'instructor',
                  },
                  {
                    title: 'المكان',
                    dataIndex: 'location',
                    key: 'location',
                    ellipsis: true,
                  },
                  {
                    title: 'الحضور',
                    key: 'attendance',
                    render: (_, record) => (
                      <Text>
                        {record.attendees_count}/{record.max_attendees}
                      </Text>
                    ),
                  },
                  {
                    title: 'الحالة',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => getStatusTag(status),
                  },
                ]}
                dataSource={sessions}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} جلسة`,
                }}
                locale={{
                  emptyText: 'لا توجد جلسات',
                }}
                scroll={{ x: 1000 }}
              />
            </Spin>
          </TabPane>

          <TabPane tab="التسجيلات" key="enrollments">
            {/* Enrollments Table */}
            <Spin spinning={loading}>
              <Table
                columns={[
                  {
                    title: 'الدورة',
                    dataIndex: 'course_title',
                    key: 'course_title',
                    ellipsis: true,
                  },
                  {
                    title: 'الطالب',
                    dataIndex: 'student_name',
                    key: 'student_name',
                    render: (name, record) => (
                      <div>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {record.student_email}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'تاريخ التسجيل',
                    dataIndex: 'enrollment_date',
                    key: 'enrollment_date',
                    render: (date) => formatDate(date),
                  },
                  {
                    title: 'التقدم',
                    dataIndex: 'progress',
                    key: 'progress',
                    render: (progress) => (
                      <Progress percent={progress} size="small" />
                    ),
                  },
                  {
                    title: 'الحالة',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => getStatusTag(status),
                  },
                  {
                    title: 'تاريخ الإكمال',
                    dataIndex: 'completion_date',
                    key: 'completion_date',
                    render: (date) => formatDate(date),
                  },
                ]}
                dataSource={enrollments}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} من ${total} تسجيل`,
                }}
                locale={{
                  emptyText: 'لا توجد تسجيلات',
                }}
                scroll={{ x: 800 }}
              />
            </Spin>
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Course Modal */}
      <Modal
        title={editingItem ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveCourse}
        >
          <Form.Item
            name="title"
            label="عنوان الدورة"
            rules={[{ required: true, message: 'عنوان الدورة مطلوب' }]}
          >
            <Input placeholder="أدخل عنوان الدورة" />
          </Form.Item>

          <Form.Item
            name="description"
            label="وصف الدورة"
            rules={[{ required: true, message: 'وصف الدورة مطلوب' }]}
          >
            <TextArea rows={3} placeholder="أدخل وصف تفصيلي للدورة" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="فئة الدورة"
                rules={[{ required: true, message: 'فئة الدورة مطلوبة' }]}
              >
                <Select placeholder="اختر فئة الدورة">
                  <Option value="agriculture">الزراعة</Option>
                  <Option value="irrigation">الري</Option>
                  <Option value="soil_science">علوم التربة</Option>
                  <Option value="plant_protection">وقاية النبات</Option>
                  <Option value="technology">التكنولوجيا الزراعية</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="level"
                label="مستوى الدورة"
                rules={[{ required: true, message: 'مستوى الدورة مطلوب' }]}
              >
                <Select placeholder="اختر مستوى الدورة">
                  <Option value="beginner">مبتدئ</Option>
                  <Option value="intermediate">متوسط</Option>
                  <Option value="advanced">متقدم</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="duration"
                label="المدة (ساعات)"
                rules={[{ required: true, message: 'المدة مطلوبة' }]}
              >
                <Input type="number" placeholder="40" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="price"
                label="السعر (جنيه)"
                rules={[{ required: true, message: 'السعر مطلوب' }]}
              >
                <Input type="number" placeholder="500.00" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="max_enrollment"
                label="الحد الأقصى للتسجيل"
                rules={[{ required: true, message: 'الحد الأقصى مطلوب' }]}
              >
                <Input type="number" placeholder="30" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="instructor"
            label="المدرب"
            rules={[{ required: true, message: 'اسم المدرب مطلوب' }]}
          >
            <Input placeholder="أدخل اسم المدرب" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="start_date"
                label="تاريخ البداية"
                rules={[{ required: true, message: 'تاريخ البداية مطلوب' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="end_date"
                label="تاريخ النهاية"
                rules={[{ required: true, message: 'تاريخ النهاية مطلوب' }]}
              >
                <DatePicker style={{ width: '100%' }} />
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

export default TrainingManagementPage;
