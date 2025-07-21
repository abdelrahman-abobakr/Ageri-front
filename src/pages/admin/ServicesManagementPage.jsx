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
  Checkbox
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getCategories,
  getStatuses
} from '../../services/servicesApi';

const { TextArea } = Input;
const { Option } = Select;

const ServicesManagementPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

 const fetchServices = async () => {
  setLoading(true);
  try {
    const data = await getServices();
    const formattedData = Array.isArray(data) ? data : data?.results || [];
    setServices(formattedData);
  } catch (error) {
    message.error(error.message || 'حدث خطأ أثناء جلب البيانات');
  } finally {
    setLoading(false);
  }
};

  const fetchDropdowns = async () => {
    try {
      const [cats, stats] = await Promise.all([
        getCategories(),
        getStatuses()
      ]);
      setCategories(cats);
      setStatuses(stats);
    } catch (error) {
      message.error('حدث خطأ أثناء جلب القوائم');
    }
  };

  useEffect(() => {
    fetchServices();
    fetchDropdowns();
  }, []);

 const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    setLoading(true);

    console.log('Form values before submission:', values);

    if (editingId) {
      try {
        await updateService(editingId, values);
        message.success('تم تحديث الخدمة بنجاح');
        setServices(prevServices => 
          prevServices.map(service => 
            service.id === editingId ? { ...service, ...values } : service
          )
        );
        setVisible(false);
        form.resetFields();
      } catch (error) {
        handleApiError(error);
      }
    } else {
      try {
        const newService = await createService(values);
        message.success('تم إضافة الخدمة بنجاح');
        setServices(prevServices => [...prevServices, newService]);
        setVisible(false);
        form.resetFields();
      } catch (error) {
        handleApiError(error);
      }
    }
  } finally {
    setLoading(false);
  }
};

// Helper to show backend validation errors
const handleApiError = (error) => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data === 'object') {
      const messages = Object.entries(data)
        .map(([field, errs]) => Array.isArray(errs) ? errs.join(', ') : errs)
        .join('\n');
      message.error(messages);
    } else {
      message.error(data.toString());
    }
  } else {
    message.error(error.message || 'حدث خطأ أثناء الحفظ');
  }
};
  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      is_free: record.is_free ? 'true' : 'false'
    });
    setEditingId(record.id);
    setVisible(true);
  };

  const handleDelete = async (id) => {
  try {
    setLoading(true);
    await deleteService(id);
    message.success('تم حذف الخدمة بنجاح');
    setServices(prevServices => prevServices.filter(service => service.id !== id));
  } catch (error) {
    message.error(error.message || 'حدث خطأ أثناء الحذف');
  } finally {
    setLoading(false);
  }
};
  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const columns = [
    {
      title: 'اسم الخدمة',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => {
        // Try to get description from record if not present directly
        const desc = text || record?.description || record?.short_description || '';
        return desc ? (
          <div style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {desc}
          </div>
        ) : '---';
      }
    },
    {
      title: 'السعر',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (price) => price ? `${price} ر.س` : 'مجاني',
    },
    {
      title: 'المدة المقدرة',
      dataIndex: 'estimated_duration',
      key: 'estimated_duration',
      render: (duration) => duration || '---',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'نشط' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>إدارة الخدمات</h1>
      <p style={{ marginBottom: 24 }}>إدارة الخدمات العضوية وطلبات العملاء والتمييز</p>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* <Card>
            <Statistic title="الخدمات الشخصية" value={0} suffix="✅" />
          </Card>
          <Card>
            <Statistic title="الخدمات المشغلة" value={0} suffix="✅" />
          </Card> */}
          <Card>
            <Statistic title="إجمالي الخدمات" value={services.length} suffix="✅" />
          </Card>
        </div>
      </div>

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
      />

      <Modal
        title={editingId ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
        open={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={800}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="name"
              label="اسم الخدمة"
              rules={[{ required: true, message: 'يرجى إدخال اسم الخدمة' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="service_code"
              label="كود الخدمة"
              rules={[{ required: true, message: 'يرجى إدخال كود الخدمة' }]}
            >
              <Input />
            </Form.Item>

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

            <Form.Item
              name="base_price"
              label="السعر الأساسي"
              rules={[{ required: true, message: 'يرجى إدخال سعر الخدمة' }]}
            >
              <Input type="number" addonAfter="ر.س" />
            </Form.Item>

           

            <Form.Item
              name="estimated_duration"
              label="المدة المقدرة"
            >
              <Input addonAfter="دقيقة" />
            </Form.Item>

            <Form.Item
              name="contact_email"
              label="البريد الإلكتروني للتواصل"
              rules={[{ type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="contact_phone"
              label="هاتف التواصل"
            >
              <Input />
            </Form.Item>
          </div>

          {/* <Form.Item
            name="description"
            label="الوصف"
          >
            <TextArea rows={3} />
          </Form.Item> */}

          <Form.Item
            name="description"
            label="وصف مختصر"
            rules={[{ required: true, message: 'يرجى إدخال وصف' }]}
          >
            <TextArea rows={2} />
          </Form.Item>
{/* 
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
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>رفع صورة</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="service_brochure"
            label="بروشور الخدمة"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          > */}
            {/* <Upload
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>رفع ملف</Button>
            </Upload> */}
          {/* </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default ServicesManagementPage;