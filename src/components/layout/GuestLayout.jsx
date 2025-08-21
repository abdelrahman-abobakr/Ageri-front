import { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  theme, 
  Breadcrumb, 
  Dropdown, 
  message, 
  Avatar, 
  Spin,
  Typography 
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
} from '@ant-design/icons';
import { MENU_ITEMS, USER_ROLES } from '../../constants';
import { organizationService } from '../../services/organizationService';
import { logoutUser } from '../../store/slices/authSlice';
import AppLogo from '../../assets/ageri.jpg';
import LanguageSwitcher from '../common/LanguageSwitcher';

const { Header, Content } = Layout;

// Icon mapping
const iconMap = {
  DashboardOutlined,
  BookOutlined,
  ReadOutlined,
  ToolOutlined,
  FileTextOutlined,
};
const { Text } = Typography;

const GuestLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [openDepartmentKeys, setOpenDepartmentKeys] = useState([]);
  const [isDepartmentsDropdownOpen, setIsDepartmentsDropdownOpen] = useState(false);
  const [loadingDepartmentIds, setLoadingDepartmentIds] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    loadDepartments();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const response = await organizationService.getDepartments();
      
      const formattedDepartments = response.results.map(dept => ({
        id: dept.id,
        name: dept.name,
        labs: [],
        loaded: false
      }));
      
      setDepartments(formattedDepartments || []);
    } catch (error) {
      message.error('Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };
const loadLabsForDepartment = async (departmentId) => {
  const department = departments.find(d => d.id === departmentId);
  if (!department || department.loaded || loadingDepartmentIds.includes(departmentId)) {
    return [];
  }

  try {
    setLoadingDepartmentIds(prev => [...prev, departmentId]);
    const { success, data: labs, error } = await organizationService.getDepartmentLabs(departmentId);
    
    if (!success) {
      message.error(error || 'Failed to load labs');
      return [];
    }

    setDepartments(prev => prev.map(d => 
      d.id === departmentId ? { 
        ...d, 
        labs: Array.isArray(labs) ? labs : [],
        loaded: true 
      } : d
    ));
    
    return labs;
  } catch (error) {
    message.error('An unexpected error occurred');
    return [];
  } finally {
    setLoadingDepartmentIds(prev => prev.filter(id => id !== departmentId));
  }
};
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLabClick = (labId) => {
    // Force close the dropdown immediately
    setIsDepartmentsDropdownOpen(false);
    setOpenDepartmentKeys([]);

    // Force blur any focused elements to help close the dropdown
    if (document.activeElement) {
      document.activeElement.blur();
    }

    // Navigate to the lab
    navigate(`/labs/${labId}`);
  };

  useEffect(() => {
    // Close dropdown when route changes
    const handleRouteChange = () => {
      setIsDepartmentsDropdownOpen(false);
      setOpenDepartmentKeys([]);
    };

    // Listen for navigation changes
    handleRouteChange();
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

  const handleDepartmentOpenChange = async (keys) => {
    const latestOpenKey = keys.find(key => !openDepartmentKeys.includes(key));
    if (latestOpenKey) {
      const departmentId = parseInt(latestOpenKey, 10);
      if (!isNaN(departmentId)) {
        await loadLabsForDepartment(departmentId);
      }
    }
    setOpenDepartmentKeys(keys);
  };

  const getDepartmentsDropdown = () => {
    if (departments.length === 0) {
      return {
        items: [
          {
            key: 'no-departments',
            label: 'No departments available',
            disabled: true,
          }
        ]
      };
    }

    const items = departments.map(department => ({
      key: String(department.id),
      label: department.name,
      icon: <BankOutlined />,
      children: department.loaded
        ? department.labs.length > 0
          ? department.labs.map(lab => ({
            key: `lab-${lab.id}`,
            label: lab.name,
            icon: <ExperimentOutlined />,
            onClick: () => handleLabClick(lab.id),
          }))
          : [{
            key: `no-labs-${department.id}`,
            label: 'No labs available',
            disabled: true,
          }]
        : [{
          key: `loading-labs-${department.id}`,
          label: loadingDepartmentIds.includes(department.id) ? (
            <span><Spin size="small" /> Loading labs...</span>
          ) : 'Loading...',
          icon: <ExperimentOutlined />,
          disabled: true,
        }]
    }));

    return {
      items,
      onOpenChange: handleDepartmentOpenChange,
      openKeys: openDepartmentKeys
    };
  };

  const getMenuItems = () => {
    const items = MENU_ITEMS[USER_ROLES.GUEST] || [];
    const iconMap = {
      DashboardOutlined,
      BookOutlined,
      ReadOutlined,
      ToolOutlined,
      FileTextOutlined,
    };

    return items.map((item) => {
      const IconComponent = iconMap[item.icon];
      return {
        key: item.path,
        icon: IconComponent ? <IconComponent /> : <DashboardOutlined />,
        label: t(`navigation.${item.key}`) || item.key,
      };
    });
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [
      {
        title: t('common.home'),
        href: '/',
      },
    ];

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
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
      <Header
        style={{
          padding: '0 24px',
          background: '#fff',
          borderBottom: '2px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              marginRight: isMobile ? '16px' : '32px',
              flexShrink: 0
            }} 
            onClick={() => navigate('/')}
          >
            <img 
              src={AppLogo} 
              alt={t('homepage.heroTitle')} 
              style={{ height: '40px', borderRadius: '8px' }} 
            />
            {!isMobile && (
              <div>
                <h1 style={{
                  margin: 0,
                  color: '#1e3c72',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {t('homepage.heroTitle').split(' ')[0]}
                </h1>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '1' }}>
                  {t('homepage.heroTitle').split(' ').slice(1).join(' ')}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              {getMenuItems().map((item) => (
                <Button
                  key={item.key}
                  type="text"
                  icon={item.icon}
                  onClick={() => handleMenuClick({ key: item.key })}
                  style={{
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: location.pathname === item.key ? '#1890ff' : 'inherit',
                    fontWeight: location.pathname === item.key ? 'bold' : 'normal',
                  }}
                >
                  {!isMobile && item.label}
                </Button>
              ))}
            </div>

            <Dropdown
              key={location.pathname} // This forces the dropdown to remount on route change
              menu={getDepartmentsDropdown()}
              trigger={['click']}
              placement="bottomRight"
              disabled={departmentsLoading}
              open={isDepartmentsDropdownOpen}
              onOpenChange={(flag) => {
                setIsDepartmentsDropdownOpen(flag);
                // Reset sub-menu when main dropdown is closed
                if (!flag) setOpenDepartmentKeys([]);
              }}
              destroyPopupOnHide={true} // This ensures the popup is destroyed when hidden
            >
              <Button
                type="text"
                style={{
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: '16px',
                  flexShrink: 0
                }}
                loading={departmentsLoading}
              >
                <BankOutlined />
                {!isMobile && t('navigation.departments')}
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <LanguageSwitcher size={isMobile ? 'small' : 'middle'} />
          
          {isAuthenticated ? (
            <>
              {!isMobile && (
                <Text style={{ marginRight: 8, color: '#666' }}>
                  Welcome, {user?.first_name || user?.username}
                </Text>
              )}
              <Button
                type="default"
                icon={<DashboardOutlined />}
                onClick={() => navigate('/app/dashboard')}
                size={isMobile ? 'small' : 'middle'}
              >
                {!isMobile && t('common.dashboard')}
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
                    {
                      type: 'divider',
                    },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: 'Logout',
                      onClick: handleLogout,
                    },
                  ]
                }}
                placement="bottomRight"
                arrow
              >
                <Avatar
                  style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  size={isMobile ? 'small' : 'default'}
                />
              </Dropdown>
            </>
          ) : (
            <>
              <Button
                type="default"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                size={isMobile ? 'small' : 'middle'}
              >
                {!isMobile && t('common.login')}
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
                size={isMobile ? 'small' : 'middle'}
              >
                {!isMobile && t('common.register')}
              </Button>
            </>
          )}
        </div>
      </Header>

      <Content style={{
        minHeight: 'calc(100vh - 64px)',
        background: '#f8f9fa'
      }}>
        {location.pathname !== '/' && (
          <div style={{
            background: '#fff',
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Breadcrumb
              items={generateBreadcrumbs()}
            />
          </div>
        )}

        {location.pathname === '/' ? (
          <Outlet />
        ) : (
          <div style={{
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <Outlet />
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default GuestLayout;
