import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Progress,
  Table,
  Tag,
  Space,
  Select,
  DatePicker,
  Spin,
  Alert,
  Button
} from 'antd';
import {
  BarChartOutlined,
  UserOutlined,
  FileTextOutlined,
  BookOutlined,
  ToolOutlined,
  EyeOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Line, Column, Pie } from '@ant-design/plots';
import { useRealTimeStats, useAnimatedCounter } from '../../hooks/useRealTimeStats';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('last30Days');

  // Real-time statistics with multiple data sources
  const { stats: dashboardStats, loading: dashboardLoading, refresh: refreshDashboard } = useRealTimeStats('dashboard', 30000);
  const { stats: systemStats, loading: systemLoading, refresh: refreshSystem } = useRealTimeStats('system', 60000);

  // Animated counters for smooth transitions
  const totalUsersCount = useAnimatedCounter(dashboardStats?.users?.total || 0);
  const activeTodayCount = useAnimatedCounter(dashboardStats?.users?.activeToday || 0);
  const newThisMonthCount = useAnimatedCounter(dashboardStats?.users?.newThisMonth || 0);
  const pageViewsCount = useAnimatedCounter(dashboardStats?.analytics?.pageViews || 0);
  const publicationsCount = useAnimatedCounter(dashboardStats?.content?.totalPublications || 0);
  const coursesCount = useAnimatedCounter(dashboardStats?.content?.totalCourses || 0);
  const servicesCount = useAnimatedCounter(dashboardStats?.content?.totalServices || 0);
  const announcementsCount = useAnimatedCounter(dashboardStats?.content?.totalAnnouncements || 0);

  // Use system stats from real-time hook
  const systemHealth = systemStats || {
    serverStatus: 'healthy',
    databaseStatus: 'healthy',
    cacheStatus: 'warning',
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 23,
    networkTraffic: 89
  };

  const [userActivityData, setUserActivityData] = useState([
    { date: '2024-01-01', registrations: 12, logins: 145 },
    { date: '2024-01-02', registrations: 8, logins: 167 },
    { date: '2024-01-03', registrations: 15, logins: 189 },
    { date: '2024-01-04', registrations: 6, logins: 134 },
    { date: '2024-01-05', registrations: 11, logins: 156 },
    { date: '2024-01-06', registrations: 9, logins: 178 },
    { date: '2024-01-07', registrations: 13, logins: 198 }
  ]);

  const [contentMetrics, setContentMetrics] = useState([
    { type: 'Publications', count: 342, growth: 12.5 },
    { type: 'Courses', count: 28, growth: -2.1 },
    { type: 'Services', count: 15, growth: 8.7 },
    { type: 'Announcements', count: 67, growth: 15.3 }
  ]);

  const [topContent, setTopContent] = useState([
    { title: 'مقدمة في الذكاء الاصطناعي الزراعي', type: 'Course', views: 1245, engagement: 89 },
    { title: 'تحليل التربة المتقدم', type: 'Service', views: 987, engagement: 76 },
    { title: 'أحدث التقنيات في الري', type: 'Publication', views: 756, engagement: 82 },
    { title: 'ورشة الزراعة المستدامة', type: 'Announcement', views: 654, engagement: 71 }
  ]);

  useEffect(() => {
    // Refresh data when date range changes
    refreshDashboard();
    refreshSystem();
  }, [dateRange, refreshDashboard, refreshSystem]);

  const getStatusColor = (status) => {
    const colors = {
      healthy: '#52c41a',
      warning: '#faad14',
      critical: '#ff4d4f',
      offline: '#d9d9d9'
    };
    return colors[status] || colors.offline;
  };

  const getStatusIcon = (status) => {
    const icons = {
      healthy: <CheckCircleOutlined />,
      warning: <ExclamationCircleOutlined />,
      critical: <CloseCircleOutlined />,
      offline: <CloseCircleOutlined />
    };
    return icons[status] || icons.offline;
  };

  const getGrowthIndicator = (growth) => {
    if (growth > 0) {
      return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    } else if (growth < 0) {
      return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
    }
    return null;
  };

  const userActivityConfig = {
    data: userActivityData,
    xField: 'date',
    yField: 'registrations',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const contentDistributionConfig = {
    data: contentMetrics.map(item => ({ type: item.type, value: item.count })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  const topContentColumns = [
    {
      title: t('common.title'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: t('common.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          Course: 'blue',
          Service: 'green',
          Publication: 'purple',
          Announcement: 'orange'
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: t('admin.analytics.pageViews'),
      dataIndex: 'views',
      key: 'views',
      render: (views) => views.toLocaleString(),
    },
    {
      title: 'Engagement',
      dataIndex: 'engagement',
      key: 'engagement',
      render: (engagement) => (
        <Progress
          percent={engagement}
          size="small"
          status={engagement > 80 ? 'success' : engagement > 60 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <BarChartOutlined style={{ marginRight: '8px' }} />
          {t('admin.analytics.title')}
        </Title>
        <Text type="secondary">
          {t('admin.analytics.description')}
        </Text>
      </div>

      {/* Date Range Selector */}
      <Card style={{ marginBottom: '16px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text strong>{t('admin.analytics.overview')}</Text>
          </Col>
          <Col>
            <Select
              value={dateRange}
              onChange={setDateRange}
              style={{ width: 200 }}
            >
              <Option value="last7Days">{t('admin.analytics.last7Days')}</Option>
              <Option value="last30Days">{t('admin.analytics.last30Days')}</Option>
              <Option value="thisMonth">{t('admin.analytics.thisMonth')}</Option>
              <Option value="lastMonth">{t('admin.analytics.lastMonth')}</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Spin spinning={dashboardLoading}>
        {/* Overview Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card loading={dashboardLoading}>
              <Statistic
                title={t('admin.analytics.totalUsers')}
                value={totalUsersCount.value}
                prefix={<UserOutlined />}
                valueStyle={{
                  color: '#1890ff',
                  transition: 'all 0.3s ease'
                }}
                suffix={
                  <Button
                    type="text"
                    size="small"
                    icon={<ReloadOutlined spin={totalUsersCount.isAnimating} />}
                    onClick={refreshDashboard}
                    style={{ marginLeft: '8px' }}
                  />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={dashboardLoading}>
              <Statistic
                title={t('admin.analytics.activeToday')}
                value={activeTodayCount.value}
                prefix={<EyeOutlined />}
                valueStyle={{
                  color: '#52c41a',
                  transition: 'all 0.3s ease'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={dashboardLoading}>
              <Statistic
                title={t('admin.analytics.newThisMonth')}
                value={newThisMonthCount.value}
                prefix={<TrophyOutlined />}
                valueStyle={{
                  color: '#722ed1',
                  transition: 'all 0.3s ease'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={dashboardLoading}>
              <Statistic
                title={t('admin.analytics.pageViews')}
                value={pageViewsCount.value}
                prefix={<EyeOutlined />}
                valueStyle={{
                  color: '#fa8c16',
                  transition: 'all 0.3s ease'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Content Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card loading={dashboardLoading}>
              <Statistic
                title={t('admin.analytics.totalPublications')}
                value={publicationsCount.value}
                prefix={<FileTextOutlined />}
                suffix={getGrowthIndicator(12.5)}
                valueStyle={{
                  color: '#13c2c2',
                  transition: 'all 0.3s ease'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={dashboardLoading}>
              <Statistic
                title={t('admin.analytics.totalCourses')}
                value={coursesCount.value}
                prefix={<BookOutlined />}
                suffix={getGrowthIndicator(-2.1)}
                valueStyle={{
                  color: '#eb2f96',
                  transition: 'all 0.3s ease'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={dashboardLoading}>
              <Statistic
                title={t('admin.analytics.totalServices')}
                value={servicesCount.value}
                prefix={<ToolOutlined />}
                suffix={getGrowthIndicator(8.7)}
                valueStyle={{
                  color: '#f759ab',
                  transition: 'all 0.3s ease'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={dashboardLoading}>
              <Statistic
                title={t('admin.analytics.totalAnnouncements')}
                value={announcementsCount.value}
                prefix={<FileTextOutlined />}
                suffix={getGrowthIndicator(15.3)}
                valueStyle={{
                  color: '#fadb14',
                  transition: 'all 0.3s ease'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts and Detailed Analytics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          {/* User Activity Chart */}
          <Col xs={24} lg={12}>
            <Card title={t('admin.analytics.userActivity')}>
              <Line {...userActivityConfig} />
            </Card>
          </Col>

          {/* Content Distribution */}
          <Col xs={24} lg={12}>
            <Card title={t('admin.analytics.contentMetrics')}>
              <Pie {...contentDistributionConfig} />
            </Card>
          </Col>
        </Row>

        {/* System Health */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={16}>
            <Card title={t('admin.analytics.systemHealth')}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card size="small">
                    <Statistic
                      title={t('admin.analytics.cpuUsage')}
                      value={systemHealth.cpuUsage}
                      suffix="%"
                      valueStyle={{
                        color: systemHealth.cpuUsage > 80 ? '#ff4d4f' :
                               systemHealth.cpuUsage > 60 ? '#faad14' : '#52c41a'
                      }}
                    />
                    <Progress
                      percent={systemHealth.cpuUsage}
                      size="small"
                      status={systemHealth.cpuUsage > 80 ? 'exception' : 'success'}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card size="small">
                    <Statistic
                      title={t('admin.analytics.memoryUsage')}
                      value={systemHealth.memoryUsage}
                      suffix="%"
                      valueStyle={{
                        color: systemHealth.memoryUsage > 80 ? '#ff4d4f' :
                               systemHealth.memoryUsage > 60 ? '#faad14' : '#52c41a'
                      }}
                    />
                    <Progress
                      percent={systemHealth.memoryUsage}
                      size="small"
                      status={systemHealth.memoryUsage > 80 ? 'exception' : 'success'}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card size="small">
                    <Statistic
                      title={t('admin.analytics.diskUsage')}
                      value={systemHealth.diskUsage}
                      suffix="%"
                      valueStyle={{
                        color: systemHealth.diskUsage > 80 ? '#ff4d4f' :
                               systemHealth.diskUsage > 60 ? '#faad14' : '#52c41a'
                      }}
                    />
                    <Progress
                      percent={systemHealth.diskUsage}
                      size="small"
                      status={systemHealth.diskUsage > 80 ? 'exception' : 'success'}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12}>
                  <Card size="small">
                    <Statistic
                      title={t('admin.analytics.networkTraffic')}
                      value={systemHealth.networkTraffic}
                      suffix="MB/s"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* System Status */}
          <Col xs={24} lg={8}>
            <Card title="System Status">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{t('admin.analytics.serverStatus')}</Text>
                  <Tag
                    color={getStatusColor(systemHealth.serverStatus)}
                    icon={getStatusIcon(systemHealth.serverStatus)}
                  >
                    {t(`admin.analytics.${systemHealth.serverStatus}`)}
                  </Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{t('admin.analytics.databaseStatus')}</Text>
                  <Tag
                    color={getStatusColor(systemHealth.databaseStatus)}
                    icon={getStatusIcon(systemHealth.databaseStatus)}
                  >
                    {t(`admin.analytics.${systemHealth.databaseStatus}`)}
                  </Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>{t('admin.analytics.cacheStatus')}</Text>
                  <Tag
                    color={getStatusColor(systemHealth.cacheStatus)}
                    icon={getStatusIcon(systemHealth.cacheStatus)}
                  >
                    {t(`admin.analytics.${systemHealth.cacheStatus}`)}
                  </Tag>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Top Content Table */}
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Top Performing Content">
              <Table
                columns={topContentColumns}
                dataSource={topContent}
                rowKey="title"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AnalyticsPage;
