import { useState, useEffect } from 'react';
import { Card, List, Input, Select, Button, Tag, Typography, Row, Col, Pagination } from 'antd';
import { SearchOutlined, ReadOutlined, CalendarOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trainingService } from '../../services';
import { COURSE_STATUS } from '../../constants';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const CoursesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const loadCourses = async (page = 1, search = '', status = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        status: COURSE_STATUS.PUBLISHED, // Only show published courses to public
      };

      if (search) params.search = search;
      if (status) params.status = status;

      const response = await trainingService.getCourses(params);
      setCourses(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEnroll = (courseId) => {
    // Redirect to login/register for enrollment
    navigate('/login', {
      state: {
        from: `/courses`,
        message: 'Please login to enroll in courses'
      }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      [COURSE_STATUS.PUBLISHED]: 'green',
      [COURSE_STATUS.DRAFT]: 'blue',
      [COURSE_STATUS.ARCHIVED]: 'red',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ReadOutlined style={{ marginRight: '8px' }} />
          {t('courses.title')}
        </Title>
        <Paragraph type="secondary">
          {t('courses.description')}
        </Paragraph>
      </div>

      {/* Search and Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('courses.searchPlaceholder')}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
            >
              <Option value={COURSE_STATUS.PUBLISHED}>Published</Option>
              <Option value={COURSE_STATUS.ARCHIVED}>Archived</Option>
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <Text type="secondary">
              Showing {courses.length} of {total} courses
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Courses Grid */}
      <Row gutter={[24, 24]}>
        {courses.map((course) => (
          <Col xs={24} sm={12} lg={8} key={course.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                course.image ? (
                  <img
                    alt={course.title}
                    src={course.image}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      height: 200,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ReadOutlined style={{ fontSize: '48px', color: 'white' }} />
                  </div>
                )
              }
              actions={[
                <Button 
                  type="primary" 
                  onClick={() => handleEnroll(course.id)}
                  style={{ width: '90%' }}
                >
                  Enroll Now
                </Button>
              ]}
            >
              <div style={{ marginBottom: '12px' }}>
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {course.title}
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Tag color={getStatusColor(course.status)}>
                    {course.status?.toUpperCase()}
                  </Tag>
                  {course.duration && (
                    <Text type="secondary">
                      <ClockCircleOutlined style={{ marginRight: '4px' }} />
                      {course.duration} hours
                    </Text>
                  )}
                </div>
              </div>

              <Paragraph 
                ellipsis={{ rows: 3 }}
                style={{ marginBottom: '16px' }}
              >
                {course.description || 'No description available.'}
              </Paragraph>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {course.instructor && (
                    <Text type="secondary">
                      <UserOutlined style={{ marginRight: '4px' }} />
                      {course.instructor}
                    </Text>
                  )}
                </div>
                <div>
                  {course.start_date && (
                    <Text type="secondary">
                      <CalendarOutlined style={{ marginRight: '4px' }} />
                      {formatDate(course.start_date)}
                    </Text>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} courses`
            }
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <ReadOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} type="secondary">{t('courses.noCourses')}</Title>
          <Paragraph type="secondary">
            {searchTerm || statusFilter
              ? t('courses.tryAdjusting')
              : t('courses.noCoursesDesc')}
          </Paragraph>
          <Button type="primary" onClick={() => navigate('/register')}>
            {t('courses.registerToAccess')}
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CoursesPage;
