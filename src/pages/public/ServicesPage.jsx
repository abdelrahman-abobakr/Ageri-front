import { useState, useEffect } from 'react';
import {
  Card, List, Input, Button, Tag, Typography, Row, Col, Pagination, Modal,
  Divider, Space, Avatar, Select, Spin, Empty, Image
} from 'antd';
import {
  SearchOutlined, ToolOutlined, DollarOutlined, ClockCircleOutlined,
  PhoneOutlined, MailOutlined, CodeOutlined, FileTextOutlined,
  ExperimentOutlined, FilterOutlined, StarFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { servicesService } from '../../services';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const ServicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [featuredServices, setFeaturedServices] = useState([]);
  const pageSize = 12;

  const categories = [
    { value: '', label: 'جميع الفئات' },
    { value: 'testing', label: 'اختبارات وتحاليل' },
    { value: 'consultation', label: 'استشارات' },
    { value: 'equipment_access', label: 'الوصول إلى المعدات' },
    { value: 'sample_analysis', label: 'تحليل العينات' },
    { value: 'calibration', label: 'خدمات المعايرة' },
    { value: 'training', label: 'تدريب تقني' },
    { value: 'research_support', label: 'دعم البحث' },
    { value: 'other', label: 'خدمات أخرى' }
  ];

  // Helper function to get full image URL
  const getImageUrl = (service) => {
    if (service.featured_image) {
      // If featured_image is a full URL, use it directly
      if (service.featured_image.startsWith('http')) {
        return service.featured_image;
      }
      // If it's a relative path, construct the full URL
      return `${window.location.origin}${service.featured_image}`;
    }

    if (service.image_url && service.has_image) {
      // If image_url is a full URL, use it directly
      if (service.image_url.startsWith('http')) {
        return service.image_url;
      }
      // If it's a relative path, construct the full URL
      return `${window.location.origin}${service.image_url}`;
    }

    return null;
  };

  const loadServices = async (page = 1, search = '', category = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
        status: 'active', // Only load active services
      };

      if (search) params.search = search;
      if (category) params.category = category;

      const response = await servicesService.getTestServices(params);
      const serviceData = response.results || response || [];

      // Ensure we only show active services
      const activeServices = Array.isArray(serviceData) ?
        serviceData.filter(s => s.status === 'active') : [];

      setServices(activeServices);
      setTotal(response.count || activeServices.length);
    } catch (error) {
      setServices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedServices = async () => {
    try {
      const response = await servicesService.getFeaturedServices();
      const featuredData = response.results || response || [];
      setFeaturedServices(Array.isArray(featuredData) ? featuredData : []);
    } catch (error) {
      setFeaturedServices([]);
    }
  };

  useEffect(() => {
    loadServices(currentPage, searchTerm, selectedCategory);
    loadFeaturedServices();
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
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
        message: 'الرجاء تسجيل الدخول لطلب الخدمات'
      }
    });
  };

  const formatPrice = (service) => {
    if (service.is_free) return 'مجاني';
    if (service.display_price) return service.display_price;
    if (service.base_price) return `${service.base_price} جنيه`;
    return 'غير محدد';
  };

  const formatDuration = (duration) => {
    if (!duration) return 'غير محدد';
    return duration;
  };

  const getCategoryText = (category) => {
    const categoryMap = {
      'testing': 'اختبارات وتحاليل',
      'consultation': 'استشارات',
      'equipment_access': 'الوصول إلى المعدات',
      'sample_analysis': 'تحليل العينات',
      'calibration': 'خدمات المعايرة',
      'training': 'تدريب تقني',
      'research_support': 'دعم البحث',
      'other': 'خدمات أخرى'
    };
    return categoryMap[category] || category;
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
        {type === 'email' && value ? (
          <a href={`mailto:${value}`} style={{ color: '#1890ff' }}>
            {value}
          </a>
        ) : type === 'phone' && value ? (
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

  const renderServiceCard = (service) => {
    const imageUrl = getImageUrl(service);

    return (
      <Card
        key={service.id}
        hoverable
        style={{
          height: '100%',
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto'
        }}
        cover={
          <div
            style={{
              height: 220,
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px 8px 0 0'
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={service.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  backgroundColor: '#f5f5f5'
                }}
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Fallback gradient background and text */}
            <div
              style={{
                position: imageUrl ? 'absolute' : 'static',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                display: imageUrl ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
                  {service.service_code ?
                    service.service_code.substring(0, 2) :
                    service.name.charAt(0).toUpperCase()
                  }
                </div>
              </div>
            </div>

            {/* Featured badge overlay */}
            {service.is_featured && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#faad14',
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 10
              }}>
                <StarFilled style={{ color: 'white', fontSize: '12px' }} />
              </div>
            )}
          </div>
        }
        onClick={() => handleServiceDetails(service)}
      >
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <Title level={5} style={{ marginBottom: '4px', flex: 1 }} ellipsis>
              {service.name}
            </Title>
            {service.service_code && (
              <Tag color="blue" style={{ marginLeft: '8px' }}>
                {service.service_code}
              </Tag>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {service.category && (
              <Tag color="geekblue">{getCategoryText(service.category)}</Tag>
            )}
            <Text type="secondary">
              <DollarOutlined style={{ marginRight: '4px' }} />
              {formatPrice(service)}
            </Text>
          </div>
        </div>

        <Paragraph
          ellipsis={{ rows: 3 }}
          style={{ marginBottom: '16px', minHeight: '66px' }}
        >
          {service.description || 'لا يوجد وصف متاح.'}
        </Paragraph>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">
            <ClockCircleOutlined style={{ marginRight: '4px' }} />
            {formatDuration(service.estimated_duration)}
          </Text>

          <Button
            type="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleServiceDetails(service);
            }}
          >
            عرض التفاصيل
          </Button>
        </div>
      </Card>
    );
  };

  const renderServiceModal = () => {
    if (!selectedService) return null;

    const imageUrl = getImageUrl(selectedService);

    return (
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            إغلاق
          </Button>,
          <Button
            key="request"
            type="primary"
            onClick={() => handleRequestService(selectedService?.id)}
          >
            طلب الخدمة
          </Button>
        ]}
        width={700}
        style={{ top: 20 }}
      >
        <div>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            padding: '24px 0',
            background: imageUrl
              ? `linear-gradient(rgba(24, 144, 255, 0.8), rgba(64, 169, 255, 0.8)), url(${imageUrl})`
              : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            margin: '-24px -24px 24px -24px',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {selectedService.is_featured && (
              <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#faad14',
                borderRadius: '20px',
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <StarFilled style={{ color: 'white', fontSize: '14px' }} />
                <Text style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                  خدمة مميزة
                </Text>
              </div>
            )}

            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{
                fontSize: '24px',
                color: 'white',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}>
                {selectedService.service_code ?
                  selectedService.service_code.substring(0, 3) :
                  selectedService.name.charAt(0).toUpperCase()
                }
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
                color="rgba(255,255,255,0.2)"
                style={{
                  color: 'white',
                  marginTop: '8px',
                  fontWeight: 'bold',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                {selectedService.service_code}
              </Tag>
            )}
          </div>

          {/* Service Image Display */}
          {imageUrl && (
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <Title level={5} style={{ color: '#1890ff', marginBottom: '16px' }}>
                صورة الخدمة
              </Title>
              <Image
                src={imageUrl}
                alt={selectedService.name}
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </div>
          )}

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
                  value={formatPrice(selectedService)}
                />

                <ServiceDetailItem
                  icon={<ClockCircleOutlined />}
                  label="المدة المقدرة"
                  value={formatDuration(selectedService.estimated_duration)}
                />

                {selectedService.category && (
                  <ServiceDetailItem
                    icon={<ToolOutlined />}
                    label="فئة الخدمة"
                    value={getCategoryText(selectedService.category)}
                  />
                )}

                {selectedService.tags && (
                  <ServiceDetailItem
                    icon={<FileTextOutlined />}
                    label="العلامات"
                    value={selectedService.tags}
                  />
                )}
              </Card>
            </div>

            {/* Contact Information */}
            {(selectedService.contact_email || selectedService.contact_phone) && (
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
                  {selectedService.contact_email && (
                    <ServiceDetailItem
                      icon={<MailOutlined />}
                      label="البريد الإلكتروني"
                      value={selectedService.contact_email}
                      type="email"
                    />
                  )}

                  {selectedService.contact_phone && (
                    <ServiceDetailItem
                      icon={<PhoneOutlined />}
                      label="رقم الهاتف"
                      value={selectedService.contact_phone}
                      type="phone"
                    />
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <ToolOutlined style={{ marginRight: '8px' }} />
          الخدمات المتاحة
        </Title>
        <Paragraph type="secondary">
          استعرض جميع الخدمات المتاحة واطلب ما تحتاج إليه
        </Paragraph>
      </div>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>
            <StarFilled style={{ color: '#faad14', marginRight: '8px' }} />
            الخدمات المميزة
          </Title>
          <Row gutter={[16, 16]}>
            {featuredServices.slice(0, 3).map(service => (
              <Col xs={24} sm={12} lg={8} key={service.id}>
                {renderServiceCard(service)}
              </Col>
            ))}
          </Row>
          <Divider />
        </div>
      )}

      {/* Search and Filter */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="ابحث في الخدمات..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="اختر فئة"
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={handleCategoryChange}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">
              عرض {services.length} من أصل {total} خدمة
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Services Grid */}
      <Spin spinning={loading}>
        {services.length > 0 ? (
          <Row gutter={[24, 24]}>
            {services.map(service => (
              <Col xs={24} sm={12} lg={8} key={service.id}>
                {renderServiceCard(service)}
              </Col>
            ))}
          </Row>
        ) : (
          !loading && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={4} type="secondary">لا توجد خدمات متاحة</Title>
                  <Paragraph type="secondary">
                    {searchTerm || selectedCategory
                      ? 'جرب تعديل معايير البحث أو التصفية'
                      : 'لم يتم العثور على أي خدمات متاحة حالياً'}
                  </Paragraph>
                </div>
              }
              style={{ margin: '40px 0' }}
            />
          )
        )}
      </Spin>

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} من ${total} خدمة`
            }
          />
        </div>
      )}

      {/* Service Details Modal */}
      {renderServiceModal()}
    </div>
  );
};

export default ServicesPage;