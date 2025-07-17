import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Divider, 
  Tag, 
  Avatar, 
  Space, 
  Carousel,
  Spin,
  Image
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  LeftOutlined,
  RightOutlined as CarouselRightOutlined
} from '@ant-design/icons';
import { contentService, organizationService } from '../../services';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [organizationData, setOrganizationData] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Add CSS animations for carousel
  const carouselAnimations = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .carousel-slide-content {
      animation: fadeInUp 1s ease-out;
    }
  `;

  useEffect(() => {
    // Load data for the news-style homepage
    const loadHomePageData = async () => {
      try {
        setLoading(true);

        // Load organization settings
        try {
          setSettingsLoading(true);
          const orgData = await organizationService.getPublicSettings();
          setOrganizationData(orgData);
        } catch (error) {
          console.error('Failed to load organization settings:', error);
          // Set default organization data
          setOrganizationData({
            name: "منظمة البحث العلمي الزراعي",
            vision: "أن نكون المنظمة الرائدة في البحث العلمي الزراعي والابتكار التكنولوجي في المنطقة",
            vision_image: null, // Will use default image
            mission: "نسعى لتطوير الحلول المبتكرة في مجال الزراعة والبحث العلمي لخدمة المجتمع والبيئة",
            mission_image: null, // Will use default image
            about: "منظمة رائدة في مجال البحث العلمي الزراعي، نعمل على تطوير التقنيات الحديثة والحلول المستدامة لتحسين الإنتاج الزراعي وحماية البيئة.",
            email: "info@agri-research.org",
            phone: "+966 11 123 4567",
            address: "الرياض، المملكة العربية السعودية",
            website: "https://agri-research.org",
            facebook: "https://facebook.com/agri-research",
            twitter: "https://twitter.com/agri_research",
            linkedin: "https://linkedin.com/company/agri-research",
            instagram: "https://instagram.com/agri_research"
          });
        } finally {
          setSettingsLoading(false);
        }

        // Load announcements and posts separately
        try {
          const [announcementsResponse, postsResponse] = await Promise.allSettled([
            contentService.getPublicAnnouncements({
              page_size: 6,
              ordering: '-created_at'
            }),
            contentService.getPublicPosts({
              page_size: 8,
              ordering: '-created_at'
            })
          ]);

          // Process announcements
          if (announcementsResponse.status === 'fulfilled') {
            const transformedAnnouncements = announcementsResponse.value.results.map(item => ({
              id: item.id,
              title: item.title,
              content: item.content || item.description || '',
              date: item.created_at || item.date,
              category: 'إعلان',
              priority: item.priority || 'medium',
              views: item.view_count || 0,
              type: 'announcement',
              excerpt: item.excerpt || item.content?.substring(0, 150) + '...'
            }));
            setAnnouncements(transformedAnnouncements);
          }

          // Process posts
          if (postsResponse.status === 'fulfilled') {
            const transformedPosts = postsResponse.value.results.map(item => ({
              id: item.id,
              title: item.title,
              content: item.content || item.description || '',
              date: item.created_at || item.date,
              category: item.category || 'أخبار',
              priority: item.priority || 'medium',
              views: item.view_count || 0,
              type: 'post',
              excerpt: item.excerpt || item.content?.substring(0, 150) + '...',
              author: item.author || 'فريق التحرير'
            }));
            setPosts(transformedPosts);
          }
        } catch (error) {
          console.error('Failed to load content:', error);
          // Set fallback content with mock data
          setAnnouncements([
            {
              id: 1,
              title: 'إعلان عن ورشة الزراعة المستدامة',
              content: 'ورشة تدريبية حول أحدث تقنيات الزراعة المستدامة والممارسات البيئية الصديقة.',
              date: new Date().toISOString(),
              category: 'إعلان',
              views: 245,
              type: 'announcement',
              excerpt: 'ورشة تدريبية حول أحدث تقنيات الزراعة المستدامة والممارسات البيئية الصديقة للبيئة.'
            },
            {
              id: 2,
              title: 'فتح باب التسجيل للدورات الجديدة',
              content: 'نعلن عن فتح باب التسجيل للدورات التدريبية الجديدة في مجال البحث العلمي.',
              date: new Date(Date.now() - 86400000).toISOString(),
              category: 'إعلان',
              views: 189,
              type: 'announcement',
              excerpt: 'نعلن عن فتح باب التسجيل للدورات التدريبية الجديدة في مجال البحث العلمي والتطوير.'
            }
          ]);

          setPosts([
            {
              id: 1,
              title: 'أحدث التطورات في تقنيات الزراعة الذكية',
              content: 'مقال شامل حول أحدث التطورات في مجال الزراعة الذكية واستخدام التكنولوجيا.',
              date: new Date().toISOString(),
              category: 'أخبار',
              views: 567,
              type: 'post',
              excerpt: 'مقال شامل حول أحدث التطورات في مجال الزراعة الذكية واستخدام التكنولوجيا الحديثة.',
              author: 'د. أحمد محمد'
            },
            {
              id: 2,
              title: 'نتائج البحث الجديد في مقاومة الآفات',
              content: 'دراسة جديدة تكشف عن طرق مبتكرة لمقاومة الآفات الزراعية بطرق طبيعية.',
              date: new Date(Date.now() - 172800000).toISOString(),
              category: 'بحث',
              views: 423,
              type: 'post',
              excerpt: 'دراسة جديدة تكشف عن طرق مبتكرة لمقاومة الآفات الزراعية بطرق طبيعية وصديقة للبيئة.',
              author: 'د. فاطمة علي'
            },
            {
              id: 3,
              title: 'تأثير التغير المناخي على الإنتاج الزراعي',
              content: 'تحليل شامل لتأثير التغير المناخي على الإنتاج الزراعي والحلول المقترحة.',
              date: new Date(Date.now() - 259200000).toISOString(),
              category: 'أخبار',
              views: 334,
              type: 'post',
              excerpt: 'تحليل شامل لتأثير التغير المناخي على الإنتاج الزراعي والحلول المقترحة للتكيف.',
              author: 'د. محمد حسن'
            },
            {
              id: 4,
              title: 'ابتكارات جديدة في مجال الري الذكي',
              content: 'استعراض لأحدث الابتكارات في مجال أنظمة الري الذكي وتوفير المياه.',
              date: new Date(Date.now() - 345600000).toISOString(),
              category: 'تقنية',
              views: 278,
              type: 'post',
              excerpt: 'استعراض لأحدث الابتكارات في مجال أنظمة الري الذكي وتوفير المياه في الزراعة.',
              author: 'د. سارة أحمد'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomePageData();
  }, []);

  // Default images for agricultural research theme
  const getDefaultImage = (type) => {
    const defaultImages = {
      vision: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Agricultural field with modern farming
      mission: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Scientists in laboratory
      about: 'https://images.unsplash.com/photo-1508385082359-f48b1c1b5c81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // DNA and scientific research
    };
    return defaultImages[type];
  };

  // Carousel slides data
  const getCarouselSlides = () => {
    const slides = [];

    // Vision slide
    if (organizationData.vision) {
      slides.push({
        id: 'vision',
        title: 'رؤيتنا',
        content: organizationData.vision,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
        backgroundImage: organizationData.vision_image || getDefaultImage('vision'),
        icon: <GlobalOutlined />
      });
    }

    // Mission slide
    if (organizationData.mission) {
      slides.push({
        id: 'mission',
        title: 'رسالتنا',
        content: organizationData.mission,
        background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.8) 0%, rgba(245, 87, 108, 0.8) 100%)',
        backgroundImage: organizationData.mission_image || getDefaultImage('mission'),
        icon: <TeamOutlined />
      });
    }

    // About slide
    if (organizationData.about) {
      slides.push({
        id: 'about',
        title: 'من نحن',
        content: organizationData.about,
        background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.8) 0%, rgba(0, 242, 254, 0.8) 100%)',
        backgroundImage: getDefaultImage('about'),
        icon: <ExperimentOutlined />
      });
    }
    
    // Default slide if no data
    if (slides.length === 0) {
      slides.push({
        id: 'default',
        title: organizationData.name || 'منظمة البحث العلمي',
        content: 'مرحباً بكم في منصة البحث العلمي الزراعي',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: <BookOutlined />
      });
    }
    
    return slides;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'إعلان': 'purple',
      'أخبار': 'blue',
      'حدث': 'green',
      'بحث': 'orange'
    };
    return colors[category] || 'default';
  };

  const getGradientBackground = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div>
      {/* Inject CSS animations */}
      <style>{carouselAnimations}</style>

      {/* Hero Carousel Section */}
      <div style={{ position: 'relative' }}>
        <Spin spinning={settingsLoading}>
          <Carousel
            autoplay
            autoplaySpeed={6000}
            dots={true}
            arrows={false}
            style={{ minHeight: '70vh' }}
            effect="fade"
            fade
          >
            {getCarouselSlides().map((slide) => (
              <div key={slide.id}>
                <div style={{
                  minHeight: '70vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage: `url(${slide.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}>
                  {/* Background Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: slide.background,
                    zIndex: 1
                  }} />

                  {/* Background Pattern */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
                    `,
                    zIndex: 2
                  }} />

                  <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px',
                    position: 'relative',
                    zIndex: 3,
                    textAlign: 'center',
                    animation: 'fadeInUp 1s ease-out'
                  }}>
                    <div style={{
                      color: 'white',
                      fontSize: '4rem',
                      marginBottom: '2rem',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      animation: 'fadeInScale 1.2s ease-out'
                    }}>
                      {slide.icon}
                    </div>
                    <Title level={1} style={{
                      color: 'white',
                      marginBottom: '2rem',
                      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                      fontWeight: 'bold',
                      lineHeight: '1.2',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      animation: 'fadeInUp 1s ease-out 0.3s both'
                    }}>
                      {slide.title}
                    </Title>
                    <Paragraph style={{
                      fontSize: 'clamp(18px, 2.5vw, 24px)',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: '1.7',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      maxWidth: '800px',
                      margin: '0 auto',
                      animation: 'fadeInUp 1s ease-out 0.6s both'
                    }}>
                      {slide.content}
                    </Paragraph>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </Spin>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* Quick Actions Section */}
        <div style={{ marginTop: '60px', marginBottom: '60px' }}>
          <Row gutter={[24, 24]} justify="center">
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<BookOutlined />}
                onClick={() => navigate('/research')}
                style={{
                  height: '56px',
                  fontSize: '18px',
                  padding: '0 32px',
                  borderRadius: '28px'
                }}
              >
                البحوث العلمية
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
                الدورات التدريبية
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
                الخدمات
              </Button>
            </Col>
            {!isAuthenticated && (
              <Col>
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
                    borderRadius: '28px'
                  }}
                >
                  انضم إلينا
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {/* Latest Announcements Section */}
        {announcements.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                أحدث الإعلانات
              </Title>
              <Paragraph type="secondary" style={{ marginTop: '8px', fontSize: '16px' }}>
                تابع آخر الإعلانات والأخبار المهمة
              </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
              {announcements.slice(0, 3).map((announcement, index) => (
                <Col xs={24} md={8} key={announcement.id}>
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
                          right: '16px'
                        }}>
                          <Tag color={getCategoryColor(announcement.category)}>
                            {announcement.category}
                          </Tag>
                        </div>
                        <div style={{
                          color: 'white',
                          fontSize: '48px'
                        }}>
                          <GlobalOutlined />
                        </div>
                      </div>
                    }
                    actions={[
                      <Button type="link" icon={<EyeOutlined />}>
                        {announcement.views || 0} مشاهدة
                      </Button>,
                      <Button type="link" icon={<ArrowRightOutlined />}>
                        اقرأ المزيد
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text strong style={{ fontSize: '16px' }}>
                          {announcement.title}
                        </Text>
                      }
                      description={
                        <div>
                          <Paragraph
                            ellipsis={{ rows: 3 }}
                            style={{ marginBottom: '12px', color: '#666' }}
                          >
                            {announcement.excerpt || announcement.content}
                          </Paragraph>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              <CalendarOutlined style={{ marginLeft: '4px' }} />
                              {formatDate(announcement.date)}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {announcements.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/announcements')}
                >
                  عرض جميع الإعلانات
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Latest News/Posts Section */}
        {posts.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                آخر الأخبار والمقالات
              </Title>
              <Paragraph type="secondary" style={{ marginTop: '8px', fontSize: '16px' }}>
                اطلع على أحدث المقالات والأخبار في مجال البحث العلمي
              </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
              {posts.slice(0, 4).map((post, index) => (
                <Col xs={24} sm={12} md={6} key={post.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    cover={
                      <div style={{
                        height: '180px',
                        background: getGradientBackground(index + 3),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px'
                        }}>
                          <Tag color={getCategoryColor(post.category)}>
                            {post.category}
                          </Tag>
                        </div>
                        <div style={{
                          color: 'white',
                          fontSize: '36px'
                        }}>
                          <BookOutlined />
                        </div>
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <Text strong style={{ fontSize: '14px' }}>
                          {post.title}
                        </Text>
                      }
                      description={
                        <div>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ marginBottom: '8px', color: '#666', fontSize: '12px' }}
                          >
                            {post.excerpt || post.content}
                          </Paragraph>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {post.author}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {formatDate(post.date)}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {posts.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/news')}
                >
                  عرض جميع الأخبار
                </Button>
              </div>
            )}
          </div>
        )}

        {/* About Section */}
        {organizationData.about && (
          <div style={{ marginBottom: '60px' }}>
            <Card
              style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, #e0f7fa 0%, #f8f9fa 100%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
                borderRadius: '24px',
                border: 'none',
                padding: 0,
                overflow: 'hidden',
                position: 'relative',
                minHeight: '320px',
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Row gutter={[0, 0]} align="middle" justify="center" style={{ flexWrap: 'wrap-reverse' }}>
                <Col xs={24} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
                  <Image
                    src="https://images.unsplash.com/photo-1508385082359-f48b1c1b5c81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="أبحاث الجينات والعلوم الحيوية"
                    preview={false}
                    style={{
                      width: '100%',
                      maxWidth: 400,
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '24px',
                      boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)'
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        padding: '60px 0 30px 0',
        marginTop: '80px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Row gutter={[48, 32]}>
            {/* Organization Info */}
            <Col xs={24} md={8}>
              <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>
                {organizationData.name || 'منظمة البحث العلمي'}
              </Title>
              <Space direction="vertical" size="middle">
                {organizationData.email && (
                  <div>
                    <MailOutlined style={{ marginLeft: '8px' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {organizationData.email}
                    </Text>
                  </div>
                )}
                {organizationData.phone && (
                  <div>
                    <PhoneOutlined style={{ marginLeft: '8px' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {organizationData.phone}
                    </Text>
                  </div>
                )}
                {organizationData.address && (
                  <div>
                    <EnvironmentOutlined style={{ marginLeft: '8px' }} />
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {organizationData.address}
                    </Text>
                  </div>
                )}
                {organizationData.website && (
                  <div>
                    <LinkOutlined style={{ marginLeft: '8px' }} />
                    <a
                      href={organizationData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'rgba(255,255,255,0.9)' }}
                    >
                      {organizationData.website}
                    </a>
                  </div>
                )}
              </Space>
            </Col>

            {/* Quick Links */}
            <Col xs={24} md={8}>
              <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>
                روابط سريعة
              </Title>
              <Space direction="vertical" size="middle">
                <Button
                  type="link"
                  style={{ color: 'rgba(255,255,255,0.9)', padding: 0 }}
                  onClick={() => navigate('/research')}
                >
                  البحوث العلمية
                </Button>
                <Button
                  type="link"
                  style={{ color: 'rgba(255,255,255,0.9)', padding: 0 }}
                  onClick={() => navigate('/courses')}
                >
                  الدورات التدريبية
                </Button>
                <Button
                  type="link"
                  style={{ color: 'rgba(255,255,255,0.9)', padding: 0 }}
                  onClick={() => navigate('/services')}
                >
                  الخدمات
                </Button>
                <Button
                  type="link"
                  style={{ color: 'rgba(255,255,255,0.9)', padding: 0 }}
                  onClick={() => navigate('/contact')}
                >
                  اتصل بنا
                </Button>
              </Space>
            </Col>

            {/* Social Media */}
            <Col xs={24} md={8}>
              <Title level={4} style={{ color: 'white', marginBottom: '24px' }}>
                تابعنا على
              </Title>
              <Space size="large">
                {organizationData.facebook && (
                  <a
                    href={organizationData.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', fontSize: '24px' }}
                  >
                    <FacebookOutlined />
                  </a>
                )}
                {organizationData.twitter && (
                  <a
                    href={organizationData.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', fontSize: '24px' }}
                  >
                    <TwitterOutlined />
                  </a>
                )}
                {organizationData.linkedin && (
                  <a
                    href={organizationData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', fontSize: '24px' }}
                  >
                    <LinkedinOutlined />
                  </a>
                )}
                {organizationData.instagram && (
                  <a
                    href={organizationData.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', fontSize: '24px' }}
                  >
                    <InstagramOutlined />
                  </a>
                )}
              </Space>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '40px 0 20px 0' }} />

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
              © 2024 {organizationData.name || 'منظمة البحث العلمي'}. جميع الحقوق محفوظة.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
