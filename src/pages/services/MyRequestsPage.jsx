import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Tag, Space, Typography, Row, Col,
  Input, Select, message, Spin, Empty, Tooltip
} from 'antd';
import {
  PlusOutlined, EyeOutlined, SearchOutlined, 
  ClockCircleOutlined, CheckCircleOutlined, 
  ExclamationCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { servicesService } from '../../services';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const MyRequestsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadMyRequests();
  }, [currentPage, statusFilter]);

  const loadMyRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm,
        status: statusFilter,
      };

      const response = await servicesService.getMyRequests(params);
      
      setRequests(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      message.error('Failed to load your service requests');
      
      // Fallback to mock data for development
      setRequests([
        {
          id: 1,
          service_name: 'Soil Analysis',
          description: 'Advanced soil testing for wheat farm',
          status: 'pending',
          priority: 'high',
          created_at: '2024-01-15T09:00:00Z',
          estimated_completion: '2024-01-18T17:00:00Z',
          assigned_technician: null,
          contact_phone: '+1234567890',
          contact_email: 'user@example.com'
        },
        {
          id: 2,
          service_name: 'Water Quality Testing',
          description: 'Groundwater quality assessment',
          status: 'in_progress',
          priority: 'medium',
          created_at: '2024-01-14T11:30:00Z',
          estimated_completion: '2024-01-16T15:00:00Z',
          assigned_technician: 'Dr. Ahmed Hassan',
          contact_phone: '+1234567890',
          contact_email: 'user@example.com'
        }
      ]);
      setTotal(2);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadMyRequests();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      in_progress: <ExclamationCircleOutlined />,
      completed: <CheckCircleOutlined />,
      cancelled: <CloseCircleOutlined />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" ellipsis>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm:ss')}>
          {moment(date).fromNow()}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: 'Estimated Completion',
      dataIndex: 'estimated_completion',
      key: 'estimated_completion',
      render: (date) => date ? (
        <Tooltip title={moment(date).format('YYYY-MM-DD HH:mm:ss')}>
          {moment(date).format('MMM DD, YYYY')}
        </Tooltip>
      ) : (
        <Text type="secondary">Not set</Text>
      ),
    },
    {
      title: 'Assigned Technician',
      dataIndex: 'assigned_technician',
      key: 'assigned_technician',
      render: (technician) => technician || <Text type="secondary">Not assigned</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/app/services/requests/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-0">
            My Service Requests
          </Title>
          <Text type="secondary">
            Track and manage your service requests
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/services')}
          size="large"
        >
          New Request
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search requests..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="">All Statuses</Option>
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Requests Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: setCurrentPage,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} requests`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="No service requests found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/services')}
                  >
                    Create Your First Request
                  </Button>
                </Empty>
              ),
            }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default MyRequestsPage;
