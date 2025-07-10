import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Divider, Tag, Avatar, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BookOutlined,
  ReadOutlined,
  ToolOutlined,
  UserOutlined,
  RightOutlined,
  CalendarOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  ExperimentOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { contentService, researchService, trainingService } from '../../services';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingCourses, setUpcomingCourses] = useState([]);

  useEffect(() => {
    // Load data for the news-style homepage
    const loadHomePageData = async () => {
      try {
        setLoading(true);

        // Load real announcements and posts from API
        try {
          const contentResponse = await contentService.getPublicContentFeed({
            page_size: 12, // Show more items since this is the main news section
            ordering: '-created_at' // Show newest first
          });

          // Transform the data to match the expected format
          const transformedAnnouncements = contentResponse.results.map(item => ({
            id: item.id,
            title: item.title,
            content: item.content || item.description || '',
            date: item.created_at || item.date,
            category: item.category || (item.type === 'announcement' ? 'Announcement' : 'News'),
            priority: item.priority || 'medium',
            views: item.view_count || 0,
            type: item.type
          }));

          setAnnouncements(transformedAnnouncements);
        } catch (error) {
          console.error('Failed to load announcements:', error);
          // Fallback to empty array if API fails
          setAnnouncements([]);
        }



        // Load upcoming courses (keeping mock data for now)
        // TODO: Replace with real API call when training API is ready for public access
        setUpcomingCourses([
          {
            id: 1,
            title: 'Advanced Plant Breeding Techniques',
            instructor: 'Prof. Karim Mahmoud',
            startDate: '2023-08-10',
            duration: '4 weeks',
            capacity: 25,
            enrolled: 18
          },
          {
            id: 2,
            title: 'Laboratory Methods in Agricultural Research',
            instructor: 'Dr. Laila Ahmed',
            startDate: '2023-09-05',
            duration: '6 weeks',
            capacity: 20,
            enrolled: 12
          },
        ]);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomePageData();
  }, []);

  // Agency vision and mission
  const agencyVision = {
    title: 'Advancing Agricultural Research for a Sustainable Future',
    description: 'The Agricultural Genetic Engineering Research Institute (AGERI) is dedicated to pioneering research in agricultural biotechnology to address food security challenges, improve crop resilience, and promote sustainable farming practices.',
    keyPoints: [
      'Developing innovative genetic solutions for agricultural challenges',
      'Enhancing food security through improved crop varieties',
      'Promoting sustainable and environmentally-friendly farming practices',
      'Building research capacity through training and knowledge transfer',
    ]
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Funding': '#52c41a',
      'Events': '#1890ff',
      'Facilities': '#faad14',
      'Research': '#722ed1',
      'Training': '#eb2f96',
      'Announcement': '#1890ff',
      'News': '#52c41a',
    };
    return colors[category] || '#666';
  };

  // Helper function to get gradient background for announcement cards
  const getGradientBackground = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
      'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div>
      {/* Hero Section with Agency Vision - Full Width */}
      <div style={{
        background: `
          linear-gradient(rgba(30, 60, 114, 0.8), rgba(42, 82, 152, 0.8)),
          url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: 'white',
        padding: '80px 0',
        marginBottom: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(30, 60, 114, 0.3)',
          zIndex: 1
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%'
        }}>
          <Row gutter={[48, 32]} align="middle" justify="center">
            <Col xs={24} lg={16} style={{ textAlign: 'center' }}>
              <div>
                <Title level={1} style={{
                  color: 'white',
                  marginBottom: '32px',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {agencyVision.title}
                </Title>
                <Paragraph style={{
                  fontSize: 'clamp(18px, 2.5vw, 24px)',
                  color: 'rgba(255, 255, 255, 0.95)',
                  marginBottom: '40px',
                  lineHeight: '1.7',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  maxWidth: '800px',
                  margin: '0 auto 40px auto'
                }}>
                  {agencyVision.description}
                </Paragraph>
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  marginBottom: '50px'
                }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<UserOutlined />}
                    onClick={() => navigate('/register')}
                    style={{
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a',
                      height: '56px',
                      fontSize: '18px',
                      padding: '0 32px',
                      borderRadius: '28px',
                      boxShadow: '0 4px 15px rgba(82, 196, 26, 0.4)'
                    }}
                  >
                    Join Our Research Community
                  </Button>
                  <Button
                    size="large"
                    icon={<ToolOutlined />}
                    onClick={() => navigate('/services')}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      height: '56px',
                      fontSize: '18px',
                      padding: '0 32px',
                      borderRadius: '28px',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    Explore Services
                  </Button>
                </div>

                {/* Key Focus Areas - Centered */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  maxWidth: '900px',
                  margin: '0 auto'
                }}>
                  {agencyVision.keyPoints.map((point, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      padding: '12px 20px',
                      borderRadius: '25px',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                      <Text style={{
                        color: 'rgba(255, 255, 255, 0.95)',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}>
                        {point}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Latest News & Announcements */}
        <div style={{ marginBottom: '48px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>
            Latest News & Announcements
          </Title>
          <Paragraph type="secondary" style={{ marginTop: '8px', marginBottom: 0 }}>
            Stay updated with the latest research developments, events, and important announcements from AGERI
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {announcements.map((announcement, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={announcement.id}>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  <div style={{
                    height: '200px',
                    background: getGradientBackground(index),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px'
                    }}>
                      <Tag color={getCategoryColor(announcement.category)}>
                        {announcement.category}
                      </Tag>
                    </div>
                    <div style={{
                      color: 'white',
                      fontSize: '48px'
                    }}>
                      {index === 0 ? <GlobalOutlined /> : index === 1 ? <TeamOutlined /> : <ExperimentOutlined />}
                    </div>
                  </div>
                }
              >
                <div style={{ marginBottom: '12px' }}>
                  <Title level={4} style={{ marginBottom: '8px', lineHeight: '1.3' }}>
                    {announcement.title}
                  </Title>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                    <Text type="secondary">
                      <CalendarOutlined style={{ marginRight: '4px' }} />
                      {formatDate(announcement.date)}
                    </Text>
                    <Text type="secondary">
                      <EyeOutlined style={{ marginRight: '4px' }} />
                      {announcement.views} views
                    </Text>
                  </div>
                </div>
                <Paragraph
                  ellipsis={{ rows: 3 }}
                  style={{ marginBottom: '16px' }}
                >
                  {announcement.content}
                </Paragraph>
                <Button
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => navigate(`/announcements/${announcement.id}`)}
                >
                  Read More <ArrowRightOutlined />
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
        </div>

        {/* Research Areas Section */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ margin: 0 }}>
              <ExperimentOutlined style={{ marginRight: '12px', color: '#722ed1' }} />
              Our Research Areas
            </Title>
            <Paragraph type="secondary" style={{ marginTop: '12px', fontSize: '16px' }}>
              Explore our cutting-edge research in agricultural biotechnology and genetic engineering
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <ExperimentOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <Title level={4}>Genetic Engineering</Title>
                <Paragraph type="secondary">
                  Advanced genetic modification techniques for crop improvement and disease resistance
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <GlobalOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <Title level={4}>Climate Adaptation</Title>
                <Paragraph type="secondary">
                  Developing climate-resilient crops to address environmental challenges
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto'
                }}>
                  <TeamOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <Title level={4}>Sustainable Agriculture</Title>
                <Paragraph type="secondary">
                  Promoting eco-friendly farming practices and sustainable food production
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Upcoming Training Section */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Title level={2} style={{ margin: 0 }}>
              <ReadOutlined style={{ marginRight: '12px', color: '#52c41a' }} />
              Training & Education
            </Title>
            <Paragraph type="secondary" style={{ marginTop: '12px', fontSize: '16px' }}>
              Enhance your skills with our professional training programs and courses
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {upcomingCourses.map((course) => (
              <Col xs={24} md={12} key={course.id}>
                <Card hoverable style={{ height: '100%' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <Title level={4} style={{ marginBottom: '8px', lineHeight: '1.3' }}>
                      {course.title}
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
                      Instructor: {course.instructor}
                    </Text>
                    <Row gutter={16} style={{ marginBottom: '12px' }}>
                      <Col span={12}>
                        <Text type="secondary">
                          <CalendarOutlined style={{ marginRight: '4px' }} />
                          {formatDate(course.startDate)}
                        </Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">
                          Duration: {course.duration}
                        </Text>
                      </Col>
                    </Row>
                    <div style={{ marginBottom: '16px' }}>
                      <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                        Enrolled: {course.enrolled}/{course.capacity} students
                      </Text>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(course.enrolled / course.capacity) * 100}%`,
                          height: '100%',
                          backgroundColor: '#52c41a',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                  <Button type="primary" block size="large">
                    Enroll Now
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Button
              type="default"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate('/courses')}
            >
              View All Training Programs
            </Button>
          </div>
        </div>
      </div>

      {/* Call to Action Section - Full Width */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '20px', fontSize: '2.5rem' }}>
            Join the Future of Agricultural Research
          </Title>
          <Paragraph style={{
            fontSize: '20px',
            marginBottom: '40px',
            color: '#666',
            lineHeight: '1.6'
          }}>
            Become part of our growing community of researchers, scientists, and innovators
            working together to solve global agricultural challenges.
          </Paragraph>

          <Row gutter={[24, 16]} justify="center">
            {isAuthenticated ? (
              // Show authenticated user actions
              <>
                <Col>
                  <Button
                    type="primary"
                    size="large"
                    icon={<DashboardOutlined />}
                    onClick={() => navigate('/app/dashboard')}
                    style={{
                      height: '56px',
                      fontSize: '18px',
                      padding: '0 32px',
                      borderRadius: '28px'
                    }}
                  >
                    Go to Dashboard
                  </Button>
                </Col>
                <Col>
                  <Button
                    size="large"
                    icon={<ReadOutlined />}
                    onClick={() => navigate('/courses')}
                    style={{
                      height: '56px',
                      fontSize: '18px',
                      padding: '0 32px',
                      borderRadius: '28px'
                    }}
                  >
                    Explore Training
                  </Button>
                </Col>
                <Col>
                  <Button
                    size="large"
                    icon={<ToolOutlined />}
                    onClick={() => navigate('/services')}
                    style={{
                      height: '56px',
                      fontSize: '18px',
                      padding: '0 32px',
                      borderRadius: '28px'
                    }}
                  >
                    Request Services
                  </Button>
                </Col>
              </>
            ) : (
              // Show guest user actions
              <>
                <Col>
                  <Button
                    type="primary"
                    size="large"
                    icon={<UserOutlined />}
                    onClick={() => navigate('/register')}
                    style={{
                      height: '56px',
                      fontSize: '18px',
                      padding: '0 32px',
                      borderRadius: '28px'
                    }}
                  >
                    Register as Researcher
                  </Button>
                </Col>
                <Col>
                  <Button
                    size="large"
                    icon={<ReadOutlined />}
                    onClick={() => navigate('/courses')}
                    style={{
                      height: '56px',
                      fontSize: '18px',
                      padding: '0 32px',
                      borderRadius: '28px'
                    }}
                  >
                    Explore Training
                  </Button>
                </Col>
                <Col>
                  <Button
                    size="large"
                    icon={<ToolOutlined />}
                    onClick={() => navigate('/services')}
                    style={{
                      height: '56px',
                      fontSize: '18px',
                      padding: '0 32px',
                      borderRadius: '28px'
                    }}
                  >
                    Request Services
                  </Button>
                </Col>
              </>
            )}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
