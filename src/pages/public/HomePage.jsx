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
  CrownOutlined
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
  const [stats, setStats] = useState({
    researchers: 150,
    projects: 87,
    publications: 342,
    awards: 25
  });

  // Enhanced CSS animations
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

  useEffect(() => {
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
          // Default institute data
          setOrganizationData({
            name: "معهد البحوث العلمية والتطوير التقني",
            vision: "أن نصبح المعهد الرائد في منطقة الشرق الأوسط في مجال البحث العلمي والابتكار التقني، ونساهم في بناء مجتمع المعرفة وتحقيق التنمية المستدامة",
            vision_image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            mission: "نلتزم بإجراء البحوث العلمية المتقدمة وتطوير الحلول التقنية المبتكرة، وتأهيل الكوادر العلمية المتخصصة، وتقديم الاستشارات العلمية والتقنية لخدمة المجتمع والاقتصاد الوطني",
            mission_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
            about: "معهد البحوث العلمية والتطوير التقني مؤسسة رائدة في مجال البحث العلمي والابتكار التقني، تأسس عام 1985 ويضم نخبة من العلماء والباحثين المتخصصين في مختلف المجالات العلمية والتقنية. يساهم المعهد في تطوير الحلول العلمية والتقنية المتقدمة لمواجهة التحديات المعاصرة وتحقيق التنمية المستدامة.",
            email: "info@research-institute.org",
            phone: "+966 11 456 7890",
            address: "شارع الملك فهد، الرياض 11564، المملكة العربية السعودية",
            website: "https://research-institute.org",
            facebook: "https://facebook.com/research-institute",
            twitter: "https://twitter.com/research_institute",
            linkedin: "https://linkedin.com/company/research-institute",
            instagram: "https://instagram.com/research_institute"
          });
        } finally {
          setSettingsLoading(false);
        }

        // Load content with institute-specific data
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

          if (postsResponse.status === 'fulfilled') {
            const transformedPosts = postsResponse.value.results
              .filter(item => item.is_featured)
              .map(item => ({
                id: item.id,
                title: item.title,
                content: item.content || item.description || '',
                date: item.created_at || item.date,
                category: item.category || 'أبحاث',
                priority: item.priority || 'medium',
                views: item.view_count || 0,
                type: 'post',
                excerpt: item.excerpt || item.content?.substring(0, 150) + '...',
                author: typeof item.author === 'string'
                  ? item.author
                  : item.author?.full_name || item.author?.email || 'فريق البحث العلمي'
              }));
            setPosts(transformedPosts);
          }
        } catch (error) {
          console.error('Failed to load content:', error);
          // Institute-specific fallback content
          setAnnouncements([
            {
              id: 1,
              title: 'إعلان عن منحة البحث العلمي للعام الجديد',
              content: 'يعلن المعهد عن فتح باب التقديم للحصول على منح البحث العلمي للعام الأكاديمي الجديد في مختلف التخصصات العلمية.',
              date: new Date().toISOString(),
              category: 'منح',
              views: 567,
              type: 'announcement',
              excerpt: 'منح بحثية متاحة للباحثين والطلاب المتفوقين في جميع التخصصات العلمية والتقنية.'
            },
            {
              id: 2,
              title: 'مؤتمر الابتكار التقني الدولي 2024',
              content: 'ينظم المعهد المؤتمر الدولي للابتكار التقني بمشاركة خبراء من أكثر من 20 دولة.',
              date: new Date(Date.now() - 86400000).toISOString(),
              category: 'مؤتمرات',
              views: 892,
              type: 'announcement',
              excerpt: 'مؤتمر دولي يجمع خبراء الابتكار والتكنولوجيا من جميع أنحاء العالم.'
            }
          ]);

          setPosts([
            {
              id: 1,
              title: 'اكتشاف جديد في مجال تقنيات النانو للطاقة المتجددة',
              content: 'فريق البحث بالمعهد يحقق اختراقاً علمياً في تطوير خلايا شمسية بتقنية النانو بكفاءة تصل إلى 45%.',
              date: new Date().toISOString(),
              category: 'اكتشافات',
              views: 1234,
              type: 'post',
              excerpt: 'اختراق علمي جديد في تطوير خلايا شمسية عالية الكفاءة باستخدام تقنيات النانو المتقدمة.',
              author: 'د. أحمد الزهراني - رئيس قسم تقنيات الطاقة'
            },
            {
              id: 2,
              title: 'براءة اختراع جديدة في مجال الذكاء الاصطناعي',
              content: 'المعهد يحصل على براءة اختراع لنظام ذكي لتحليل البيانات الضخمة في الوقت الفعلي.',
              date: new Date(Date.now() - 172800000).toISOString(),
              category: 'براءات اختراع',
              views: 987,
              type: 'post',
              excerpt: 'نظام ذكي متطور لمعالجة وتحليل البيانات الضخمة بسرعة ودقة عالية.',
              author: 'د. فاطمة المالكي - قسم الذكاء الاصطناعي'
            },
            {
              id: 3,
              title: 'شراكة استراتيجية مع جامعة MIT الأمريكية',
              content: 'توقيع اتفاقية تعاون علمي مع معهد ماساتشوستس للتكنولوجيا لتبادل الخبرات البحثية.',
              date: new Date(Date.now() - 259200000).toISOString(),
              category: 'شراكات',
              views: 756,
              type: 'post',
              excerpt: 'اتفاقية تعاون علمي دولية لتطوير البحوث المشتركة وتبادل الخبرات.',
              author: 'إدارة الشؤون الأكاديمية'
            },
            {
              id: 4,
              title: 'إطلاق مختبر الروبوتات المتقدمة',
              content: 'افتتاح أحدث مختبر للروبوتات والأتمتة مجهز بأحدث التقنيات العالمية.',
              date: new Date(Date.now() - 345600000).toISOString(),
              category: 'مختبرات',
              views: 643,
              type: 'post',
              excerpt: 'مختبر متطور للروبوتات والأتمتة بأحدث المعدات والتقنيات العالمية.',
              author: 'د. سعد الغامدي - مدير المختبرات'
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

  // Professional default images for research institute
  const getDefaultImage = (type) => {
    const defaultImages = {
      vision: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Modern research facility
      mission: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Scientists working
      about: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Research lab equipment
      lab1: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      lab2: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    return defaultImages[type];
  };

  // Enhanced carousel slides
  const getCarouselSlides = () => {
    const slides = [];

    // Vision slide
    if (organizationData.vision) {
      slides.push({
        id: 'vision',
        title: 'رؤيتنا المستقبلية',
        content: organizationData.vision,
        background: 'hero-overlay',
        backgroundImage: organizationData.vision_image || getDefaultImage('vision'),
        icon: <RocketOutlined />,
        subtitle: 'نحو مستقبل أكثر إشراقاً'
      });
    }

    // Mission slide
    if (organizationData.mission) {
      slides.push({
        id: 'mission',
        title: 'رسالتنا النبيلة',
        content: organizationData.mission,
        background: 'hero-overlay',
        backgroundImage: organizationData.mission_image || getDefaultImage('mission'),
        icon: <BulbOutlined />,
        subtitle: 'الابتكار في خدمة المجتمع'
      });
    }

    // About slide
    if (organizationData.about) {
      slides.push({
        id: 'about',
        title: 'التميز في البحث العلمي',
        content: organizationData.about,
        background: 'hero-overlay',
        backgroundImage: getDefaultImage('about'),
        icon: <ExperimentOutlined />,
        subtitle: 'خبرة عقود في خدمة العلم'
      });
    }
    
    return slides.length > 0 ? slides : [{
      id: 'default',
      title: organizationData.name || 'معهد البحوث العلمية',
      content: 'مرحباً بكم في منصة التميز العلمي والابتكار التقني',
      background: 'hero-overlay',
      backgroundImage: getDefaultImage('vision'),
      icon: <StarOutlined />,
      subtitle: 'رحلة نحو التميز'
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
      'منح': 'gold',
      'مؤتمرات': 'cyan',
      'اكتشافات': 'red',
      'براءات اختراع': 'green',
      'شراكات': 'blue',
      'مختبرات': 'orange',
      'أبحاث': 'geekblue'
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
      'براءات اختراع': <TrophyOutlined />,
      'شراكات': <TeamOutlined />,
      'مختبرات': <ExperimentOutlined />,
      'أبحاث': <BookOutlined />
    };
    return icons[category] || <BookOutlined />;
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
                      margin: '0 auto 3rem auto',
                      animation: 'fadeInUp 1s ease-out 0.6s both'
                    }}>
                      {slide.content}
                    </Paragraph>

                    <div style={{ animation: 'fadeInUp 1s ease-out 0.8s both' }}>
                      <Button
                        type="primary"
                        size="large"
                        style={{
                          height: '60px',
                          padding: '0 40px',
                          fontSize: '18px',
                          borderRadius: '30px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          fontWeight: '600'
                        }}
                        onClick={() => navigate('/about')}
                      >
                        اكتشف المزيد
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </Spin>
      </div>

      {/* Main Content Container */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>

        {/* Statistics Section */}
        <div style={{ marginTop: '-60px', marginBottom: '80px', position: 'relative', zIndex: 10 }}>
          <Row gutter={[24, 24]} justify="center">
            {[
              { title: 'الباحثون', value: stats.researchers, icon: <TeamOutlined />, suffix: '+' },
              { title: 'المشاريع البحثية', value: stats.projects, icon: <ExperimentOutlined />, suffix: '+' },
              { title: 'المنشورات العلمية', value: stats.publications, icon: <BookOutlined />, suffix: '+' },
              { title: 'الجوائز والتقديرات', value: stats.awards, icon: <TrophyOutlined />, suffix: '+' }
            ].map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card className="stats-card professional-card" style={{
                  textAlign: 'center',
                  background: getGradientBackground(index),
                  minHeight: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ color: 'white' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                      {stat.icon}
                    </div>
                    <Statistic
                      value={stat.value}
                      suffix={stat.suffix}
                      valueStyle={{ 
                        color: 'white', 
                        fontSize: '2rem', 
                        fontWeight: 'bold',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>
                      {stat.title}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

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
                آخر الأخبار والمقالات
              </Title>
              <Paragraph style={{ 
                marginTop: '16px', 
                fontSize: '18px',
                color: '#6b7280',
                fontWeight: '500',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                اطلع على أحدث المقالات والأخبار في مجال البحث العلمي والتطوير التكنولوجي
              </Paragraph>
            </div>

            <Row gutter={[32, 32]}>
              {posts.slice(0, 4).map((post, index) => (
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
                      <div style={{
                        height: '220px',
                        background: getGradientBackground(index + 3),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
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
                        
                        <div style={{
                          color: 'white',
                          fontSize: '48px',
                          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                          zIndex: 1
                        }}>
                          <BookOutlined />
                        </div>
                      </div>
                    }
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
              ))}
            </Row>

            {posts.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/news')}
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
                  عرض جميع الأخبار
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