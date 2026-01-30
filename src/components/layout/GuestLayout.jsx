import { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  theme,
  Dropdown,
  message,
  Avatar,
  Typography,
  Drawer,
} from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  DashboardOutlined,
  BookOutlined,
  ReadOutlined,
  ToolOutlined,
  FileTextOutlined,
  LoginOutlined,
  UserAddOutlined,
  BankOutlined,
  DownOutlined,
  ExperimentOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { MENU_ITEMS, USER_ROLES } from '../../constants';
import { organizationService } from '../../services/organizationService';
import { logoutUser } from '../../store/slices/authSlice';
import AppLogo from '../../assets/Ageri.png';
import LanguageSwitcher from '../common/LanguageSwitcher';

const { Header, Content } = Layout;
const { Text } = Typography;

// Icon mapping
const iconMap = {
  DashboardOutlined,
  BookOutlined,
  ReadOutlined,
  ToolOutlined,
  FileTextOutlined,
};

// Services dropdown items
const getServicesDropdownItems = (navigate, t, isMobile, setIsDrawerOpen) => {
  return {
    items: [
      {
        key: 'services-analysis',
        label: t('navigation.analysis', 'Analysis'),
        icon: <ToolOutlined />,
        onClick: () => {
          navigate('/services');
          if (isMobile && setIsDrawerOpen) setIsDrawerOpen(false);
        },
      },
      {
        key: 'services-training',
        label: t('navigation.training', 'Training'),
        icon: <ReadOutlined />,
        onClick: () => {
          navigate('/courses');
          if (isMobile && setIsDrawerOpen) setIsDrawerOpen(false);
        },
      },
    ],
  };
};

const GuestLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1200);
  const [labs, setLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [isDepartmentsDropdownOpen, setIsDepartmentsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1200);
    };

    window.addEventListener('resize', handleResize);
    loadAllLabs();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadAllLabs = async () => {
    try {
      setLabsLoading(true);
      const departmentsResponse = await organizationService.getDepartments();

      if (departmentsResponse?.results) {
        const allLabs = [];

        // Load labs for each department
        for (const dept of departmentsResponse.results) {
          try {
            const { success, data: departmentLabs } =
              await organizationService.getDepartmentLabs(dept.id);
            if (success && Array.isArray(departmentLabs)) {
              // Add department info to each lab
              const labsWithDept = departmentLabs.map((lab) => ({
                ...lab,
                departmentName: dept.name,
                departmentId: dept.id,
              }));
              allLabs.push(...labsWithDept);
            }
          } catch (error) {
            console.error(`Failed to load labs for department ${dept.name}:`, error);
          }
        }

        setLabs(allLabs);
      }
    } catch (error) {
      message.error('Failed to load labs');
      console.error('Error loading labs:', error);
    } finally {
      setLabsLoading(false);
    }
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLabClick = (labId) => {
    setIsDepartmentsDropdownOpen(false);
    if (document.activeElement) document.activeElement.blur();
    navigate(`/labs/${labId}`);
    setIsDrawerOpen(false);
  };

  useEffect(() => {
    setIsDepartmentsDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      message.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      message.error('Logout failed');
    }
  };

  const getDepartmentsDropdown = () => {
    if (labs.length === 0) {
      return {
        items: [
          {
            key: 'no-labs',
            label: 'No departments available',
            disabled: true,
          },
        ],
      };
    }

    const items = labs.map((lab) => ({
      key: `lab-${lab.id}`,
      label: lab.name,
      icon: <ExperimentOutlined />,
      onClick: () => handleLabClick(lab.id),
    }));

    return { items };
  };

  const getMenuItems = () => {
    const items = MENU_ITEMS[USER_ROLES.GUEST] || [];
    // Filter out 'courses', 'services', and 'posts' as they will be in the dropdown or removed
    const filteredItems = items.filter(item =>
      item.key !== 'courses' && item.key !== 'services' && item.key !== 'posts'
    );
    return filteredItems.map((item) => {
      const IconComponent = iconMap[item.icon];
      return {
        key: item.path,
        icon: IconComponent ? <IconComponent /> : <DashboardOutlined />,
        label: t(`navigation.${item.key}`) || item.key,
      };
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          padding: isMobile ? '0 12px' : '0 24px',
          background: '#fff',
          borderBottom: '2px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: isMobile ? '64px' : '80px',
          transition: 'height 0.3s ease, padding 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            gap: '16px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onClick={() => navigate('/')}
          >
            <img
              src={AppLogo}
              alt={t('common.orgName')}
              style={{
                height: isMobile ? '48px' : '64px',
                borderRadius: '8px',
                transition: 'height 0.3s ease'
              }}
            />
            {!isMobile && (
              isTablet ? (
                // Show only acronym on tablet
                <h1
                  style={{
                    margin: 0,
                    color: '#1e3c72',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                  }}
                >
                  {t('common.orgAcronym')}
                </h1>
              ) : (
                // Show full name on desktop
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', lineHeight: '2rem' }}>
                  <h1
                    style={{
                      margin: 0,
                      color: '#1e3c72',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      lineHeight: '1',
                    }}
                  >
                    {t('common.orgName')}
                  </h1>
                  <span
                    style={{
                      color: '#666',
                      fontSize: '14px',
                      fontWeight: '600',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {t('common.orgAcronym')}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Desktop nav */}
          {!isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 16 }}>
              <Button
                type={location.pathname === '/' ? 'primary' : 'text'}
                icon={<DashboardOutlined />}
                size="middle"
                onClick={() => navigate('/')}
              >
                {t('navigation.home', 'Home')}
              </Button>
              <Dropdown menu={getServicesDropdownItems(navigate, t)} trigger={['click']} placement="bottomLeft">
                <Button icon={<ToolOutlined />} size="middle">
                  {t('navigation.services', 'Services')} <DownOutlined style={{ fontSize: '12px' }} />
                </Button>
              </Dropdown>
              <Dropdown menu={getDepartmentsDropdown()} trigger={['click']} placement="bottomLeft">
                <Button icon={<BankOutlined />} size="middle">
                  {t('navigation.departments', 'Departments')}
                </Button>
              </Dropdown>
              <div style={{ flex: 1 }} />
            </div>
          ) : (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 22 }} />}
              onClick={() => setIsDrawerOpen(true)}
            />
          )}

        </div>

        {/* Right side (lang + auth) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8 }}>
          <LanguageSwitcher size={isMobile ? 'small' : 'middle'} />
          {!isMobile && !isTablet && isAuthenticated && (
            <Text style={{ marginRight: 8, color: '#666', fontSize: '16px' }}>
              Welcome, {user?.first_name || user?.username}
            </Text>
          )}
          {!isMobile && (
            <>
              {isAuthenticated ? (
                <>
                  <Button
                    type="default"
                    icon={<DashboardOutlined />}
                    onClick={() => navigate('/app/dashboard')}
                    size="middle"
                  >
                    {t('common.dashboard')}
                  </Button>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'profile',
                          icon: <UserOutlined />,
                          label: t('common.profile'),
                          onClick: () => navigate('/app/profile'),
                        },
                        { type: 'divider' },
                        {
                          key: 'logout',
                          icon: <LogoutOutlined />,
                          label: 'Logout',
                          onClick: handleLogout,
                        },
                      ],
                    }}
                    placement="bottomRight"
                    arrow
                  >
                    <Avatar
                      style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                      icon={<UserOutlined />}
                      src={user?.avatar}
                      size="large"
                    />
                  </Dropdown>
                </>
              ) : (
                <>
                  <Button
                    type="default"
                    icon={<LoginOutlined />}
                    onClick={() => navigate('/login')}
                    size="middle"
                  >
                    {t('common.login')}
                  </Button>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => navigate('/register')}
                    size="middle"
                  >
                    {t('common.register')}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title={t('homepage.heroTitle')}
        placement="left"
        closable
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={260}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => {
            handleMenuClick({ key });
            setIsDrawerOpen(false);
          }}
          items={getMenuItems()}
        />

        <div style={{ marginTop: 16 }}>
          <Dropdown menu={getServicesDropdownItems(navigate, t, true, setIsDrawerOpen)} trigger={['click']} placement="bottomLeft">
            <Button block icon={<ToolOutlined />}>
              {t('navigation.services', 'Services')} <DownOutlined style={{ fontSize: '12px' }} />
            </Button>
          </Dropdown>
        </div>

        <div style={{ marginTop: 8 }}>
          <Dropdown menu={getDepartmentsDropdown()} trigger={['click']} placement="bottomLeft">
            <Button block icon={<BankOutlined />}>
              {t('navigation.departments', 'Departments')}
            </Button>
          </Dropdown>
        </div>

        <div style={{ marginTop: 24 }}>
          {isAuthenticated ? (
            <>
              <Button
                block
                icon={<DashboardOutlined />}
                onClick={() => {
                  navigate('/app/dashboard');
                  setIsDrawerOpen(false);
                }}
              >
                {t('common.dashboard')}
              </Button>
              <Button
                block
                icon={<UserOutlined />}
                onClick={() => {
                  navigate('/app/profile');
                  setIsDrawerOpen(false);
                }}
                style={{ marginTop: 8 }}
              >
                {t('common.profile')}
              </Button>
              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  handleLogout();
                  setIsDrawerOpen(false);
                }}
                style={{ marginTop: 8 }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                block
                icon={<LoginOutlined />}
                onClick={() => {
                  navigate('/login');
                  setIsDrawerOpen(false);
                }}
              >
                {t('common.login')}
              </Button>
              <Button
                block
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => {
                  navigate('/register');
                  setIsDrawerOpen(false);
                }}
                style={{ marginTop: 8 }}
              >
                {t('common.register')}
              </Button>
            </>
          )}
        </div>
      </Drawer>

      <Content
        style={{
          minHeight: isMobile ? 'calc(100vh - 64px)' : 'calc(100vh - 80px)',
          background: '#f8f9fa',
        }}
      >
        {location.pathname === '/' ? (
          <Outlet />
        ) : (
          <div
            style={{
              padding: '24px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <Outlet />
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default GuestLayout;
