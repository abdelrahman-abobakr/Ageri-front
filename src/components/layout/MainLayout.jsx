import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme, Breadcrumb, Badge, List, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  BookOutlined,
  BankOutlined,
  ReadOutlined,
  ToolOutlined,
  FileTextOutlined,
  BellOutlined,
  BarChartOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { MENU_ITEMS, USER_ROLES } from '../../constants';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { notificationService } from '../../services';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Icon mapping
const iconMap = {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  BankOutlined,
  ReadOutlined,
  ToolOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  BarChartOutlined,
  SearchOutlined,
};

const MainLayout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { sidebarCollapsed } = useSelector((state) => state.ui);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile
      if (mobile && !sidebarCollapsed) {
        dispatch(toggleSidebar());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, sidebarCollapsed]);

  // Load notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationLoading(true);
        const response = await notificationService.getNotifications({ page_size: 10 });
        setNotifications(response.results || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setNotificationLoading(false);
      }
    };

    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleNotificationClick = async (notification) => {
    try {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMenuClick = ({ key }) => {
    // Ensure we navigate within the app context
    const appPath = key.startsWith('/app') ? key : `/app${key}`;
    navigate(appPath);
  };

  // Get translated menu label
  const getMenuLabel = (key) => {
    const labelMap = {
      'dashboard': t('common.dashboard'),
      'users': t('navigation.userManagement'),
      'research': t('navigation.myResearch'),
      'organization': t('navigation.organization'),
      'training': t('navigation.training'),
      'services': t('common.services'),
      'content': t('navigation.content'),
      'analytics': t('navigation.analytics'),
      'notifications': t('navigation.notifications'),
      'settings': t('common.settings'),
      'profile': t('common.profile'),
      'home': t('common.home'),
      'announcements': t('common.announcements'),
      'courses': t('common.courses'),
    };
    return labelMap[key] || key;
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const userRole = user?.role || USER_ROLES.RESEARCHER;
    const items = MENU_ITEMS[userRole] || MENU_ITEMS[USER_ROLES.RESEARCHER];

    return items.map((item) => {
      const IconComponent = iconMap[item.icon];
      return {
        key: item.path,
        icon: IconComponent ? <IconComponent /> : <DashboardOutlined />,
        label: getMenuLabel(item.key),
      };
    });
  };

  // User dropdown menu
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('common.profile'),
      onClick: () => navigate('/app/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('common.settings'),
      onClick: () => navigate('/app/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: handleLogout,
    },
  ];

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [
      {
        title: 'Home',
        href: '/app/dashboard',
      },
    ];

    pathSegments.forEach((segment, index) => {
      const path = '/app/' + pathSegments.slice(1, index + 1).join('/');
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbItems.push({
        title,
        href: path,
      });
    });

    return breadcrumbItems;
  };

  // Notification dropdown content
  const notificationDropdown = (
    <div style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>Notifications</Text>
        {notifications.filter(n => !n.read).length > 0 && (
          <Badge
            count={notifications.filter(n => !n.read).length}
            style={{ marginLeft: 8 }}
          />
        )}
      </div>

      {notificationLoading ? (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Text type="secondary">Loading...</Text>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Text type="secondary">No notifications</Text>
        </div>
      ) : (
        <List
          size="small"
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: notification.read ? 'transparent' : '#f6ffed',
                borderBottom: '1px solid #f0f0f0',
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <List.Item.Meta
                title={
                  <Text strong={!notification.read} style={{ fontSize: '13px' }}>
                    {notification.title || 'Notification'}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {notification.message || 'No message'}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}

      <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
        <Button
          type="link"
          size="small"
          onClick={() => navigate('/app/notifications')}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 999,
          }}
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #f0f0f0',
          position: isMobile ? 'fixed' : 'relative',
          height: isMobile ? '100vh' : 'auto',
          zIndex: isMobile ? 1000 : 'auto',
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          fontSize: sidebarCollapsed ? '16px' : '18px',
          fontWeight: 'bold',
          color: '#1890ff',
        }}>
          {sidebarCollapsed ? 'أ' : t('homepage.heroTitle').split(' ')[0]}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname.replace('/app', '') || '/dashboard']}
          items={getMenuItems()}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ marginLeft: isMobile ? 0 : undefined }}>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => dispatch(toggleSidebar())}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            {!isMobile && (
              <h1 style={{
                margin: 0,
                marginLeft: 16,
                fontSize: '20px',
                color: '#1890ff'
              }}>
                {t('homepage.heroTitle')}
              </h1>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {!isMobile && (
              <span>{t('common.welcome')}, {user?.first_name || user?.username}</span>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher size="small" />

            {/* Notification Bell */}
            <Dropdown
              dropdownRender={() => notificationDropdown}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <Badge count={notifications.filter(n => !n.read).length} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ cursor: 'pointer' }}
                />
              </Badge>
            </Dropdown>

            {/* User Profile Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
                src={user?.avatar}
              />
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Breadcrumb 
            items={generateBreadcrumbs()} 
            style={{ marginBottom: 16 }}
          />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
