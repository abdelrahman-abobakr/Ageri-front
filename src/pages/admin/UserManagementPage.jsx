import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  message,
  Dropdown,
  Tooltip,
  Spin
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { adminService } from '../../services';
import { USER_ROLES, USER_STATUS } from '../../constants';
import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';
import RealTimeIndicator from '../../components/admin/RealTimeIndicator';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const UserManagementPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // This will map to is_approved
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Real-time statistics
  const { stats: userStats, loading: statsLoading, lastUpdated, refresh: refreshStats } = useRealTimeStats('users', 30000);

  // Animated counters for smooth number transitions - Updated for new stats
  const totalUsersCount = useAnimatedCounter(userStats?.totalUsers || 0);
  const approvedUsersCount = useAnimatedCounter(userStats?.approvedUsers || 0);
  const notApprovedUsersCount = useAnimatedCounter(userStats?.notApprovedUsers || 0);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        page_size: pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;

      // Map status filter to is_approved filter
      if (statusFilter === 'approved') {
        params.is_approved = true;
      } else if (statusFilter === 'pending') {
        params.is_approved = false;
      }
      // If statusFilter is empty or 'all', don't add is_approved filter

      const response = await adminService.getUsers(params);
      setUsers(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      message.error('فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    confirm({
      title: t('admin.userManagement.confirmApprove'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await adminService.approveUser(userId);
          message.success(t('admin.userManagement.userApproved'));
          loadUsers();
          refreshStats(); // Refresh real-time stats
        } catch (error) {
          message.error('فشل في الموافقة على المستخدم');
        }
      },
    });
  };

  const handleRejectUser = async (userId) => {
    confirm({
      title: t('admin.userManagement.confirmReject'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await adminService.rejectUser(userId);
          message.success(t('admin.userManagement.userRejected'));
          loadUsers();
          refreshStats();
        } catch (error) {
          message.error('فشل في رفض المستخدم');
        }
      },
    });
  };

  const handleDeleteUser = async (userId) => {
    confirm({
      title: t('admin.userManagement.confirmDelete'),
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await adminService.deleteUser(userId);
          message.success(t('admin.userManagement.userDeleted'));
          loadUsers();
          refreshStats();
        } catch (error) {
          message.error('فشل في حذف المستخدم');
        }
      },
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      message.success(t('admin.userManagement.roleChanged'));
      loadUsers();
    } catch (error) {
      message.error('فشل في تغيير دور المستخدم');
    }
  };

  // Updated function to work with is_approved
  const getStatusTag = (user) => {
    if (user.is_approved) {
      return <Tag color="green">{t('admin.userManagement.approved')}</Tag>;
    } else {
      return <Tag color="orange">{t('admin.userManagement.pending')}</Tag>;
    }
  };

  const getRoleTag = (role) => {
    const roleConfig = {
      [USER_ROLES.ADMIN]: { color: 'purple', text: t('admin.userManagement.admin') },
      [USER_ROLES.MODERATOR]: { color: 'blue', text: t('admin.userManagement.moderator') },
      [USER_ROLES.RESEARCHER]: { color: 'green', text: t('admin.userManagement.researcher') },
    };

    const config = roleConfig[role] || { color: 'default', text: role };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Updated dropdown menu items based on is_approved
  const getActionMenuItems = (user) => {
    const baseItems = [
      {
        key: 'view',
        icon: <EyeOutlined />, 
        label: t('admin.userManagement.viewProfile'),
        onClick: () => {
          // Open public researcher profile using id in researcher_profile if available
          if (user.id) {
            window.open(`/researchers/${user.id}`, '_blank');
          } else {
            message.info('لا يوجد ملف باحث عام لهذا المستخدم');
          }
        }
      }
    ];

    // Add approve/reject based on current approval status
    if (user.is_approved) {
      // User is approved, show reject option
      baseItems.push({
        key: 'reject',
        icon: <CloseOutlined />,
        label: t('admin.userManagement.reject'),
        onClick: () => handleRejectUser(user.id)
      });
    } else {
      // User is not approved, show approve option
      baseItems.push({
        key: 'approve',
        icon: <CheckOutlined />,
        label: t('admin.userManagement.approve'),
        onClick: () => handleApproveUser(user.id)
      });
    }

    // Add divider and delete option
    baseItems.push(
      { type: 'divider' },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: t('admin.userManagement.deleteUser'),
        onClick: () => handleDeleteUser(user.id),
        danger: true
      }
    );

    return baseItems;
  };

  const columns = [
    {
      title: t('auth.username'),
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Avatar
            src={record.avatar}
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.first_name} {record.last_name}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t('auth.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('common.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          size="small"
          style={{ width: 120 }}
          onChange={(newRole) => handleRoleChange(record.id, newRole)}
        >
          <Option value={USER_ROLES.ADMIN}>{t('admin.userManagement.admin')}</Option>
          <Option value={USER_ROLES.MODERATOR}>{t('admin.userManagement.moderator')}</Option>
          <Option value={USER_ROLES.RESEARCHER}>{t('admin.userManagement.researcher')}</Option>
        </Select>
      ),
    },
    {
      title: t('admin.userManagement.status'),
      dataIndex: 'is_approved', // Changed from 'status'
      key: 'is_approved',
      render: (is_approved, record) => getStatusTag(record), // Pass the whole record
    },
    {
      title: t('admin.userManagement.registeredOn'),
      dataIndex: 'date_joined',
      key: 'date_joined',
      render: (date) => formatDate(date),
    },
    {
      title: t('admin.userManagement.lastLogin'),
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date) => formatDate(date),
    },
    {
      title: t('admin.userManagement.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {/* Show quick action buttons for pending users */}
          {!record.is_approved && (
            <>
              <Tooltip title={t('admin.userManagement.approve')}>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckOutlined />}
                  onClick={() => handleApproveUser(record.id)}
                />
              </Tooltip>
            </>
          )}
          {/* Show reject button for approved users */}
          {record.is_approved && (
            <Tooltip title={t('admin.userManagement.reject')}>
              <Button
                danger
                size="large"
                icon={<CloseOutlined />}
                onClick={() => handleRejectUser(record.id)}
              />
            </Tooltip>
          )}
          {/* Direct public profile button */}
          {record.researcher_profile && record.researcher_profile.id && (
            <Tooltip title={t('admin.userManagement.viewProfile')}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => window.open(`/researchers/${record.researcher_profile.id}`, '_blank')}
              />
            </Tooltip>
          )}
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={['click']}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <UserOutlined style={{ marginRight: '8px' }} />
          {t('admin.userManagement.title')}
        </Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            {t('admin.userManagement.description')}
          </Text>
          <RealTimeIndicator
            lastUpdated={lastUpdated}
            isLoading={statsLoading}
            onRefresh={refreshStats}
          />
        </div>
      </div>

      {/* Statistics Cards - Updated to show Total, Approved, and Not Approved */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card loading={statsLoading}>
            <Statistic
              title={t('admin.userManagement.totalUsers')}
              value={totalUsersCount.value}
              prefix={<UserOutlined />}
              valueStyle={{
                color: '#1890ff',
                transition: 'all 0.3s ease'
              }}
              suffix={
                lastUpdated && (
                  <Tooltip title={`آخر تحديث: ${lastUpdated.toLocaleTimeString('ar-EG')}`}>
                    <Button
                      type="text"
                      size="small"
                      icon={<ReloadOutlined spin={totalUsersCount.isAnimating} />}
                      onClick={refreshStats}
                      style={{ marginLeft: '8px' }}
                    />
                  </Tooltip>
                )
              }
            />
          </Card>
        </Col>          
      </Row>

      {/* Filters and Search */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('admin.userManagement.searchPlaceholder')}
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={loadUsers}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder={t('admin.userManagement.filterByRole')}
              allowClear
              style={{ width: '100%' }}
              value={roleFilter}
              onChange={setRoleFilter}
            >
              <Option value="">{t('admin.userManagement.allRoles')}</Option>
              <Option value={USER_ROLES.ADMIN}>{t('admin.userManagement.admin')}</Option>
              <Option value={USER_ROLES.MODERATOR}>{t('admin.userManagement.moderator')}</Option>
              <Option value={USER_ROLES.RESEARCHER}>{t('admin.userManagement.researcher')}</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder={t('admin.userManagement.filterByStatus')}
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="">{t('admin.userManagement.allStatuses')}</Option>
              <Option value="pending">{t('admin.userManagement.pending')}</Option>
              <Option value="approved">{t('admin.userManagement.approved')}</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: setCurrentPage,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} من ${total} مستخدم`,
            }}
            locale={{
              emptyText: t('admin.userManagement.noUsers'),
            }}
            scroll={{ x: 800 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default UserManagementPage;