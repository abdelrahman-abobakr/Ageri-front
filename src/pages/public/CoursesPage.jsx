import React, { useEffect, useState } from "react";
import { Button, Card, Row, Col, Tag, Typography, Input, Select, Spin, message, Modal } from 'antd';
import { SearchOutlined, BookOutlined, ClockCircleOutlined, UserOutlined, CalendarOutlined, FormOutlined } from '@ant-design/icons';
import { trainingService } from '../../services';
import GuestEnrollmentForm from '../../components/enrollment/GuestEnrollmentForm';
import EnrollmentSuccess from '../../components/enrollment/EnrollmentSuccess';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const PAGE_SIZE = 10;

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: 'published'
  });

  // Enrollment modal states
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentResult, setEnrollmentResult] = useState(null);

  const fetchCourses = async (pageNum = 1, currentFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      console.log('🔄 Fetching courses with filters:', { page: pageNum, ...currentFilters });

      const params = {
        page: pageNum,
        page_size: PAGE_SIZE,
        ...currentFilters
      };

      const response = await trainingService.getCourses(params);
      setCourses(response.results || []);
      setCount(response.count || 0);

      console.log('✅ Courses loaded:', response.results?.length || 0);
    } catch (err) {
      console.error('❌ Failed to load courses:', err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to load courses."
      );
      message.error('فشل في تحميل الدورات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(page, filters);
    // eslint-disable-next-line
  }, [page]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    fetchCourses(1, newFilters);
  };

  const handleSearch = (value) => {
    handleFilterChange('search', value);
  };

  const handleNext = () => {
    if (count > page * PAGE_SIZE) {
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const getTrainingTypeTag = (type) => {
    const typeConfig = {
      course: { color: 'blue', text: 'دورة' },
      workshop: { color: 'green', text: 'ورشة عمل' },
      seminar: { color: 'purple', text: 'ندوة' },
      summer_training: { color: 'orange', text: 'تدريب صيفي' },
    };
    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Enrollment handlers
  const handleEnrollClick = (course) => {
    // Check if enrollment is still open
    const registrationDeadline = new Date(course.registration_deadline);
    const now = new Date();

    if (registrationDeadline < now) {
      message.error('انتهت فترة التسجيل لهذه الدورة');
      return;
    }

    // Check if course is full
    if (course.current_enrollment >= course.max_participants) {
      message.error('الدورة مكتملة العدد');
      return;
    }

    setSelectedCourse(course);
    setEnrollmentModalVisible(true);
  };

  const handleEnrollmentSuccess = (result) => {
    setEnrollmentResult(result);
    setEnrollmentModalVisible(false);
    setSuccessModalVisible(true);

    // Refresh courses to update enrollment count
    fetchCourses(page);
  };

  const handleEnrollmentCancel = () => {
    setEnrollmentModalVisible(false);
    setSelectedCourse(null);
  };

  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    setEnrollmentResult(null);
    setSelectedCourse(null);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      {/* Page Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Title level={1}>
          <BookOutlined style={{ marginRight: "8px" }} />
          الدورات التدريبية
        </Title>
        <Paragraph type="secondary">
          اكتشف مجموعة متنوعة من الدورات التدريبية المتخصصة في المجال الزراعي
        </Paragraph>
      </div>

      {/* Filters Section */}
      <Card style={{ marginBottom: "2rem" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="البحث في الدورات..."
              allowClear
              enterButton={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="نوع الدورة"
              allowClear
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value)}
            >
              <Option value="course">دورة</Option>
              <Option value="workshop">ورشة عمل</Option>
              <Option value="seminar">ندوة</Option>
              <Option value="summer_training">تدريب صيفي</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Loading and Error States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Spin size="large" />
          <div style={{ marginTop: "1rem" }}>جاري تحميل الدورات...</div>
        </div>
      )}

      {error && (
        <Card style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Text type="danger">{error}</Text>
        </Card>
      )}

      {!loading && !error && courses.length === 0 && (
        <Card style={{ textAlign: "center" }}>
          <Text type="secondary">لا توجد دورات متاحة حالياً</Text>
        </Card>
      )}
      {/* Courses Grid */}
      {!loading && !error && courses.length > 0 && (
        <Row gutter={[24, 24]}>
          {courses.map((course) => (
            <Col xs={24} sm={12} lg={8} key={course.id}>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  course.featured_image && (
                    <img
                      alt={course.title}
                      src={course.featured_image}
                      style={{ height: 200, objectFit: 'cover' }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )
                }
                actions={[
                  <Button type="primary" size="small">
                    عرض التفاصيل
                  </Button>,
                  <Button
                    size="small"
                    icon={<FormOutlined />}
                    onClick={() => handleEnrollClick(course)}
                    disabled={
                      course.current_enrollment >= course.max_participants ||
                      new Date(course.registration_deadline) < new Date()
                    }
                  >
                    {course.current_enrollment >= course.max_participants
                      ? 'مكتملة العدد'
                      : new Date(course.registration_deadline) < new Date()
                      ? 'انتهت فترة التسجيل'
                      : 'التسجيل'
                    }
                  </Button>
                ]}
              >
                <Card.Meta
                  title={
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        {course.course_name}
                        {course.is_featured && (
                          <Tag color="gold" style={{ marginLeft: '8px' }}>
                            مميز
                          </Tag>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>
                        كود: {course.course_code}
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: '12px' }}>
                        {course.description}
                      </Paragraph>

                      <div style={{ marginBottom: '8px' }}>
                        {getTrainingTypeTag(course.type)}
                      </div>

                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                        <UserOutlined style={{ marginRight: '4px' }} />
                        المدرب: {course.instructor || 'غير محدد'}
                      </div>

                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                        <ClockCircleOutlined style={{ marginRight: '4px' }} />
                        {course.training_hours} ساعة تدريبية
                      </div>

                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                        <CalendarOutlined style={{ marginRight: '4px' }} />
                        من {course.start_date} إلى {course.end_date}
                      </div>

                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: course.cost === 0 ? '#52c41a' : '#1890ff',
                        marginBottom: '8px'
                      }}>
                        {course.cost === 0 ? 'مجاني' : `${course.cost} جنيه`}
                      </div>

                      <div style={{ fontSize: '12px', color: '#999' }}>
                        المشاركون: {course.current_enrollment || 0} / {course.max_participants}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
      {/* Pagination */}
      {!loading && !error && courses.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Row justify="center" align="middle" gutter={16}>
            <Col>
              <Button
                onClick={handlePrev}
                disabled={page === 1 || loading}
                type={page > 1 ? "default" : "default"}
              >
                السابق
              </Button>
            </Col>
            <Col>
              <Text strong>
                صفحة {page} من {Math.ceil(count / PAGE_SIZE) || 1}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                إجمالي {count} دورة
              </Text>
            </Col>
            <Col>
              <Button
                onClick={handleNext}
                disabled={count <= page * PAGE_SIZE || loading}
                type={count > page * PAGE_SIZE ? "default" : "default"}
              >
                التالي
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Enrollment Modal */}
      <Modal
        title="التسجيل في الدورة"
        open={enrollmentModalVisible}
        onCancel={handleEnrollmentCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedCourse && (
          <GuestEnrollmentForm
            course={selectedCourse}
            onSuccess={handleEnrollmentSuccess}
            onCancel={handleEnrollmentCancel}
          />
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        title="تم التسجيل بنجاح!"
        open={successModalVisible}
        onCancel={handleSuccessClose}
        footer={null}
        width={1000}
        destroyOnClose
      >
        {enrollmentResult && selectedCourse && (
          <EnrollmentSuccess
            enrollment={enrollmentResult.enrollment}
            course={selectedCourse}
            onBackToCourses={handleSuccessClose}
          />
        )}
      </Modal>
    </div>
  );
};

export default CoursesPage;
