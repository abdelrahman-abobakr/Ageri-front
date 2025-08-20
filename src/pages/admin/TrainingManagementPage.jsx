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
import { trainingService, CourseService } from '../../services';
import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
import RealTimeIndicator from '../../components/admin/RealTimeIndicator';
import CourseForm from '../../components/forms/CourseForm';
import EnrollmentManagement from '../../components/admin/EnrollmentManagement';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const pageSize = 10;

  // Real-time training statistics
  const { stats: trainingStats, loading: statsLoading, refresh: refreshStats } = useRealTimeStats('training', 30000);

  // Animated counters
  const totalCoursesCount = useAnimatedCounter(trainingStats?.totalCourses || 0);
  const activeSessionsCount = useAnimatedCounter(trainingStats?.activeSessions || 0);
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

      const response = await CourseService.getCourses(params);
      setCourses(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      message.error('فشل في تحميل الدورات');
      setCourses([]);
      setTotal(0);
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
      message.error('فشل في تحميل الجلسات');
      setSessions([]);
      setTotal(0);
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
      message.error('فشل في تحميل التسجيلات');
      setEnrollments([]);
      setTotal(0);
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
    setModalVisible(true);
  };

  const handleDeleteCourse = async (course) => {

    // Direct DELETE request - no modal
    try {

      const response = await fetch(`http://localhost:8000/api/training/courses/${course.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        }
      });


      // Try to get response text
      let responseText = '';
      try {
        responseText = await response.text();
      } catch (e) {
      }

      // Show API response to user
      if (response.ok) {
        message.success(`✅ تم حذف الدورة بنجاح - Status: ${response.status}`);
        loadCourses(); // Refresh list
        refreshStats();
      } else {
        message.error(`❌ فشل الحذف - Status: ${response.status} - Response: ${responseText}`);
      }

    } catch (error) {
      message.error(`❌ خطأ في الشبكة: ${error.message}`);
    }
  };

  const handleCourseSuccess = (course) => {
    setModalVisible(false);
    setEditingItem(null);
    loadCourses();
    refreshStats();
  };

  const handleCourseCancel = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedCourses.length === 0) {
      message.warning('يرجى اختيار دورة واحدة على الأقل للحذف');
      return;
    }

    Modal.confirm({
      title: 'تأكيد حذف الدورات',
      content: `هل أنت متأكد من حذف ${selectedCourses.length} دورة؟`,
      okText: 'نعم، احذف الكل',
      cancelText: 'إلغاء',
      okType: 'danger',
      onOk: async () => {
        try {
          // Delete each course
          for (const course of selectedCourses) {
            const response = await fetch(`http://localhost:8000/api/training/courses/${course.id}/`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json',
              }
            });

            if (!response.ok) {
              throw new Error(`Failed to delete course ${course.course_name}`);
            }
          }

          // Success
          message.success(`تم حذف ${selectedCourses.length} دورة بنجاح`);
          setSelectedRowKeys([]);
          setSelectedCourses([]);
          loadCourses();
          refreshStats();

        } catch (error) {
          message.error('فشل في حذف بعض الدورات');
        }
      }
    });
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
        <Col xs={24} sm={12} md={8}>
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
        <Col xs={24} sm={12} md={8}>
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
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{
            marginBottom: 24,
            gap: '48px', // Increased from 32px
            paddingLeft: '16px', // Add some left padding
            paddingRight: '16px' // Add some right padding
          }}
          tabBarGutter={96} // Increased from 64
          style={{
            '& .ant-tabs-tab': {
              marginRight: '48px !important' // Force more space between tabs
            }
          }}
        >
          <TabPane
            tab={
              <span style={{ padding: '8px 16px' }}>
                الدورات التدريبية
              </span>
            }
            key="courses"
          >
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
                  <Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreateCourse}
                    >
                      إضافة دورة جديدة
                    </Button>




                    {selectedRowKeys.length > 0 && (
                      <>
                        <Button
                          danger
                          onClick={handleBulkDelete}
                          icon={<DeleteOutlined />}
                        >
                          حذف المحدد ({selectedRowKeys.length})
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedRowKeys([]);
                            setSelectedCourses([]);
                          }}
                        >
                          إلغاء التحديد
                        </Button>
                      </>
                    )}
                  </Space>
                </Col>
              </Row>
            </div>

            {/* Selection Summary */}
            {selectedRowKeys.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '6px'
              }}>
                <Text>
                  تم تحديد <strong>{selectedRowKeys.length}</strong> دورة من أصل <strong>{courses.length}</strong>
                </Text>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setSelectedRowKeys([]);
                    setSelectedCourses([]);
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  إلغاء التحديد
                </Button>
              </div>
            )}

            {/* Courses Table */}
            <Spin spinning={loading}>
              <Table
                rowSelection={{
                  selectedRowKeys,
                  onChange: (selectedKeys, selectedRows) => {
                    setSelectedRowKeys(selectedKeys);
                    setSelectedCourses(selectedRows);
                  },
                  getCheckboxProps: (record) => ({
                    disabled: false,
                    name: record.course_name,
                  }),
                }}
                columns={[
                  {
                    title: 'عنوان الدورة',
                    dataIndex: 'course_name',
                    key: 'course_name',
                    ellipsis: true,
                    render: (text, record) => (
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          كود: {record.course_code} | المدرب: {record.instructor}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'نوع الدورة',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type) => {
                      const typeConfig = {
                        course: { color: 'blue', text: 'دورة' },
                        workshop: { color: 'green', text: 'ورشة عمل' },
                        seminar: { color: 'purple', text: 'ندوة' },
                        summer_training: { color: 'orange', text: 'تدريب صيفي' },
                      };
                      const config = typeConfig[type] || { color: 'default', text: type };
                      return <Tag color={config.color}>{config.text}</Tag>;
                    },
                  },
                  {
                    title: 'ساعات التدريب',
                    dataIndex: 'training_hours',
                    key: 'training_hours',
                    render: (hours) => `${hours} ساعة`,
                  },
                  {
                    title: 'التكلفة',
                    dataIndex: 'cost',
                    key: 'cost',
                    render: (cost, record) => (
                      <div>
                        <span>{cost} جنيه</span>
                        {record.is_featured && (
                          <Tag color="gold" style={{ marginLeft: '4px' }}>مميز</Tag>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: 'المشاركون',
                    key: 'participants',
                    render: (_, record) => (
                      <div>
                        <Progress
                          percent={Math.round((record.current_enrollment / record.max_participants) * 100)}
                          size="small"
                          showInfo={false}
                        />
                        <Text style={{ fontSize: '12px' }}>
                          {record.current_enrollment || 0}/{record.max_participants}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(record);
                            }}
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



          <TabPane
            tab={
              <span style={{ padding: '8px 16px' }}>
                إدارة التسجيلات
              </span>
            }
            key="enrollments"
          >
            <EnrollmentManagement />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Course Modal */}
      <Modal
        title={editingItem ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
        open={modalVisible}
        onCancel={handleCourseCancel}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <CourseForm
          courseId={editingItem?.id}
          onSuccess={handleCourseSuccess}
          onCancel={handleCourseCancel}
        />
      </Modal>
    </div>
  );
};

export default TrainingManagementPage;
