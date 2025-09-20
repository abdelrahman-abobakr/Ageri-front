import React, { useEffect, useState } from "react";
import { Button, Card, Row, Col, Tag, Typography, Input, Select, Spin, message, Modal } from 'antd';
import { SearchOutlined, BookOutlined, ClockCircleOutlined, UserOutlined, CalendarOutlined, FormOutlined } from '@ant-design/icons';
import { trainingService } from '../../services';
import GuestEnrollmentForm from '../../components/enrollment/GuestEnrollmentForm';
import EnrollmentSuccess from '../../components/enrollment/EnrollmentSuccess';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  // Enrollment modal states
  const [enrollmentModalVisible, setEnrollmentModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentResult, setEnrollmentResult] = useState(null);

  // Details modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState(null);

  const fetchCourses = async (pageNum = 1, currentFilters = filters) => {
    setLoading(true);
    setError("");
    try {

      const params = {
        page: pageNum,
        page_size: PAGE_SIZE,
        ...currentFilters
      };

      const response = await trainingService.getCourses(params);
      setCourses(response.results || []);
      setCount(response.count || 0);

    } catch (err) {
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

  // Details modal handlers
  const handleShowDetails = (course) => {
    setSelectedCourseForDetails(course);
    setDetailsModalVisible(true);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalVisible(false);
    setSelectedCourseForDetails(null);
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
          {t('courses.title')}
        </Title>
        <Paragraph type="secondary">
          {t('courses.description')}
        </Paragraph>
      </div>

      {/* Filters Section */}
      <Card style={{ marginBottom: "2rem" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('courses.searchPlaceholder')}
              allowClear
              enterButton={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder={t('courses.typePlaceholder')}
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
          <div style={{ marginTop: "1rem" }}>{t('courses.loading')}</div>
        </div>
      )}

      {error && (
        <Card style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Text type="danger">{error}</Text>
        </Card>
      )}

      {!loading && !error && courses.length === 0 && (
        <Card style={{ textAlign: "center" }}>
          <Text type="secondary">{t('courses.noCourses')}</Text>
        </Card>
      )}

      {/* Courses Grid */}
      {!loading && !error && courses.length > 0 && (
        <Row gutter={[24, 24]}>
          {courses.map((course) => (
            <Col xs={24} sm={12} lg={8} key={course.id}>
              <Card
                hoverable
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
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
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                          {t('courses.code')} {course.course_code}
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
                          {t('courses.instructor')}: {course.instructor || 'غير محدد'}
                        </div>

                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          {course.training_hours} {t('courses.hours')}
                        </div>

                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                          <CalendarOutlined style={{ marginRight: '4px' }} />
                          {t('courses.from')} {course.start_date} {t('courses.to')} {course.end_date}
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
                          {t('courses.participants')} {course.current_enrollment || 0} / {course.max_participants}
                        </div>
                      </div>
                    }
                  />

                  {/* Buttons inside card content */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '16px',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'space-between'
                  }}>
                    <Button
                      type="primary"
                      size="small"
                      style={{ flex: 1 }}
                      onClick={() => handleShowDetails(course)}
                    >
                      {t('courses.viewDetails')}
                    </Button>
                    <Button
                      size="small"
                      icon={<FormOutlined />}
                      onClick={() => handleEnrollClick(course)}
                      disabled={
                        course.current_enrollment >= course.max_participants ||
                        new Date(course.registration_deadline) < new Date()
                      }
                      style={{ flex: 1 }}
                    >
                      {course.current_enrollment >= course.max_participants
                        ? t('courses.full')
                        : new Date(course.registration_deadline) < new Date()
                          ? t('courses.registrationClosed')
                          : t('courses.enroll')
                      }
                    </Button>
                  </div>
                </div>
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
                {t('common.previous')}
              </Button>
            </Col>
            <Col>
              <Text strong>
                {t('courses.page')} {page} {t('courses.from')} {Math.ceil(count / PAGE_SIZE) || 1}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t('courses.total')} {count} {t('courses.course')}
              </Text>
            </Col>
            <Col>
              <Button
                onClick={handleNext}
                disabled={count <= page * PAGE_SIZE || loading}
                type={count > page * PAGE_SIZE ? "default" : "default"}
              >
                {t('common.next')}
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Course Details Modal */}
      <Modal
        title="تفاصيل الدورة"
        open={detailsModalVisible}
        onCancel={handleDetailsModalClose}
        footer={[
          <Button key="close" onClick={handleDetailsModalClose}>
            إغلاق
          </Button>,
          <Button
            key="enroll"
            type="primary"
            icon={<FormOutlined />}
            onClick={() => {
              handleDetailsModalClose();
              handleEnrollClick(selectedCourseForDetails);
            }}
            disabled={
              selectedCourseForDetails?.current_enrollment >= selectedCourseForDetails?.max_participants ||
              new Date(selectedCourseForDetails?.registration_deadline) < new Date()
            }
          >
            {selectedCourseForDetails?.current_enrollment >= selectedCourseForDetails?.max_participants
              ? 'مكتملة العدد'
              : new Date(selectedCourseForDetails?.registration_deadline) < new Date()
                ? 'انتهت فترة التسجيل'
                : 'التسجيل في الدورة'
            }
          </Button>
        ]}
        width={800}
      >
        {selectedCourseForDetails && (
          <div>
            {/* Course Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                {selectedCourseForDetails.course_name}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                كود الدورة: {selectedCourseForDetails.course_code}
              </Text>
              <div style={{ marginTop: '8px' }}>
                {getTrainingTypeTag(selectedCourseForDetails.type)}
                {selectedCourseForDetails.is_featured && (
                  <Tag color="gold" style={{ marginLeft: '8px' }}>مميز</Tag>
                )}
              </div>
            </div>

            {/* Course Description */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={5}>وصف الدورة</Title>
              <Paragraph>{selectedCourseForDetails.description}</Paragraph>
            </div>

            {/* Course Details Grid */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                    <div>
                      <Text strong>المدرب</Text>
                      <br />
                      <Text>{selectedCourseForDetails.instructor || 'غير محدد'}</Text>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <ClockCircleOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
                    <div>
                      <Text strong>ساعات التدريب</Text>
                      <br />
                      <Text>{selectedCourseForDetails.training_hours} ساعة</Text>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <CalendarOutlined style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }} />
                    <div>
                      <Text strong>تاريخ البداية</Text>
                      <br />
                      <Text>{selectedCourseForDetails.start_date}</Text>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <CalendarOutlined style={{ fontSize: '24px', color: '#f5222d', marginBottom: '8px' }} />
                    <div>
                      <Text strong>تاريخ النهاية</Text>
                      <br />
                      <Text>{selectedCourseForDetails.end_date}</Text>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <Text style={{
                      fontSize: '24px',
                      color: selectedCourseForDetails.cost === 0 ? '#52c41a' : '#1890ff',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      💰
                    </Text>
                    <div>
                      <Text strong>التكلفة</Text>
                      <br />
                      <Text style={{
                        color: selectedCourseForDetails.cost === 0 ? '#52c41a' : '#1890ff',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        {selectedCourseForDetails.cost === 0 ? 'مجاني' : `${selectedCourseForDetails.cost} جنيه`}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col span={12}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
                    <div>
                      <Text strong>المشاركون</Text>
                      <br />
                      <Text>
                        {selectedCourseForDetails.current_enrollment || 0} / {selectedCourseForDetails.max_participants}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Registration Status */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              background: selectedCourseForDetails.current_enrollment >= selectedCourseForDetails.max_participants ||
                new Date(selectedCourseForDetails.registration_deadline) < new Date()
                ? '#fff2f0' : '#f6ffed',
              border: selectedCourseForDetails.current_enrollment >= selectedCourseForDetails.max_participants ||
                new Date(selectedCourseForDetails.registration_deadline) < new Date()
                ? '1px solid #ffccc7' : '1px solid #b7eb8f'
            }}>
              <Text strong style={{
                color: selectedCourseForDetails.current_enrollment >= selectedCourseForDetails.max_participants ||
                  new Date(selectedCourseForDetails.registration_deadline) < new Date()
                  ? '#cf1322' : '#389e0d'
              }}>
                حالة التسجيل: {' '}
                {selectedCourseForDetails.current_enrollment >= selectedCourseForDetails.max_participants
                  ? 'الدورة مكتملة العدد'
                  : new Date(selectedCourseForDetails.registration_deadline) < new Date()
                    ? 'انتهت فترة التسجيل'
                    : 'التسجيل متاح'
                }
              </Text>
            </div>
          </div>
        )}
      </Modal>

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