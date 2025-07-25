import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Space,
  Modal,
  Form,
  InputNumber,
  message,
  Tooltip,
  Typography,
  Statistic,
  DatePicker,
  Divider
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  DollarOutlined,
  UserOutlined,
  BookOutlined
} from '@ant-design/icons';
import { EnrollmentService } from '../../services';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 10,
    search: '',
    course_id: '',
    payment_status: '',
    status: ''
  });
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Modal states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    loadEnrollments();
    loadStats();
  }, [filters]);

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const response = await EnrollmentService.getEnrollments(filters);
      setEnrollments(response.results || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      message.error('فشل في تحميل التسجيلات');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await EnrollmentService.getEnrollmentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleTableChange = (pagination) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      page_size: pagination.pageSize
    }));
  };

  const handleUpdatePayment = (enrollment) => {
    setSelectedEnrollment(enrollment);
    paymentForm.setFieldsValue({
      amount_paid: enrollment.amount_paid,
      payment_method: enrollment.payment_method || '',
      payment_reference: enrollment.payment_reference || '',
      admin_notes: enrollment.admin_notes || ''
    });
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async (values) => {
    try {
      await EnrollmentService.updatePayment(selectedEnrollment.id, values);
      message.success('تم تحديث معلومات الدفع بنجاح');
      setPaymentModalVisible(false);
      loadEnrollments();
      loadStats();
    } catch (error) {
      message.error(error.message || 'فشل في تحديث معلومات الدفع');
    }
  };

  const handleMarkCompleted = async (enrollmentId) => {
    try {
      await EnrollmentService.markCompleted(enrollmentId);
      message.success('تم تحديد التسجيل كمكتمل');
      loadEnrollments();
      loadStats();
    } catch (error) {
      message.error('فشل في تحديث حالة التسجيل');
    }
  };

  const handleDeleteEnrollment = (enrollmentId) => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا التسجيل؟ لا يمكن التراجع عن هذا الإجراء.',
      okText: 'نعم، احذف',
      cancelText: 'إلغاء',
      okType: 'danger',
      onOk: async () => {
        try {
          await EnrollmentService.deleteEnrollment(enrollmentId);
          message.success('تم حذف التسجيل بنجاح');
          loadEnrollments();
          loadStats();
        } catch (error) {
          message.error('فشل في حذف التسجيل');
        }
      }
    });
  };

  const handleExportPDF = async () => {
    try {
      await EnrollmentService.exportEnrollmentsPDF(filters);
      message.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      message.error('فشل في تصدير التقرير');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'في الانتظار' },
      approved: { color: 'green', text: 'مقبول' },
      rejected: { color: 'red', text: 'مرفوض' },
      completed: { color: 'blue', text: 'مكتمل' },
      cancelled: { color: 'default', text: 'ملغي' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPaymentStatusTag = (status) => {
    const statusConfig = {
      not_required: { color: 'green', text: 'غير مطلوب' },
      pending: { color: 'orange', text: 'في الانتظار' },
      paid: { color: 'green', text: 'مدفوع' },
      partial: { color: 'blue', text: 'مدفوع جزئياً' },
      refunded: { color: 'purple', text: 'مسترد' },
      overdue: { color: 'red', text: 'متأخر' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'المشارك',
      key: 'participant',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.user ? 
              `${record.user.first_name} ${record.user.last_name}` : 
              `${record.first_name} ${record.last_name}`
            }
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.user?.email || record.email}
          </div>
          {record.phone && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'الدورة',
      key: 'course',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.course?.course_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.course?.course_code}
          </div>
        </div>
      ),
    },
    {
      title: 'تاريخ التسجيل',
      dataIndex: 'enrollment_date',
      key: 'enrollment_date',
      render: (date) => new Date(date).toLocaleDateString('ar-EG'),
      sorter: true,
    },
    {
      title: 'حالة التسجيل',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'حالة الدفع',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status) => getPaymentStatusTag(status),
    },
    {
      title: 'المبلغ',
      key: 'payment',
      render: (_, record) => (
        <div>
          <div>{record.amount_paid} / {record.amount_due} جنيه</div>
          {record.amount_due > 0 && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              متبقي: {record.amount_due - record.amount_paid} جنيه
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="تحديث الدفع">
            <Button
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleUpdatePayment(record)}
            />
          </Tooltip>
          
          {record.status !== 'completed' && (
            <Tooltip title="تحديد كمكتمل">
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleMarkCompleted(record.id)}
              />
            </Tooltip>
          )}
          
          <Tooltip title="حذف">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteEnrollment(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="enrollment-management">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="إجمالي التسجيلات"
              value={stats.total_enrollments || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="التسجيلات المكتملة"
              value={stats.completed_enrollments || 0}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="المدفوعات المعلقة"
              value={stats.pending_payments || 0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="إجمالي الإيرادات"
              value={stats.total_revenue || 0}
              suffix="جنيه"
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input.Search
              placeholder="البحث في التسجيلات..."
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={4}>
            <Select
              placeholder="حالة الدفع"
              allowClear
              onChange={(value) => handleFilterChange('payment_status', value)}
              style={{ width: '100%' }}
            >
              <Option value="pending">في الانتظار</Option>
              <Option value="paid">مدفوع</Option>
              <Option value="partial">مدفوع جزئياً</Option>
              <Option value="overdue">متأخر</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={4}>
            <Select
              placeholder="حالة التسجيل"
              allowClear
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: '100%' }}
            >
              <Option value="pending">في الانتظار</Option>
              <Option value="approved">مقبول</Option>
              <Option value="completed">مكتمل</Option>
              <Option value="cancelled">ملغي</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={8}>
            <Space>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportPDF}
              >
                تصدير PDF
              </Button>
              
              {selectedRowKeys.length > 0 && (
                <Button
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: 'حذف التسجيلات المحددة',
                      content: `هل أنت متأكد من حذف ${selectedRowKeys.length} تسجيل؟`,
                      onOk: async () => {
                        // Implement bulk delete
                        message.info('جاري تطوير هذه الميزة');
                      }
                    });
                  }}
                >
                  حذف المحدد ({selectedRowKeys.length})
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={enrollments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.page_size,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} من ${total} تسجيل`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Payment Update Modal */}
      <Modal
        title={`تحديث معلومات الدفع - ${selectedEnrollment?.first_name} ${selectedEnrollment?.last_name}`}
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedEnrollment && (
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={handlePaymentSubmit}
          >
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>الدورة:</Text> {selectedEnrollment.course?.course_name}
                </Col>
                <Col span={12}>
                  <Text strong>المبلغ المطلوب:</Text> {selectedEnrollment.amount_due} جنيه
                </Col>
              </Row>
            </div>

            <Form.Item
              label="المبلغ المدفوع"
              name="amount_paid"
              rules={[{ required: true, message: 'يرجى إدخال المبلغ المدفوع' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={selectedEnrollment?.amount_due}
                precision={2}
                addonAfter="جنيه"
              />
            </Form.Item>

            <Form.Item
              label="طريقة الدفع"
              name="payment_method"
            >
              <Select placeholder="اختر طريقة الدفع">
                <Option value="cash">نقدي</Option>
                <Option value="bank_transfer">تحويل بنكي</Option>
                <Option value="credit_card">بطاقة ائتمان</Option>
                <Option value="other">أخرى</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="مرجع الدفع"
              name="payment_reference"
            >
              <Input placeholder="رقم المرجع أو رقم المعاملة" />
            </Form.Item>

            <Form.Item
              label="ملاحظات إدارية"
              name="admin_notes"
            >
              <TextArea
                rows={3}
                placeholder="ملاحظات داخلية للاستخدام الإداري..."
              />
            </Form.Item>

            <Alert
              message="ملاحظة"
              description="لن يتم إرسال إشعار بالبريد الإلكتروني للمشارك. قد تحتاج للتواصل معه مباشرة لتأكيد الدفع."
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <Form.Item>
              <Space>
                <Button onClick={() => setPaymentModalVisible(false)}>
                  إلغاء
                </Button>
                <Button type="primary" htmlType="submit">
                  تحديث الدفع
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default EnrollmentManagement;
