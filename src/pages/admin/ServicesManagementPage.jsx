import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Card,
  Statistic,
  Upload,
  Tag,
  Switch,
  Row,
  Col,
  Space,
  Tooltip,
  Image,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { servicesService } from '../../services/servicesService';

const { TextArea } = Input;
const { Option } = Select;

const ServicesManagementPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [serviceImages, setServiceImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (service) => {
    if (!service) return null;
    
    if (service.featured_image) {
      // If featured_image is a full URL, use it directly
      if (typeof service.featured_image === 'string' && service.featured_image.startsWith('http')) {
        return service.featured_image;
      }
      // If it's a relative path, construct the full URL
      if (typeof service.featured_image === 'string') {
        return `${window.location.origin}${service.featured_image}`;
      }
    }

    if (service.image_url && service.has_image) {
      // If image_url is a full URL, use it directly
      if (typeof service.image_url === 'string' && service.image_url.startsWith('http')) {
        return service.image_url;
      }
      // If it's a relative path, construct the full URL
      if (typeof service.image_url === 'string') {
        return `${window.location.origin}${service.image_url}`;
      }
    }

    return null;
  };

  // Fetch services with enhanced error handling
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await servicesService.getTestServices();
      const formattedData = Array.isArray(data) ? data : data?.results || [];
      setServices(formattedData);
    } catch (error) {
      message.error(error.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Fetch service statistics
  const fetchStatistics = async () => {
      const stats = await servicesService.getTestServicesStatistics();
      setStatistics(stats);
    
  };

  // Fetch service images
  const fetchServiceImages = async (serviceId) => {
    if (!serviceId) return;
    setImageLoading(true);
    try {
      const images = await servicesService.getServiceImages(serviceId);
      setServiceImages(Array.isArray(images) ? images : []);
    } catch (error) {
      message.error('فشل في جلب صور الخدمة');
      setServiceImages([]);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchStatistics();
  }, []);

  // Enhanced add/update service with file handling
  const addService = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Handle file uploads
      const processedValues = { ...values };

      // Handle featured image
      if (values.featured_image && values.featured_image[0]) {
        processedValues.featured_image = {
          file: values.featured_image[0].originFileObj
        };
      }

      if (editingId) {
        await servicesService.updateTestService(editingId, processedValues);
        message.success('تم تحديث الخدمة بنجاح');

        // Update local state
        setServices(prevServices =>
          prevServices.map(service =>
            service.id === editingId
              ? { ...service, ...values, featured_image: undefined }
              : service
          )
        );
      } else {
        const newService = await servicesService.createTestService(processedValues);
        message.success('تم إضافة الخدمة بنجاح');
        setServices(prevServices => [...prevServices, newService]);
      }

      handleCancel();
      fetchStatistics(); // Refresh statistics
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced API error handling
  const handleApiError = (error) => {
    if (error?.response?.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([field, errs]) => {
            const errorList = Array.isArray(errs) ? errs.join(', ') : errs;
            return `${field}: ${errorList}`;
          })
          .join('\n');
        message.error(messages);
      } else {
        message.error(data.toString());
      }
    } else {
      message.error(error.message || 'حدث خطأ أثناء الحفظ');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id) => {
    try {
      await servicesService.toggleFeatured(id);
      message.success('تم تحديث حالة الإبراز بنجاح');

      // Update local state
      setServices(prevServices =>
        prevServices.map(service =>
          service.id === id
            ? { ...service, is_featured: !service.is_featured }
            : service
        )
      );
    } catch (error) {
      message.error('فشل في تحديث حالة الإبراز');
    }
  };

  // Toggle service status
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await servicesService.toggleStatus(id, newStatus);
      message.success('تم تحديث حالة الخدمة بنجاح');

      // Update local state
      setServices(prevServices =>
        prevServices.map(service =>
          service.id === id
            ? { ...service, status: newStatus }
            : service
        )
      );
    } catch (error) {
      message.error('فشل في تحديث حالة الخدمة');
    }
  };

  const editService = (record) => {
    const formData = {
      name: record.name || '',
      service_code: record.service_code || '',
      category: record.category || '',
      status: record.status || 'active',
      base_price: record.base_price || 0,
      estimated_duration: record.estimated_duration || '',
      contact_email: record.contact_email || record.email || '',
      contact_phone: record.contact_phone || record.phone || '',
      description: record.description || record.short_description || '',
      is_free: record.is_free
    };

    form.setFieldsValue(formData);
    setEditingId(record.id);
    setVisible(true);
  };

  const removeService = async (id) => {
    try {
      setLoading(true);
      await servicesService.deleteTestService(id);
      message.success('تم حذف الخدمة بنجاح');
      setServices(prevServices => prevServices.filter(service => service.id !== id));
      fetchStatistics(); // Refresh statistics
    } catch (error) {
      message.error(error.message || 'حدث خطأ أثناء الحذف');
    } finally {
      setLoading(false);
    }
  };

  // View service images
  const viewServiceImages = async (service) => {
    setSelectedService(service);
    await fetchServiceImages(service.id);
    setImageModalVisible(true);
  };

  // Upload additional images
  const handleImageUpload = async (file) => {
    if (!selectedService) return;

    try {
      const imageData = {
        image: file,
        is_primary: false
      };

      await servicesService.uploadServiceImage(selectedService.id, imageData);
      message.success('تم رفع الصورة بنجاح');
      await fetchServiceImages(selectedService.id); // Refresh images
    } catch (error) {
      message.error('فشل في رفع الصورة');
    }
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const columns = [
    {
      title: 'صورة',
      dataIndex: 'featured_image',
      key: 'image',
      width: 80,
      render: (_, record) => {
        const imageUrl = getImageUrl(record);
        return (
          <div style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                width={50}
                height={50}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            ) : (
              <div style={{
                width: 50,
                height: 50,
                background: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#999'
              }}>
                {record.service_code?.substring(0, 2) || record.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'اسم الخدمة',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.is_featured && <StarFilled style={{ color: '#faad14' }} />}
          {text}
        </Space>
      ),
    },
    {
      title: 'كود الخدمة',
      dataIndex: 'service_code',
      key: 'service_code',
    },
    {
      title: 'الفئة',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const categoryMap = {
          testing: 'اختبارات وتحاليل',
          consultation: 'استشارات',
          equipment_access: 'الوصول إلى المعدات',
          sample_analysis: 'تحليل العينات',
          calibration: 'خدمات المعايرة',
          training: 'تدريب تقني',
          research_support: 'دعم البحث',
          other: 'خدمات أخرى'
        };
        return categoryMap[category] || category;
      }
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => {
        const desc = text || record?.description || record?.short_description || '';
        return desc ? (
          <Tooltip title={desc}>
            <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {desc}
            </div>
          </Tooltip>
        ) : '---';
      }
    },
    {
      title: 'السعر',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (price, record) => {
        if (record.is_free) return <Tag color="green">مجاني</Tag>;
        return price ? `${price} ج.م` : '---';
      },
    },
    {
      title: 'المدة المقدرة',
      dataIndex: 'estimated_duration',
      key: 'estimated_duration',
      render: (duration) => duration ? `${duration} دقيقة` : '---',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space>
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active' ? 'نشط' : 'غير نشط'}
          </Tag>
          <Switch
            size="small"
            checked={status === 'active'}
            onChange={() => toggleStatus(record.id, status)}
          />
        </Space>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="عرض الصور">
            <Button
              icon={<EyeOutlined />}
              onClick={() => viewServiceImages(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title={record.is_featured ? "إلغاء الإبراز" : "إبراز الخدمة"}>
            <Button
              icon={record.is_featured ? <StarFilled /> : <StarOutlined />}
              onClick={() => toggleFeatured(record.id)}
              size="small"
              type={record.is_featured ? "primary" : "default"}
            />
          </Tooltip>
          <Tooltip title="تعديل">
            <Button
              icon={<EditOutlined />}
              onClick={() => editService(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Popconfirm
              title="هل أنت متأكد من حذف هذه الخدمة؟"
              onConfirm={() => removeService(record.id)}
              okText="نعم"
              cancelText="لا"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>إدارة الخدمات</h1>
      <p style={{ marginBottom: 24 }}>إدارة الخدمات العضوية وطلبات العملاء والتميز</p>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="إجمالي الخدمات"
              value={services.length}
              suffix="✅"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="الخدمات النشطة"
              value={services.filter(s => s.status === 'active').length}
              suffix="🟢"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="الخدمات المميزة"
              value={services.filter(s => s.is_featured).length}
              suffix="⭐"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="الخدمات المجانية"
              value={services.filter(s => s.is_free).length}
              suffix="🆓"
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setVisible(true)}
        >
          إضافة خدمة جديدة
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={services}
        loading={loading}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      {/* Add/Edit Service Modal */}
      <Modal
        title={editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
        open={visible}
        onOk={addService}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="اسم الخدمة"
                rules={[{ required: true, message: 'يرجى إدخال اسم الخدمة' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="service_code"
                label="كود الخدمة"
                rules={[{ required: true, message: 'يرجى إدخال كود الخدمة' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="الفئة"
                rules={[{ required: true, message: 'يرجى اختيار الفئة' }]}
              >
                <Select>
                  <Option value="testing">اختبارات وتحاليل</Option>
                  <Option value="consultation">استشارات</Option>
                  <Option value="equipment_access">الوصول إلى المعدات</Option>
                  <Option value="sample_analysis">تحليل العينات</Option>
                  <Option value="calibration">خدمات المعايرة</Option>
                  <Option value="training">تدريب تقني</Option>
                  <Option value="research_support">دعم البحث</Option>
                  <Option value="other">خدمات أخرى</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="الحالة"
                rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
              >
                <Select>
                  <Option value="active">نشط</Option>
                  <Option value="inactive">غير نشط</Option>
                  <Option value="pending">قيد المراجعة</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>

            <Col span={12}>
              <Form.Item
                name="base_price"
                label="السعر الأساسي"
                rules={[{ required: true, message: 'يرجى إدخال سعر الخدمة' }]}
              >
                <Input type="number" addonAfter="ج.م" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimated_duration"
                label="المدة المقدرة"
              >
                <Input addonAfter="يوم" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contact_phone"
                label="هاتف التواصل"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="contact_email"
            label="البريد الإلكتروني للتواصل"
            rules={[{ type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="وصف مختصر"
            rules={[{ required: true, message: 'يرجى إدخال وصف' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="featured_image"
            label="الصورة الرئيسية"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>رفع صورة</div>
              </div>
            </Upload>
          </Form.Item>

          {/* Show current image when editing */}
          {editingId && selectedService && getImageUrl(selectedService) && (
            <Form.Item label="الصورة الحالية">
              <Image
                src={getImageUrl(selectedService)}
                alt="Current service image"
                width={150}
                height={100}
                style={{ objectFit: 'cover', borderRadius: '8px' }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Service Images Modal */}
      <Modal
        title={`صور الخدمة: ${selectedService?.name}`}
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Upload
            beforeUpload={handleImageUpload}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>إضافة صورة جديدة</Button>
          </Upload>
        </div>

        {/* Main service image */}
        {selectedService && getImageUrl(selectedService) && (
          <div style={{ marginBottom: 16 }}>
            <h4>الصورة الرئيسية:</h4>
            <Image
              src={getImageUrl(selectedService)}
              width={200}
              height={150}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </div>
        )}

        <Row gutter={[16, 16]}>
          {serviceImages.map((image, index) => (
            <Col span={8} key={index}>
              <div style={{ textAlign: 'center' }}>
                <Image
                  width={200}
                  height={150}
                  src={image.image}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
                {image.is_primary && (
                  <Tag color="gold" style={{ marginTop: 8 }}>صورة رئيسية</Tag>
                )}
              </div>
            </Col>
          ))}
        </Row>

        {serviceImages.length === 0 && !getImageUrl(selectedService) && (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <p>لا توجد صور لهذه الخدمة</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServicesManagementPage;