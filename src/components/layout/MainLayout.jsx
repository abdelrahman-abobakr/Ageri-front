import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme, Breadcrumb, Badge, List, Typography } from 'antd';
import AppLogo from '../../assets/ageri.jpg'; // Assuming your logo is at this path
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



  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };





  // Get translated menu label
  const getMenuLabel = (key) => {
    const labelMap = {
      'dashboard': t('navigation.dashboard'),
      'users': t('navigation.userManagement'),
      'research': t('navigation.myResearch'),
      'organization': t('navigation.organization'),
      'training': t('navigation.training'),
      'services': t('navigation.services'),
      'content': t('navigation.content'),
      'profile': t('navigation.profile'),
      'home': t('navigation.home'),
      'posts': t('navigation.posts'),
      'courses': t('navigation.courses'),
    };
    return labelMap[key] || key;
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    // Read role from localStorage if available
    const localRole = localStorage.getItem('role');
    const userRole = localRole || user?.role || USER_ROLES.RESEARCHER;
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

  // Sidebar menu click handler
  const handleMenuClick = ({ key }) => {
    // If moderator, always use localStorage role for navigation
    const localRole = localStorage.getItem('role');
    if (localRole === USER_ROLES.MODERATOR) {
      navigate(key);
      return;
    }
    // Default navigation logic
    const appPath = key.startsWith('/app') ? key : `/app${key}`;
    navigate(appPath);
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
          <img
            src={AppLogo}
            alt="App Logo"
            style={{
              height: '32px',
              marginRight: sidebarCollapsed ? 0 : '12px',
              transition: 'margin-right 0.2s',
            }}
          />
          {!sidebarCollapsed && t('homepage.heroTitle').split(' ')[0]}
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
