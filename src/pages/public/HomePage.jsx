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
  Image,
  Statistic,
  Badge
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
  RightOutlined as CarouselRightOutlined,
  TrophyOutlined,
  SafetyOutlined,
  RocketOutlined,
  BulbOutlined,
  StarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  FileTextOutlined,PictureOutlined } from '@ant-design/icons';
import { contentService, organizationService, statisticsService } from '../../services';

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
  const [stats, setStats] = useState({
    researchers: 0,
    projects: 0,
    publications: 0,
    courses: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const carouselAnimations = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(50px);
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

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes pulseGlow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(24, 144, 255, 0.3);
      }
      50% {
        box-shadow: 0 0 40px rgba(24, 144, 255, 0.6);
      }
    }

    @keyframes floatingAnimation {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .carousel-slide-content {
      animation: fadeInUp 1s ease-out;
    }

    .floating-element {
      animation: floatingAnimation 3s ease-in-out infinite;
    }

    .professional-card {
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95);
    }

    .professional-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }

    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-overlay {
      background: linear-gradient(135deg, 
        rgba(102, 126, 234, 0.8) 0%, 
        rgba(118, 75, 162, 0.8) 30%,
        rgba(79, 172, 254, 0.8) 70%,
        rgba(0, 242, 254, 0.8) 100%);
      backdrop-filter: blur(10px);
    }

    .stats-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 20px;
      color: white;
      overflow: hidden;
      position: relative;
    }

    .stats-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform 0.6s;
    }

    .stats-card:hover::before {
      transform: translateX(100%);
    }

    .news-card {
      position: relative;
      overflow: hidden;
      border-radius: 16px;
      transition: all 0.3s ease;
    }

    .news-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .news-card:hover::before {
      left: 100%;
    }
  `;
  const heroImages = [
    '/2304.w019.n002.1028B.p15.1028.jpg',
    '/2304.w019.n002.1028B.p15.1028.jpg',
    '/2304.w019.n002.1028B.p15.1028.jpg'
  ];
  useEffect(() => {
    const loadHomePageData = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);

        try {
          const statisticsData = await statisticsService.getPublicStatistics();
          console.log('🏠 Homepage received stats:', statisticsData);
          setStats(statisticsData);
        } catch (error) {
          console.error('Failed to load statistics:', error);
        } finally {
          setStatsLoading(false);
        }

        try {
          setSettingsLoading(true);
          const orgData = await organizationService.getPublicSettings();
          setOrganizationData({
            ...orgData,
            name: "معهد بحوث الهندسة الوراثية الزراعية"
          });
        } catch (error) {
          console.error('Failed to load organization settings:', error);
          setOrganizationData({
            name: "منظمة البحث العلمي",
            vision: "أن نصبح المعهد الرائد في منطقة الشرق الأوسط في مجال البحث العلمي والابتكار التقني، ونساهم في بناء مجتمع المعرفة وتحقيق التنمية المستدامة",
            vision_image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            mission: "نلتزم بإجراء البحوث العلمية المتقدمة وتطوير الحلول التقنية المبتكرة، وتأهيل الكوادر العلمية المتخصصة، وتقديم الاستشارات العلمية والتقنية لخدمة المجتمع والاقتصاد الوطني",
            mission_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            about: "معهد البحوث العلمية والتطوير التقني مؤسسة رائدة في مجال البحث العلمي والابتكار التقني، تأسس عام 1985 ويضم نخبة من العلماء والباحثين المتخصصين في مختلف المجالات العلمية والتقنية. يساهم المعهد في تطوير الحلول العلمية والتقنية المتقدمة لمواجهة التحديات المعاصرة وتحقيق التنمية المستدامة.",
            email: "info@research-institute.org",
            phone: "+966 11 456 7890",
            address: "Inside Cairo Uni, Oula, Al Giza, Giza Governorate 3725005",
            website: "https://research-institute.org",
            facebook: "https://facebook.com/research-institute",
            twitter: "https://twitter.com/research_institute",
            linkedin: "https://linkedin.com/company/research-institute",
            instagram: "https://instagram.com/research_institute"
          });
        } finally {
          setSettingsLoading(false);
        }

        // Load announcements and posts separately - now only fetch featured posts
        try {
          const [announcementsResponse, postsResponse] = await Promise.allSettled([
            contentService.getPublicAnnouncements({
              page_size: 6,
              ordering: '-created_at'
            }),
            contentService.getPublicPosts({
              page_size: 8,
              ordering: '-created_at',
              is_featured: true  // Only fetch featured posts
            })
          ]);

          console.log('🔍 Featured Posts Response:', postsResponse);
          console.log('🔍 Featured Posts Response Status:', postsResponse.status);
          if (postsResponse.status === 'rejected') {
            console.error('🔍 Featured Posts Error:', postsResponse.reason);
          }

          if (postsResponse.status === 'fulfilled') {
            console.log('🔍 Featured Posts:', postsResponse.value.results);
            console.log('🔍 Featured Posts Response Data:', postsResponse.value);

            // Check if we have results
            if (!postsResponse.value.results || postsResponse.value.results.length === 0) {
              console.warn('🔍 No featured posts found in response');
            }

            // Filter for published and public featured posts
            const featuredPosts = postsResponse.value.results?.filter(item =>
              item.status === 'published' && item.is_public && item.is_featured
            ) || [];

            const transformedPosts = featuredPosts.map(item => {
              return {
                id: item.id,
                title: item.title,
                content: item.content || item.description || '',
                date: item.created_at || item.date,
                category: item.category || 'أبحاث',
                priority: item.priority || 'medium',
                views: item.view_count || 0,
                type: 'post',
                featured_image: item.featured_image || item.attachment || null,
                attachment: item.attachment || null,
                excerpt: item.excerpt || item.content?.substring(0, 150) + '...',
                author: typeof item.author === 'string'
                  ? item.author
                  : item.author?.full_name || item.author?.email || 'فريق البحث العلمي',
                is_featured: item.is_featured || false,
                images: item.images || []
              };
            });

            // Sort by date (newest first) since all are featured
            const sortedPosts = transformedPosts.sort((a, b) => 
              new Date(b.date) - new Date(a.date)
            );

            console.log('🔍 Final Featured Posts:', sortedPosts);
            setPosts(sortedPosts);
          }

          if (announcementsResponse.status === 'fulfilled') {
            setAnnouncements(announcementsResponse.value.results || []);
          }
        } catch (error) {
          console.error('Failed to load content:', error);
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomePageData();
  }, []);
  const getCarouselSlides = () => {
    const slides = [];
    const defaultImage = '/2304.w019.n002.1028B.p15.1028.jpg';

    // Vision slide
    if (organizationData.vision) {
      slides.push({
        id: 'vision',
        title: t('homepage.orgName'), // Force Arabic title
        content: organizationData.vision,
        backgroundImage: defaultImage,
        icon: <RocketOutlined />,
        subtitle: t('homepage.ourVision')
      });
    }

    // Mission slide
    if (organizationData.mission) {
      slides.push({
        id: 'mission',
        title: t('homepage.ourMission'),
        content: organizationData.mission,
        backgroundImage: defaultImage,
        icon: <BulbOutlined />,
        subtitle: t('homepage.missionSubtitle')
      });
    }

    // About slide
    if (organizationData.about) {
      slides.push({
        id: 'about',
        title: t('homepage.aboutUs'),
        content: organizationData.about,
        backgroundImage: defaultImage,
        icon: <ExperimentOutlined />,
        subtitle: t('homepage.aboutSubtitle')
      });
    }

    return slides.length > 0 ? slides : [{
      id: 'default',
      title: "منظمة البحث العلمي",
      content: t('homepage.heroSubtitle'),
      backgroundImage: defaultImage,
      icon: <StarOutlined />,
      subtitle: t('homepage.journeyToExcellence')
    }];
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
      'announcement': 'purple',
      'منح': 'gold',
      'grants': 'gold',
      'مؤتمرات': 'cyan',
      'conferences': 'cyan',
      'اكتشافات': 'red',
      'discoveries': 'red',
      'براءات اختراع': 'green',
      'patents': 'green',
      'شراكات': 'blue',
      'partnerships': 'blue',
      'مختبرات': 'orange',
      'laboratories': 'orange',
      'أبحاث': 'geekblue',
      'research': 'geekblue',
      'ندوة': 'purple',
      'seminar': 'purple',
      'ورشة عمل': 'cyan',
      'workshop': 'cyan'
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

  const getCategoryIcon = (category) => {
    const icons = {
      'اكتشافات': <FireOutlined />,
      'discoveries': <FireOutlined />,
      'براءات اختراع': <TrophyOutlined />,
      'patents': <TrophyOutlined />,
      'شراكات': <TeamOutlined />,
      'partnerships': <TeamOutlined />,
      'مختبرات': <ExperimentOutlined />,
      'laboratories': <ExperimentOutlined />,
      'أبحاث': <BookOutlined />,
      'research': <BookOutlined />,
      'ندوة': <ReadOutlined />,
      'seminar': <ReadOutlined />,
      'ورشة عمل': <ToolOutlined />,
      'workshop': <ToolOutlined />
    };
    return icons[category] || <BookOutlined />;
  };

  const handleStatCardClick = (type) => {
    if (isAuthenticated) {
      // Navigate to authenticated routes
      switch (type) {
        case 'researchers':
          navigate('/app/users');
          break;
        case 'publications':
          navigate('/app/research/publications');
          break;
        case 'courses':
          navigate('/app/training');
          break;
        case 'services':
          navigate('/app/services');
          break;
        default:
          break;
      }
    } else {
      // Navigate to public routes
      switch (type) {
        case 'researchers':
          navigate('/researchers');
          break;
        case 'publications':
          navigate('/research');
          break;
        case 'courses':
          navigate('/courses');
          break;
        case 'services':
          navigate('/services');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div>
      <style>{carouselAnimations}</style>

      {/* Enhanced Hero Carousel Section */}
      <div style={{ position: 'relative', minHeight: '80vh' }}>
        <Spin spinning={settingsLoading}>
          <Carousel
            autoplay
            autoplaySpeed={8000}
            dots={true}
            arrows={false}
            style={{ minHeight: '80vh' }}
            effect="fade"
            fade
          >
            {getCarouselSlides().map((slide) => (
              <div key={slide.id}>
                <div style={{
                  minHeight: '80vh',
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
                  {/* Enhanced Background Overlay */}
                  <div className={slide.background} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1
                  }} />

                  {/* Floating Elements */}
                  <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    zIndex: 2
                  }} className="floating-element" />

                  <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '15%',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    zIndex: 2
                  }} className="floating-element" />

                  <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px',
                    position: 'relative',
                    zIndex: 3,
                    textAlign: 'center'
                  }} className="carousel-slide-content">

                    <div style={{
                      color: 'white',
                      fontSize: '5rem',
                      marginBottom: '1rem',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      animation: 'fadeInScale 1.5s ease-out'
                    }}>
                      {slide.icon}
                    </div>

                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '18px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: '1rem',
                      display: 'block',
                      animation: 'fadeInUp 1s ease-out 0.2s both'
                    }}>
                      {slide.subtitle}
                    </Text>

                    <Title level={1} style={{
                      color: 'white',
                      marginBottom: '2rem',
                      fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                      fontWeight: '700',
                      lineHeight: '1.1',
                      textShadow: '3px 3px 6px rgba(0,0,0,0.6)',
                      animation: 'fadeInUp 1s ease-out 0.4s both'
                    }}>
                      {slide.title}
                    </Title>

                    <Paragraph style={{
                      fontSize: 'clamp(16px, 2.2vw, 22px)',
                      color: 'rgba(255, 255, 255, 0.95)',
                      lineHeight: '1.8',
                      textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                      maxWidth: '900px',
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>

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

        {/* Latest News/Posts Section */}
        {posts.length > 0 && (
          <div style={{ marginBottom: '100px' }}>
            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
              <Title level={1} style={{
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '3.5rem',
                fontWeight: '800',
                marginBottom: '16px'
              }}>
                المقالات المميزة
              </Title>
              <Paragraph style={{
                marginTop: '16px',
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                اطلع على أهم المقالات والأخبار المميزة في مجال البحث العلمي والتطوير التكنولوجي
              </Paragraph>
              {/* Debug info */}
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#999' }}>
                عدد المقالات المميزة: {posts.length}
              </div>
            </div>

            <Row gutter={[32, 32]}>
              {posts.slice(0, 4).map((post, index) => {
                let images = [];
                if (Array.isArray(post.images) && post.images.length > 0) {
                  images = post.images.map(imgObj => {
                    if (imgObj.image_url && (imgObj.image_url.startsWith('http://') || imgObj.image_url.startsWith('https://'))) {
                      return imgObj.image_url;
                    }
                    if (imgObj.image && (imgObj.image.startsWith('http://') || imgObj.image.startsWith('https://'))) {
                      return imgObj.image;
                    }
                    if (imgObj.image_url) {
                      if (imgObj.image_url.startsWith('/media')) {
                        return window.location.origin + imgObj.image_url;
                      }
                      if (imgObj.image_url.startsWith('media')) {
                        return window.location.origin + '/' + imgObj.image_url;
                      }
                    }
                    if (imgObj.image) {
                      if (imgObj.image.startsWith('/media')) {
                        return window.location.origin + imgObj.image;
                      }
                      if (imgObj.image.startsWith('media')) {
                        return window.location.origin + '/' + imgObj.image;
                      }
                    }
                    return null;
                  }).filter(Boolean);
                }
                else {
                  if (post.featured_image) images.push(post.featured_image);
                  if (post.attachment && post.attachment !== post.featured_image) images.push(post.attachment);
                }
                const mainImage = images[0] || null;
                const extraCount = images.length > 1 ? images.length - 1 : 0;

                return (
                  <Col xs={24} sm={12} lg={6} key={post.id}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        
                        borderRadius: '20px',
                        border: 'none',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
                      }}
                      bodyStyle={{ padding: '24px' }}
                      cover={
                        <div
                          style={{
                            height: '220px',
                            background: mainImage
                              ? `url(${mainImage}) center/cover no-repeat`
                              : getGradientBackground(index + 3),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            borderBottom: '1px solid #f0f0f0',
                            cursor: 'pointer'
                          }}
                          onClick={() => navigate(`/posts/${post.id}`)}
                        >
                          {/* Debug overlay */}
                          {!mainImage && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              background: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              zIndex: 3
                            }}>
                              لا توجد صورة
                            </div>
                          )}
                          {/* Decorative elements */}
                          <div style={{
                            position: 'absolute',
                            top: '-50px',
                            right: '-50px',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                          }} />
                          <div style={{
                            position: 'absolute',
                            bottom: '-30px',
                            left: '-30px',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                          }} />
                          <div style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            zIndex: 2
                          }}>
                            <Tag style={{
                              background: 'rgba(255,255,255,0.2)',
                              border: 'none',
                              color: 'white',
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backdropFilter: 'blur(10px)'
                            }}>
                              {post.category}
                            </Tag>
                          </div>
                          {/* إذا كان هناك صور إضافية */}
                          {extraCount > 0 && (
                            <div style={{
                              position: 'absolute',
                              bottom: '16px',
                              left: '16px',
                              background: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              borderRadius: '16px',
                              padding: '4px 12px',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              zIndex: 4
                            }}>
                              <span style={{ marginRight: '4px' }}>+{extraCount}</span>
                              <span style={{ fontSize: '18px' }}><PictureOutlined /></span>
                            </div>
                          )}
                          {!mainImage && (
                            <div style={{
                              color: 'white',
                              fontSize: '48px',
                              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                              zIndex: 1
                            }}>
                              <BookOutlined />
                            </div>
                          )}
                        </div>
                      }
                      onClick={() => navigate(`/posts/${post.id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Title level={4} style={{
                          fontSize: '16px',
                          color: '#1e293b',
                          fontWeight: '700',
                          lineHeight: '1.4',
                          marginBottom: '12px',
                          minHeight: '44px'
                        }}>
                          {post.title}
                        </Title>
                        <Paragraph
                          ellipsis={{ rows: 3 }}
                          style={{
                            marginBottom: '20px',
                            color: '#64748b',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            flex: 1
                          }}
                        >
                          {post.excerpt || post.content}
                        </Paragraph>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '16px',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          <div style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '20px',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            جديد
                          </div>
                          <Text style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            fontWeight: '500'
                          }}>
                            {formatDate(post.date)}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {posts.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/posts')}
                  style={{
                    height: '56px',
                    padding: '0 40px',
                    fontSize: '16px',
                    fontWeight: '600',
                    borderRadius: '28px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  عرض جميع المقالات
                </Button>
              </div>
            )}
          </div>
        )}

        {/* About Section */}
        {organizationData.about && (
          <div style={{ marginBottom: '100px' }}>
            <Card
              style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)',
                borderRadius: '32px',
                border: 'none',
                padding: 0,
                overflow: 'hidden',
                position: 'relative',
                minHeight: '400px',
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-80px',
                left: '-80px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }} />

              <Row gutter={[0, 0]} align="middle" justify="center" style={{ flexWrap: 'wrap-reverse', minHeight: '400px' }}>
                <Col xs={24} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{
                      fontSize: '80px',
                      marginBottom: '24px',
                      filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))'
                    }}>
                      🧬
                    </div>
                    <Title level={2} style={{
                      color: 'white',
                      marginBottom: '16px',
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}>
                      أبحاث الجينات والعلوم الحيوية
                    </Title>
                    <Paragraph style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '18px',
                      lineHeight: '1.7',
                      maxWidth: '500px',
                      margin: '0 auto'
                    }}>
                      نقود الابتكار في مجال الأبحاث العلمية والتكنولوجيا الحيوية لبناء مستقبل أفضل للإنسانية
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
         {/* Research Excellence Section */}
        <div style={{ marginBottom: '100px' }}>
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
            <Title level={1} style={{
              margin: 0,
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '3.5rem',
              fontWeight: '800',
              marginBottom: '16px'
            }}>
              معهد بحوث الهندسة الوراثية الزراعية            
            </Title>
            <Paragraph style={{
              marginTop: '16px',
              fontSize: '18px',
              color: '#6b7280',
              fontWeight: '500',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              نحن نقود الابتكار في مجالات البحث المتقدمة ونساهم في تطوير الحلول العلمية المستدامة
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {[
              {
                title: "الذكاء الاصطناعي",
                description: "تطوير خوارزميات متقدمة للتعلم الآلي وتطبيقاتها في الحياة العملية",
                icon: "🤖",
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              },
              {
                title: "الطاقة المتجددة",
                description: "أبحاث متطورة في مجال الطاقة الشمسية وطاقة الرياح والحلول البيئية",
                icon: "🌱",
                gradient: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              },
              {
                title: "التكنولوجيا الحيوية",
                description: "تطوير العلاجات الجينية والأدوية المبتكرة لمعالجة الأمراض المستعصية",
                icon: "🧬",
                gradient: "linear-gradient(135deg, #f759ab 0%, #ff7875 100%)",
              },
              {
                title: "علوم الفضاء",
                description: "استكشاف الفضاء وتطوير تقنيات الأقمار الصناعية والاتصالات الفضائية",
                icon: "🚀",
                gradient: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              }
            ].map((field, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  style={{
                    height: '320px',
                    borderRadius: '24px',
                    border: 'none',
                    background: field.gradient,
                    color: 'white',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ 
                    padding: '32px 24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    zIndex: 1
                  }} />
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      {field.icon}
                    </div>
                    
                    <Title level={4} style={{
                      color: 'white',
                      marginBottom: '12px',
                      textAlign: 'center',
                      fontSize: '20px'
                    }}>
                      {field.title}
                    </Title>
                    
                    <Paragraph style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      textAlign: 'center',
                      marginBottom: '20px'
                    }}>
                      {field.description}
                    </Paragraph>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {field.stats}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Success Stories Section */}
        <div style={{ 
          marginBottom: '100px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '80px 0',
          borderRadius: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, rgba(24,144,255,0.1) 0%, rgba(64,169,255,0.1) 100%)',
            borderRadius: '50%',
            zIndex: 1
          }} />
          
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ marginBottom: '48px', textAlign: 'center' }}>
              <Title level={1} style={{
                margin: 0,
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '3.5rem',
                fontWeight: '800',
                marginBottom: '16px'
              }}>
                قصص نجاح ملهمة
              </Title>
              <Paragraph style={{
                marginTop: '16px',
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                إنجازات حقيقية غيرت مسار البحث العلمي وأثرت إيجاب على المجتمع
              </Paragraph>
            </div>

            <Row gutter={[32, 32]}>
              {[
                {
                  title: "علاج السرطان الثوري",
                  description: "تطوير علاج جيني جديد حقق نسبة شفاء 85% في المراحل المبكرة من سرطان الدم",
                  achievement: "براءة اختراع دولية",
                  year: "2024",
                  icon: "🏆",
                  color: "#52c41a"
                },
                {
                  title: "تقنية تحلية المياه",
                  description: "ابتكار نظام تحلية مياه بالطاقة الشمسية بكفاءة 95% وتكلفة أقل بـ 60%",
                  achievement: "جائزة الابتكار العالمية",
                  year: "2023",
                  icon: "💧",
                  color: "#1890ff"
                },
                {
                  title: "الذكاء الاصطناعي الطبي",
                  description: "تطوير نظام ذكي لتشخيص الأمراض النادرة بدقة 98% في أقل من دقيقتين",
                  achievement: "شراكة مع منظمة الصحة العالمية",
                  year: "2024",
                  icon: "🔬",
                  color: "#722ed1"
                }
              ].map((story, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                      background: 'white'
                    }}
                    bodyStyle={{ padding: '32px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{
                        fontSize: '48px',
                        marginBottom: '16px'
                      }}>
                        {story.icon}
                      </div>
                      
                      <Badge
                        count={story.year}
                        style={{
                          backgroundColor: story.color,
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                    </div>
                    
                    <Title level={4} style={{
                      marginBottom: '16px',
                      textAlign: 'center',
                      color: '#1f2937'
                    }}>
                      {story.title}
                    </Title>
                    
                    <Paragraph style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                      textAlign: 'center'
                    }}>
                      {story.description}
                    </Paragraph>
                    
                    <div style={{
                      background: `linear-gradient(135deg, ${story.color}15 0%, ${story.color}25 100%)`,
                      padding: '16px',
                      borderRadius: '12px',
                      marginBottom: '16px'
                    }}>
                      <Text style={{
                        color: story.color,
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {story.achievement}
                      </Text>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {story.impact}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
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
