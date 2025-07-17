import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, Space, Spin } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES } from '../../constants';
import { useResearcherStats } from '../../hooks/useResearcherStats';
import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
import { contentService } from '../../services';

const { Title, Paragraph } = Typography;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Get dynamic researcher stats
  const { stats: researcherStats, loading: statsLoading, refetch: refetchStats } = useResearcherStats();

  // Get real-time dashboard stats for admin/moderator
  const { stats: dashboardStats, loading: dashboardLoading, refresh: refreshDashboard } = useRealTimeStats('dashboard', 30000);

  // Animated counters for smooth transitions
  const totalUsersCount = useAnimatedCounter(dashboardStats?.users?.total || 0);
  const totalPublicationsCount = useAnimatedCounter(dashboardStats?.content?.totalPublications || 0);
  const pendingRequestsCount = useAnimatedCounter(dashboardStats?.content?.pendingRequests || 0);
  const activeCoursesCount = useAnimatedCounter(dashboardStats?.content?.totalCourses || 0);

  // State for announcements
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // Data source indicator
  const [dataSource, setDataSource] = useState('loading');

  // Load announcements on component mount
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setAnnouncementsLoading(true);
      const response = await contentService.getPublicAnnouncements({
        page_size: 3, // Show only latest 3 announcements
        ordering: '-created_at'
      });
      setAnnouncements(response.results || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // Dynamic statistics from real-time API
  const getDynamicStats = () => {
    return {
      totalUsers: totalUsersCount.value,
      totalPublications: totalPublicationsCount.value,
      pendingRequests: pendingRequestsCount.value,
      activeCourses: activeCoursesCount.value,
    };
  };

  const stats = getDynamicStats();

  const getQuickActions = () => {
    const userRole = user?.role || USER_ROLES.RESEARCHER;
    if (userRole === USER_ROLES.RESEARCHER) {
      return [
        { label: 'Submit Publication', icon: <PlusOutlined />, path: '/research/publications/new', type: 'primary' },
        { label: 'My Publications', icon: <BookOutlined />, path: '/research/publications', type: 'default' },
        { label: 'Profile', icon: <UserOutlined />, path: '/profile', type: 'default' },
      ];
    }
    
    switch (userRole) {
      case USER_ROLES.ADMIN:
        return [
          { label: 'Manage Users', icon: <UserOutlined />, path: '/users', type: 'primary' },
          { label: 'Review Publications', icon: <BookOutlined />, path: '/research', type: 'default' },
          { label: 'System Settings', icon: <ToolOutlined />, path: '/settings', type: 'default' },
        ];
      case USER_ROLES.MODERATOR:
        return [
          { label: 'Review Publications', icon: <BookOutlined />, path: '/research', type: 'primary' },
          { label: 'Manage Content', icon: <EyeOutlined />, path: '/content', type: 'default' },
          { label: 'Service Requests', icon: <ToolOutlined />, path: '/services', type: 'default' },
        ];
      default: // RESEARCHER
        return [
          { label: 'Submit Publication', icon: <PlusOutlined />, path: '/research/submit', type: 'primary' },
          { label: 'My Publications', icon: <BookOutlined />, path: '/research/my-publications', type: 'default' },
          { label: 'Browse Courses', icon: <ReadOutlined />, path: '/training', type: 'default' },
        ];
    }
  };

  const getRoleSpecificStats = () => {
    const userRole = user?.role || USER_ROLES.RESEARCHER;
    if (userRole === USER_ROLES.RESEARCHER) {
      return [
        { title: 'My Publications', value: researcherStats.publications, icon: <BookOutlined />, color: '#1890ff' },
      ];
    }

    switch (userRole) {
      case USER_ROLES.ADMIN:
        return [
          { title: 'Total Users', value: stats.totalUsers, icon: <UserOutlined />, color: '#1890ff' },
          { title: 'Publications', value: stats.totalPublications, icon: <BookOutlined />, color: '#52c41a' },
          { title: 'Departments', value: dashboardStats?.organization?.totalDepartments || 0, icon: <UserOutlined />, color: '#13c2c2' },
          { title: 'Laboratories', value: dashboardStats?.organization?.totalLabs || 0, icon: <ToolOutlined />, color: '#eb2f96' },
        ];
      case USER_ROLES.MODERATOR:
        return [
          { title: 'Publications to Review', value: dashboardStats?.content?.pendingPublications || 0, icon: <BookOutlined />, color: '#1890ff' },
          { title: 'Service Requests', value: stats.pendingRequests, icon: <ToolOutlined />, color: '#faad14' },
          { title: 'Active Courses', value: stats.activeCourses, icon: <ReadOutlined />, color: '#722ed1' },
        ];
      default: // RESEARCHER
        return [
          { title: 'My Publications', value: researcherStats.publications, icon: <BookOutlined />, color: '#1890ff' },
          { title: 'Enrolled Courses', value: researcherStats.enrolledCourses, icon: <ReadOutlined />, color: '#52c41a' },
          { title: 'Service Requests', value: researcherStats.serviceRequests, icon: <ToolOutlined />, color: '#faad14' },
        ];
    }
  };

  const getWelcomeMessage = () => {
    const userRole = user?.role || USER_ROLES.RESEARCHER;
    const name = user?.first_name || user?.username || 'User';
    
    switch (userRole) {
      case USER_ROLES.ADMIN:
        return {
          title: `Welcome back, ${name}!`,
          description: 'Manage the Ageri Research Platform and oversee all system operations.',
        };
      case USER_ROLES.MODERATOR:
        return {
          title: `Welcome back, ${name}!`,
          description: 'Review publications, manage content, and support the research community.',
        };
      default:
        return {
          title: `Welcome back, ${name}!`,
          description: 'Explore research opportunities, submit publications, and advance your academic journey.',
        };
    }
  };

  const welcomeMessage = getWelcomeMessage();
  const quickActions = getQuickActions();
  const roleStats = getRoleSpecificStats();

  return (
    <div>
      {/* Welcome Section */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
          {welcomeMessage.title}
        </Title>
        <Paragraph style={{ fontSize: '16px', marginBottom: 24 }}>
          {welcomeMessage.description}
        </Paragraph>
        <Space size="middle">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              type={action.type}
              icon={action.icon}
              size="large"
              onClick={() => navigate(action.path)}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      </Card>

      {/* Statistics Cards */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          My Statistics
        </Title>
        <Row gutter={[16, 16]}>
          {roleStats.map((stat, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card>
                {statsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Spin size="small" />
                    <div style={{ marginTop: 8, color: '#666' }}>{stat.title}</div>
                  </div>
                ) : (
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.icon}
                    valueStyle={{ color: stat.color, transition: 'all 0.3s ease' }}
                  />
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Remove announcements, service requests, enrolled courses, recent activity for researchers */}
    </div>
  );
};

export default DashboardPage;
