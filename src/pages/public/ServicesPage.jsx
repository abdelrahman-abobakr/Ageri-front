import { useState, useEffect } from 'react';
import {
  Card, List, Input, Button, Tag, Typography, Row, Col, Pagination, Modal,
  Divider, Space, Avatar
} from 'antd';
import {
  SearchOutlined, ToolOutlined, DollarOutlined, ClockCircleOutlined,
  PhoneOutlined, MailOutlined, CodeOutlined, FileTextOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
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
      // Only show active services
      const activeServices = (response.results || []).filter(s => s.status === 'active' || s.status === 'نشط');
      setServices(activeServices);
      setTotal(activeServices.length);
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
    if (!price) return 'مجاني';
    return `${price} ج.م`;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'غير محدد';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours} ساعة ${minutes > 0 ? `و ${minutes} دقيقة` : ''}`;
    }
    return `${duration} دقيقة`;
  };

  const ServiceDetailItem = ({ icon, label, value, type = 'text' }) => (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '12px 0',
      borderBottom: '1px solid #f0f0f0'
    }}>
      <div style={{
        marginRight: '24px',
        marginTop: '2px',
        color: '#1890ff',
        fontSize: '16px',
        minWidth: '20px'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <Text strong style={{ display: 'block', marginBottom: '4px', color: '#595959' }}>
          {label}
        </Text>
        {type === 'email' ? (
          <a href={`mailto:${value}`} style={{ color: '#1890ff' }}>
            {value}
          </a>
        ) : type === 'phone' ? (
          <a href={`tel:${value}`} style={{ color: '#1890ff' }}>
            {value}
          </a>
        ) : (
          <Text style={{ color: '#262626', fontSize: '14px', lineHeight: '1.6' }}>
            {value || 'غير متوفر'}
          </Text>
        )}
      </div>
    </div>
  );

  const renderServiceModal = () => (
    <Modal
      title={null}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setModalVisible(false)}>
          إغلاق
        </Button>
      ]}
      width={700}
      style={{ top: 20 }}
    >
      {selectedService && (
        <div>
          {/* Header */}

          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
            margin: '-24px -24px 24px -24px',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              margin: '0 auto 12px auto' // Ensure centering
            }}>
              <div style={{
                fontSize: '24px',
                color: 'white',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
                {selectedService.service_code || selectedService.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <Title
              level={3}
              style={{
                color: 'white',
                margin: '0 auto',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                textAlign: 'center',
                width: '100%'
              }}
            >
              {selectedService.name}
            </Title>

            {selectedService.service_code && (
              <Tag
                color="white"
                style={{
                  color: '#1890ff',
                  marginTop: '8px',
                  fontWeight: 'bold',
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                {selectedService.service_code}
              </Tag>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '0 8px' }}>
            {/* Description */}
            {selectedService.description && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <FileTextOutlined style={{
                    color: '#1890ff',
                    fontSize: '18px',
                    marginRight: '12px'
                  }} />
                  <Text strong style={{ fontSize: '16px' }}>وصف الخدمة</Text>
                </div>
                <Card
                  size="small"
                  style={{
                    background: '#fafafa',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <Paragraph style={{ margin: 0, lineHeight: '1.8' }}>
                    {selectedService.description}
                  </Paragraph>
                </Card>
              </div>
            )}

            {/* Service Details */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{
                color: '#1890ff',
                marginBottom: '16px',
                fontSize: '16px'
              }}>
                <ToolOutlined style={{ marginRight: '12px' }} />
                تفاصيل الخدمة
              </Title>

              <Card size="small" style={{ background: '#fff' }}>
                <ServiceDetailItem
                  icon={<DollarOutlined />}
                  label="السعر"
                  value={formatPrice(selectedService.base_price)}
                />

                <ServiceDetailItem
                  icon={<ClockCircleOutlined />}
                  label="المدة المقدرة"
                  value={formatDuration(selectedService.estimated_duration)}
                />

                {selectedService.sample_requirements && (
                  <ServiceDetailItem
                    icon={<ExperimentOutlined />}
                    label="متطلبات العينة"
                    value={selectedService.sample_requirements}
                  />
                )}
              </Card>
            </div>

            {/* Contact Information */}
            <div>
              <Title level={5} style={{
                color: '#1890ff',
                marginBottom: '16px',
                fontSize: '16px'
              }}>
                <PhoneOutlined style={{ marginRight: '12px' }} />
                معلومات التواصل
              </Title>

              <Card size="small" style={{ background: '#fff' }}>
                <ServiceDetailItem
                  icon={<MailOutlined />}
                  label="البريد الإلكتروني"
                  value={selectedService.contact_email}
                  type="email"
                />

                <ServiceDetailItem
                  icon={<PhoneOutlined />}
                  label="رقم الهاتف"
                  value={selectedService.contact_phone}
                  type="phone"
                />
              </Card>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

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
                    background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {service.service_code || service.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              }
              onClick={() => handleServiceDetails(service)}
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
                    {formatPrice(service.base_price)}
                  </Text>
                </div>
              </div>

              <Paragraph
                ellipsis={{ rows: 3 }}
                style={{ marginBottom: '16px' }}
              >
                {service.short_description || service.description || 'لا يوجد وصف.'}
              </Paragraph>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">
                  <ClockCircleOutlined style={{ marginRight: '4px' }} />
                  {formatDuration(service.estimated_duration)}
                </Text>
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
      {renderServiceModal()}

      {/* Empty State */}
      {!loading && services.length === 0 && (
        <Card
          style={{
            textAlign: 'center',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            direction: document.documentElement.dir || 'ltr',
          }}
        >
          <ToolOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} type="secondary">{t('services.noServices')}</Title>
          <Paragraph type="secondary">
            {searchTerm
              ? t('announcements.tryAdjusting')
              : t('services.noServicesDesc')}
          </Paragraph>
        </Card>
      )}
    </div>
  );
};

export default ServicesPage;