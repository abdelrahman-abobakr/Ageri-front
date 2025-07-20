import { useState, useEffect } from 'react';
import { Card, List, Input, Button, Tag, Typography, Row, Col, Pagination, Modal } from 'antd';
import { SearchOutlined, ToolOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesService } from '../../services';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const ServicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const pageSize = 12;

  const loadServices = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
      };

      if (search) params.search = search;

      const response = await servicesService.getTestServices(params);
      setServices(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleServiceDetails = (service) => {
    setSelectedService(service);
    setModalVisible(true);
  };

  const handleRequestService = (serviceId) => {
    // Redirect to login/register for service request
    navigate('/login', {
      state: {
        from: `/services`,
        message: 'Please login to request services'
      }
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for pricing';
    return `$${price}`;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Variable';
    return `${duration} days`;
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ToolOutlined style={{ marginRight: '8px' }} />
          {t('services.title')}
        </Title>
        <Paragraph type="secondary">
          {t('services.description')}
        </Paragraph>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder={t('services.searchPlaceholder')}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={16}>
            <Text type="secondary">
              {t('services.showing', { count: services.length, total })}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Services Grid */}
      <Row gutter={[24, 24]}>
        {services.map((service) => (
          <Col xs={24} sm={12} lg={8} key={service.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div
                  style={{
                    height: 160,
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ToolOutlined style={{ fontSize: '48px', color: 'white' }} />
                </div>
              }
              actions={[
                <Button
                  type="link"
                  onClick={() => handleServiceDetails(service)}
                >
                  {t('services.viewDetails')}
                </Button>,
                <Button
                  type="primary"
                  onClick={() => handleRequestService(service.id)}
                >
                  {t('services.requestService')}
                </Button>
              ]}
            >
              <div style={{ marginBottom: '12px' }}>
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {service.name}
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {service.category && (
                    <Tag color="blue">{service.category}</Tag>
                  )}
                  <Text type="secondary">
                    <DollarOutlined style={{ marginRight: '4px' }} />
                    {formatPrice(service.price)}
                  </Text>
                </div>
              </div>

              <Paragraph 
                ellipsis={{ rows: 3 }}
                style={{ marginBottom: '16px' }}
              >
                {service.description || 'No description available.'}
              </Paragraph>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">
                  <ClockCircleOutlined style={{ marginRight: '4px' }} />
                  {formatDuration(service.estimated_duration)}
                </Text>
                {service.available && (
                  <Tag color="green">Available</Tag>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} services`
            }
          />
        </div>
      )}

      {/* Service Details Modal */}
      <Modal
        title={selectedService?.name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="request" 
            type="primary" 
            onClick={() => {
              setModalVisible(false);
              handleRequestService(selectedService?.id);
            }}
          >
            Request This Service
          </Button>
        ]}
        width={600}
      >
        {selectedService && (
          <div>
            <Paragraph>{selectedService.description}</Paragraph>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={12}>
                <Text strong>Price: </Text>
                <Text>{formatPrice(selectedService.price)}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Duration: </Text>
                <Text>{formatDuration(selectedService.estimated_duration)}</Text>
              </Col>
              {selectedService.category && (
                <Col span={12}>
                  <Text strong>Category: </Text>
                  <Text>{selectedService.category}</Text>
                </Col>
              )}
              {selectedService.requirements && (
                <Col span={24}>
                  <Text strong>Requirements: </Text>
                  <Paragraph>{selectedService.requirements}</Paragraph>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* Empty State */}
      {!loading && services.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <ToolOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} type="secondary">No Services Found</Title>
          <Paragraph type="secondary">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'No services are currently available.'}
          </Paragraph>
          <Button type="primary" onClick={() => navigate('/register')}>
            Register to Request Services
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ServicesPage;
