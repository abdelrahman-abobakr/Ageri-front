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
  const [labsLoading, setLabsLoading] = useState(false);
  const [expandedDepartment, setExpandedDepartment] = useState(null);

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
      console.error('Failed to load departments:', error);
      message.error('Failed to load departments');
    } finally {
      setDepartmentsLoading(false);
    }
  };
const loadLabsForDepartment = async (departmentId) => {
  try {
    setLabsLoading(true);
    const { success, data: labs, error } = await organizationService.getDepartmentLabs(departmentId);
    
    if (!success) {
      message.error(error || 'Failed to load labs');
      return [];
    }

    setDepartments(prev => prev.map(d => 
      d.id === departmentId ? { 
        ...d, 
        labs: Array.isArray(labs) ? labs : [], // تأكد أن labs هي مصفوفة
        loaded: true 
      } : d
    ));
    
    return labs;
  } catch (error) {
    console.error('Unexpected error:', error);
    message.error('An unexpected error occurred');
    return [];
  } finally {
    setLabsLoading(false);
  }
};
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLabClick = (labId) => {
    navigate(`/labs/${labId}`);
  };

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
    key: department.id,
    label: department.name,
    icon: <BankOutlined />,
    children: department.loaded
      ? department.labs.length > 0
        ? department.labs.map(lab => ({
            key: `lab-${lab.id}`,
            label: `${lab.name} (${lab.current_researchers_count}/${lab.capacity})`,
            icon: <ExperimentOutlined />,
            onClick: () => handleLabClick(lab.id),
          }))
        : [{
            key: `no-labs-${department.id}`,
            label: 'No labs available',
            disabled: true,
          }]
      : [{
          key: `load-labs-${department.id}`,
          label: labsLoading ? (
            <span><Spin size="small" /> Loading labs...</span>
          ) : 'Click to load labs',
          icon: <ExperimentOutlined />,
          onClick: async (e) => {
            e.domEvent.stopPropagation();
            const labs = await loadLabsForDepartment(department.id);
            if (labs.length > 0) {
              message.success(`Loaded ${labs.length} lab(s)`);
            }
          }
        }]
  }));

  return { items };
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
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              A
            </div>
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
              menu={getDepartmentsDropdown()}
              trigger={['click']}
              placement="bottomRight"
              disabled={departmentsLoading}
              onOpenChange={(open) => {
                if (!open) setExpandedDepartment(null);
              }}
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
